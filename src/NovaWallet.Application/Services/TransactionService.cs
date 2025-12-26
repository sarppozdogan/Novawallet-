using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Exceptions;
using NovaWallet.Application.Models;
using NovaWallet.Domain.Entities;
using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly INovaWalletDbContext _dbContext;
    private readonly ILimitService _limitService;
    private readonly IBankGateway _bankGateway;
    private readonly IReferenceCodeGenerator _referenceCodeGenerator;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;
    private readonly FeeSettings _feeSettings;
    private readonly SystemWalletSettings _systemWalletSettings;

    public TransactionService(
        INovaWalletDbContext dbContext,
        ILimitService limitService,
        IBankGateway bankGateway,
        IReferenceCodeGenerator referenceCodeGenerator,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger,
        IOptions<FeeSettings> feeOptions,
        IOptions<SystemWalletSettings> systemWalletOptions)
    {
        _dbContext = dbContext;
        _limitService = limitService;
        _bankGateway = bankGateway;
        _referenceCodeGenerator = referenceCodeGenerator;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
        _feeSettings = feeOptions.Value;
        _systemWalletSettings = systemWalletOptions.Value;
    }

    public async Task<TransactionResult> TopUpAsync(TopUpRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        if (request.Amount <= 0)
        {
            throw new AppException(ErrorCodes.ValidationError, "Amount must be greater than zero.", 400);
        }

        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.Id == request.WalletId, cancellationToken);
        if (wallet is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Wallet not found.", 404);
        }

        if (!wallet.IsActive)
        {
            throw new AppException(ErrorCodes.WalletInactive, "Wallet is inactive.", 400);
        }

        EnsureCurrencyMatch(wallet.CurrencyCode, request.CurrencyCode);
        await _limitService.ValidateAsync(wallet.UserId, TransactionType.TopUp, request.Amount, cancellationToken);

        var referenceCode = _referenceCodeGenerator.Generate();
        var feeAmount = CalculateFee(request.Amount, _feeSettings.TopUpFeeRate);

        var transaction = new Transaction
        {
            SenderWalletId = null,
            ReceiverWalletId = wallet.Id,
            TransactionType = TransactionType.TopUp,
            Amount = request.Amount,
            FeeAmount = feeAmount,
            CurrencyCode = wallet.CurrencyCode,
            Status = TransactionStatus.Pending,
            ReferenceCode = referenceCode,
            TransactionDate = _dateTimeProvider.UtcNow
        };

        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var isApproved = await _bankGateway.RequestTopUpAsync(request.SourceBank, request.Amount, wallet.CurrencyCode, referenceCode, cancellationToken);

        await using var dbTransaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        if (isApproved)
        {
            if (feeAmount > 0)
            {
                var systemWallet = await GetSystemWalletAsync(cancellationToken);
                EnsureCurrencyMatch(systemWallet.CurrencyCode, wallet.CurrencyCode);
                systemWallet.Balance += feeAmount;
            }

            wallet.Balance += request.Amount - feeAmount;
            transaction.Status = TransactionStatus.Success;
        }
        else
        {
            transaction.Status = TransactionStatus.Failed;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await dbTransaction.CommitAsync(cancellationToken);

        await _auditLogger.LogAsync("TOPUP", isApproved, ipAddress, wallet.UserId, transaction.Id.ToString(), null, cancellationToken);

        return new TransactionResult(transaction.Id, transaction.ReferenceCode, transaction.Status);
    }

    public async Task<TransactionResult> P2PAsync(P2PRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        if (request.Amount <= 0)
        {
            throw new AppException(ErrorCodes.ValidationError, "Amount must be greater than zero.", 400);
        }

        var senderWallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.Id == request.SenderWalletId, cancellationToken);
        if (senderWallet is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Sender wallet not found.", 404);
        }

        var receiverWallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.WalletNumber == request.ReceiverWalletNumber, cancellationToken);
        if (receiverWallet is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Receiver wallet not found.", 404);
        }

        if (!senderWallet.IsActive || !receiverWallet.IsActive)
        {
            throw new AppException(ErrorCodes.WalletInactive, "Sender or receiver wallet is inactive.", 400);
        }

        EnsureCurrencyMatch(senderWallet.CurrencyCode, request.CurrencyCode);
        EnsureCurrencyMatch(receiverWallet.CurrencyCode, request.CurrencyCode);

        await _limitService.ValidateAsync(senderWallet.UserId, TransactionType.P2P, request.Amount, cancellationToken);

        var feeAmount = CalculateFee(request.Amount, _feeSettings.P2pFeeRate);
        var totalDebit = request.Amount + feeAmount;

        if (senderWallet.Balance < totalDebit)
        {
            throw new AppException(ErrorCodes.InsufficientBalance, "Insufficient balance.", 400);
        }

        var systemWallet = await GetSystemWalletAsync(cancellationToken);
        EnsureCurrencyMatch(systemWallet.CurrencyCode, request.CurrencyCode);

        var referenceCode = _referenceCodeGenerator.Generate();
        var transactionDate = _dateTimeProvider.UtcNow;

        await using var dbTransaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        senderWallet.Balance -= totalDebit;
        receiverWallet.Balance += request.Amount;
        systemWallet.Balance += feeAmount;

        var transaction = new Transaction
        {
            SenderWalletId = senderWallet.Id,
            ReceiverWalletId = receiverWallet.Id,
            TransactionType = TransactionType.P2P,
            Amount = request.Amount,
            FeeAmount = feeAmount,
            CurrencyCode = senderWallet.CurrencyCode,
            Status = TransactionStatus.Success,
            ReferenceCode = referenceCode,
            TransactionDate = transactionDate
        };

        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await dbTransaction.CommitAsync(cancellationToken);

        await _auditLogger.LogAsync("P2P", true, ipAddress, senderWallet.UserId, transaction.Id.ToString(), null, cancellationToken);

        return new TransactionResult(transaction.Id, transaction.ReferenceCode, transaction.Status);
    }

    public async Task<TransactionResult> WithdrawAsync(WithdrawRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        if (request.Amount <= 0)
        {
            throw new AppException(ErrorCodes.ValidationError, "Amount must be greater than zero.", 400);
        }

        EnsureIbanValid(request.DestinationIban);

        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.Id == request.WalletId, cancellationToken);
        if (wallet is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Wallet not found.", 404);
        }

        if (!wallet.IsActive)
        {
            throw new AppException(ErrorCodes.WalletInactive, "Wallet is inactive.", 400);
        }

        EnsureCurrencyMatch(wallet.CurrencyCode, request.CurrencyCode);
        await _limitService.ValidateAsync(wallet.UserId, TransactionType.Withdraw, request.Amount, cancellationToken);

        var feeAmount = CalculateFee(request.Amount, _feeSettings.WithdrawFeeRate);
        var totalDebit = request.Amount + feeAmount;

        if (wallet.Balance < totalDebit)
        {
            throw new AppException(ErrorCodes.InsufficientBalance, "Insufficient balance.", 400);
        }

        var referenceCode = _referenceCodeGenerator.Generate();
        var transaction = new Transaction
        {
            SenderWalletId = wallet.Id,
            ReceiverWalletId = null,
            TransactionType = TransactionType.Withdraw,
            Amount = request.Amount,
            FeeAmount = feeAmount,
            CurrencyCode = wallet.CurrencyCode,
            Status = TransactionStatus.Pending,
            ReferenceCode = referenceCode,
            TransactionDate = _dateTimeProvider.UtcNow
        };

        await using (var dbTransaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken))
        {
            wallet.Balance -= totalDebit;
            _dbContext.Transactions.Add(transaction);
            await _dbContext.SaveChangesAsync(cancellationToken);
            await dbTransaction.CommitAsync(cancellationToken);
        }

        var bankApproved = await _bankGateway.RequestWithdrawAsync(request.DestinationIban, request.Amount, wallet.CurrencyCode, referenceCode, cancellationToken);

        await using var finalTransaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);
        if (bankApproved)
        {
            var systemWallet = await GetSystemWalletAsync(cancellationToken);
            EnsureCurrencyMatch(systemWallet.CurrencyCode, wallet.CurrencyCode);
            systemWallet.Balance += feeAmount;
            transaction.Status = TransactionStatus.Success;
        }
        else
        {
            wallet.Balance += totalDebit;
            transaction.Status = TransactionStatus.Failed;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await finalTransaction.CommitAsync(cancellationToken);

        await _auditLogger.LogAsync("WITHDRAW", bankApproved, ipAddress, wallet.UserId, transaction.Id.ToString(), null, cancellationToken);

        return new TransactionResult(transaction.Id, transaction.ReferenceCode, transaction.Status);
    }

    public async Task<IReadOnlyList<TransactionSummary>> GetWalletTransactionsAsync(long walletId, CancellationToken cancellationToken = default)
    {
        var walletExists = await _dbContext.Wallets.AnyAsync(w => w.Id == walletId, cancellationToken);
        if (!walletExists)
        {
            throw new AppException(ErrorCodes.NotFound, "Wallet not found.", 404);
        }

        var transactions = await _dbContext.Transactions
            .Where(t => t.SenderWalletId == walletId || t.ReceiverWalletId == walletId)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new TransactionSummary(
                t.Id,
                t.TransactionType,
                t.Amount,
                t.FeeAmount,
                t.Status,
                t.ReferenceCode,
                t.TransactionDate,
                t.CurrencyCode,
                t.ReceiverWalletId == walletId))
            .ToListAsync(cancellationToken);

        return transactions;
    }

    public async Task<TransactionDetail> GetTransactionByIdAsync(Guid transactionId, CancellationToken cancellationToken = default)
    {
        var transaction = await _dbContext.Transactions.FirstOrDefaultAsync(t => t.Id == transactionId, cancellationToken);
        if (transaction is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Transaction not found.", 404);
        }

        var senderWalletNumber = transaction.SenderWalletId.HasValue
            ? await _dbContext.Wallets.Where(w => w.Id == transaction.SenderWalletId.Value).Select(w => w.WalletNumber).FirstOrDefaultAsync(cancellationToken)
            : null;

        var receiverWalletNumber = transaction.ReceiverWalletId.HasValue
            ? await _dbContext.Wallets.Where(w => w.Id == transaction.ReceiverWalletId.Value).Select(w => w.WalletNumber).FirstOrDefaultAsync(cancellationToken)
            : null;

        return new TransactionDetail(
            transaction.Id,
            transaction.TransactionType,
            transaction.Amount,
            transaction.FeeAmount,
            transaction.Status,
            transaction.ReferenceCode,
            transaction.TransactionDate,
            transaction.CurrencyCode,
            senderWalletNumber,
            receiverWalletNumber);
    }

    private async Task<Wallet> GetSystemWalletAsync(CancellationToken cancellationToken)
    {
        var systemWallet = await _dbContext.Wallets
            .FirstOrDefaultAsync(w => w.WalletNumber == _systemWalletSettings.SystemRevenueWalletNumber, cancellationToken);

        if (systemWallet is null)
        {
            throw new AppException(ErrorCodes.NotFound, "System revenue wallet not found.", 500);
        }

        return systemWallet;
    }

    private static void EnsureCurrencyMatch(string walletCurrency, string requestCurrency)
    {
        if (string.IsNullOrWhiteSpace(requestCurrency))
        {
            return;
        }

        if (!string.Equals(walletCurrency, requestCurrency, StringComparison.OrdinalIgnoreCase))
        {
            throw new AppException(ErrorCodes.ValidationError, "Currency mismatch.", 400);
        }
    }

    private static decimal CalculateFee(decimal amount, decimal feeRate)
    {
        var fee = amount * feeRate;
        return decimal.Round(fee, 4, MidpointRounding.AwayFromZero);
    }

    private static void EnsureIbanValid(string iban)
    {
        if (string.IsNullOrWhiteSpace(iban))
        {
            throw new AppException(ErrorCodes.ValidationError, "IBAN is required.", 400);
        }

        var normalized = iban.Replace(" ", string.Empty).ToUpperInvariant();
        if (!normalized.StartsWith("TR", StringComparison.OrdinalIgnoreCase) || normalized.Length != 26)
        {
            throw new AppException(ErrorCodes.ValidationError, "IBAN format is invalid.", 400);
        }

        if (!normalized.Skip(2).All(char.IsDigit))
        {
            throw new AppException(ErrorCodes.ValidationError, "IBAN format is invalid.", 400);
        }
    }
}

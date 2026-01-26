using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Security;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Exceptions;
using NovaWallet.Application.Models;
using NovaWallet.Domain.Entities;
using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Services;

public class AuthService : IAuthService
{
    private readonly INovaWalletDbContext _dbContext;
    private readonly ISmsGateway _smsGateway;
    private readonly IKpsService _kpsService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IWalletNumberGenerator _walletNumberGenerator;
    private readonly IVirtualIbanGenerator _virtualIbanGenerator;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public AuthService(
        INovaWalletDbContext dbContext,
        ISmsGateway smsGateway,
        IKpsService kpsService,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IWalletNumberGenerator walletNumberGenerator,
        IVirtualIbanGenerator virtualIbanGenerator,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger)
    {
        _dbContext = dbContext;
        _smsGateway = smsGateway;
        _kpsService = kpsService;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _walletNumberGenerator = walletNumberGenerator;
        _virtualIbanGenerator = virtualIbanGenerator;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
    }

    public async Task<RegisterStartResult> RegisterStartAsync(RegisterStartRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        var phone = NormalizePhone(request.Phone);

        var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Phone == phone, cancellationToken);
        if (existingUser is not null)
        {
            if (existingUser.Status == UserStatus.Blocked)
            {
                await _auditLogger.LogAsync("REGISTER_START", false, ipAddress, existingUser.Id, null, "User is blocked", cancellationToken);
                throw new AppException(ErrorCodes.Unauthorized, "User is blocked.", 403);
            }

            if (existingUser.Status == UserStatus.Active)
            {
                await _auditLogger.LogAsync("REGISTER_START", false, ipAddress, existingUser.Id, null, "Phone already registered", cancellationToken);
                throw new AppException(ErrorCodes.Conflict, "Phone already registered.", 409);
            }

            await _smsGateway.SendOtpAsync(existingUser.Id, phone, cancellationToken);
            await _auditLogger.LogAsync("REGISTER_START", true, ipAddress, existingUser.Id, null, "OTP re-sent", cancellationToken);
            return new RegisterStartResult(existingUser.Id, existingUser.Status);
        }

        var user = new User
        {
            Phone = phone,
            Status = UserStatus.Pending,
            UserType = UserType.Individual,
            CreatedAt = _dateTimeProvider.UtcNow
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _smsGateway.SendOtpAsync(user.Id, phone, cancellationToken);
        await _auditLogger.LogAsync("REGISTER_START", true, ipAddress, user.Id, null, "OTP sent", cancellationToken);

        return new RegisterStartResult(user.Id, user.Status);
    }

    public async Task<bool> VerifyOtpAsync(VerifyOtpRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        var phone = NormalizePhone(request.Phone);
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Phone == phone, cancellationToken);
        if (user is null)
        {
            await _auditLogger.LogAsync("OTP_VERIFY", false, ipAddress, null, null, "User not found", cancellationToken);
            throw new AppException(ErrorCodes.NotFound, "User not found.", 404);
        }

        if (user.Status == UserStatus.Blocked)
        {
            await _auditLogger.LogAsync("OTP_VERIFY", false, ipAddress, user.Id, null, "User is blocked", cancellationToken);
            throw new AppException(ErrorCodes.Unauthorized, "User is blocked.", 403);
        }

        var isValid = await _smsGateway.VerifyOtpAsync(phone, request.Code, cancellationToken);
        await _auditLogger.LogAsync("OTP_VERIFY", isValid, ipAddress, user.Id, null, isValid ? null : "Invalid OTP", cancellationToken);

        if (!isValid)
        {
            throw new AppException(ErrorCodes.OtpInvalid, "OTP is invalid or expired.", 400);
        }

        return true;
    }

    public async Task<CompleteProfileResult> CompleteProfileAsync(CompleteProfileRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        var phone = NormalizePhone(request.Phone);
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Phone == phone, cancellationToken);
        if (user is null)
        {
            await _auditLogger.LogAsync("PROFILE_COMPLETE", false, ipAddress, null, null, "User not found", cancellationToken);
            throw new AppException(ErrorCodes.NotFound, "User not found.", 404);
        }

        if (user.Status == UserStatus.Blocked)
        {
            await _auditLogger.LogAsync("PROFILE_COMPLETE", false, ipAddress, user.Id, null, "User is blocked", cancellationToken);
            throw new AppException(ErrorCodes.Unauthorized, "User is blocked.", 403);
        }

        if (user.Status == UserStatus.Active)
        {
            await _auditLogger.LogAsync("PROFILE_COMPLETE", false, ipAddress, user.Id, null, "User already active", cancellationToken);
            throw new AppException(ErrorCodes.Conflict, "Profile already completed.", 409);
        }

        var otpVerified = await _dbContext.OtpCodes
            .Where(o => o.Phone == phone && o.IsUsed && o.ExpiresAt >= _dateTimeProvider.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .AnyAsync(cancellationToken);

        if (!otpVerified)
        {
            await _auditLogger.LogAsync("PROFILE_COMPLETE", false, ipAddress, user.Id, null, "OTP not verified", cancellationToken);
            throw new AppException(ErrorCodes.OtpInvalid, "OTP verification required.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            throw new AppException(ErrorCodes.ValidationError, "Password must be at least 6 characters.", 400);
        }

        if (request.UserType == UserType.Individual)
        {
            var name = request.Name?.Trim();
            var surname = request.Surname?.Trim();
            var tckn = request.Tckn?.Trim();
            var dateOfBirth = request.DateOfBirth?.Date;

            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(surname))
            {
                throw new AppException(ErrorCodes.ValidationError, "Name and surname are required for individual users.", 400);
            }

            if (name.Length > 100 || surname.Length > 100)
            {
                throw new AppException(ErrorCodes.ValidationError, "Name or surname is too long.", 400);
            }

            if (!dateOfBirth.HasValue)
            {
                throw new AppException(ErrorCodes.ValidationError, "Date of birth is required for individual users.", 400);
            }

            var today = _dateTimeProvider.UtcNow.Date;
            if (!IsValidBirthDate(dateOfBirth.Value, today))
            {
                throw new AppException(ErrorCodes.ValidationError, "Date of birth is invalid.", 400);
            }

            if (!IsAtLeastAge(dateOfBirth.Value, 18, today))
            {
                throw new AppException(ErrorCodes.ValidationError, "User must be at least 18 years old.", 400);
            }

            if (string.IsNullOrWhiteSpace(tckn))
            {
                throw new AppException(ErrorCodes.ValidationError, "TCKN is required for individual users.", 400);
            }

            if (!IsValidTckn(tckn))
            {
                throw new AppException(ErrorCodes.ValidationError, "TCKN validation failed.", 400);
            }

            var tcknInUse = await _dbContext.Users.AnyAsync(u => u.TCKN == tckn && u.Id != user.Id, cancellationToken);
            if (tcknInUse)
            {
                throw new AppException(ErrorCodes.Conflict, "TCKN is already registered.", 409);
            }

            var isValidTckn = await _kpsService.ValidateIdentityAsync(tckn, name, surname, cancellationToken);
            if (!isValidTckn)
            {
                throw new AppException(ErrorCodes.ValidationError, "TCKN validation failed.", 400);
            }

            user.Name = name;
            user.Surname = surname;
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.TaxNumber))
            {
                throw new AppException(ErrorCodes.ValidationError, "Tax number is required for corporate users.", 400);
            }

            var taxNumberInUse = await _dbContext.Users.AnyAsync(u => u.TaxNumber == request.TaxNumber && u.Id != user.Id, cancellationToken);
            if (taxNumberInUse)
            {
                throw new AppException(ErrorCodes.Conflict, "Tax number is already registered.", 409);
            }
        }

        user.UserType = request.UserType;
        var address = request.Address?.Trim();
        if (!string.IsNullOrWhiteSpace(address) && address.Length > 512)
        {
            throw new AppException(ErrorCodes.ValidationError, "Address is too long.", 400);
        }

        user.Address = address;
        user.TCKN = request.UserType == UserType.Individual ? request.Tckn?.Trim() : null;
        user.DateOfBirth = request.UserType == UserType.Individual ? request.DateOfBirth?.Date : null;
        user.TaxNumber = request.UserType == UserType.Corporate ? request.TaxNumber : null;
        if (request.UserType == UserType.Corporate)
        {
            var corporateName = request.Name?.Trim();
            var corporateSurname = request.Surname?.Trim();

            if (!string.IsNullOrWhiteSpace(corporateName) && corporateName.Length > 100)
            {
                throw new AppException(ErrorCodes.ValidationError, "Name is too long.", 400);
            }

            if (!string.IsNullOrWhiteSpace(corporateSurname) && corporateSurname.Length > 100)
            {
                throw new AppException(ErrorCodes.ValidationError, "Surname is too long.", 400);
            }

            user.Name = corporateName;
            user.Surname = corporateSurname;
        }
        user.Status = UserStatus.Active;
        var salt = _passwordHasher.GenerateSalt();
        user.Salt = salt;
        user.PasswordHash = _passwordHasher.HashPassword(request.Password, salt);

        var walletNumber = await _walletNumberGenerator.GenerateAsync(cancellationToken);
        var virtualIban = await _virtualIbanGenerator.GenerateAsync(cancellationToken);
        var currencyCode = string.IsNullOrWhiteSpace(request.CurrencyCode)
            ? "TRY"
            : request.CurrencyCode.ToUpperInvariant();

        var wallet = new Wallet
        {
            UserId = user.Id,
            WalletNumber = walletNumber,
            VirtualIban = virtualIban,
            Balance = 0m,
            CurrencyCode = currencyCode,
            IsActive = true,
            CreatedAt = _dateTimeProvider.UtcNow
        };

        _dbContext.Wallets.Add(wallet);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditLogger.LogAsync("PROFILE_COMPLETE", true, ipAddress, user.Id, wallet.Id.ToString(), null, cancellationToken);

        return new CompleteProfileResult(user.Id, wallet.Id, wallet.WalletNumber, wallet.CurrencyCode);
    }

    public async Task<LoginResult> LoginAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        var phone = NormalizePhone(request.Phone);
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Phone == phone, cancellationToken);
        if (user is null)
        {
            await _auditLogger.LogAsync("LOGIN", false, ipAddress, null, null, "User not found", cancellationToken);
            throw new AppException(ErrorCodes.Unauthorized, "Invalid credentials.", 401);
        }

        if (user.Status == UserStatus.Blocked)
        {
            await _auditLogger.LogAsync("LOGIN", false, ipAddress, user.Id, null, "User is blocked", cancellationToken);
            throw new AppException(ErrorCodes.Unauthorized, "User is blocked.", 403);
        }

        if (user.Status == UserStatus.Pending)
        {
            await _auditLogger.LogAsync("LOGIN", false, ipAddress, user.Id, null, "Profile not completed", cancellationToken);
            return new LoginResult(false, true, null, user.Id);
        }

        var isValidPassword = _passwordHasher.VerifyPassword(request.Password, user.Salt, user.PasswordHash);
        if (!isValidPassword)
        {
            await _auditLogger.LogAsync("LOGIN", false, ipAddress, user.Id, null, "Invalid password", cancellationToken);
            throw new AppException(ErrorCodes.Unauthorized, "Invalid credentials.", 401);
        }

        var token = _jwtTokenGenerator.GenerateToken(user);
        await _auditLogger.LogAsync("LOGIN", true, ipAddress, user.Id, null, null, cancellationToken);

        return new LoginResult(true, false, token, user.Id);
    }

    private static string NormalizePhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new AppException(ErrorCodes.ValidationError, "Phone is required.", 400);
        }

        return phone.Trim();
    }

    private static bool IsValidTckn(string tckn)
    {
        if (tckn.Length != 11)
        {
            return false;
        }

        var sum = 0;
        for (var i = 0; i < 10; i++)
        {
            var c = tckn[i];
            if (c < '0' || c > '9')
            {
                return false;
            }

            sum += c - '0';
        }

        var lastChar = tckn[10];
        if (lastChar < '0' || lastChar > '9')
        {
            return false;
        }

        return sum % 10 == lastChar - '0';
    }

    private static bool IsValidBirthDate(DateTime birthDate, DateTime today)
    {
        return birthDate.Date <= today;
    }

    private static bool IsAtLeastAge(DateTime birthDate, int age, DateTime today)
    {
        var birth = birthDate.Date;
        if (birth > today)
        {
            return false;
        }

        var cutoffYear = today.Year - age;
        var cutoffDay = Math.Min(today.Day, DateTime.DaysInMonth(cutoffYear, today.Month));
        var cutoffDate = new DateTime(cutoffYear, today.Month, cutoffDay);
        return birth <= cutoffDate;
    }
}

type MockWallet = {
  id: number;
  walletNumber: string;
  virtualIban?: string | null;
  balance: number;
  currencyCode: string;
  isActive: boolean;
};

type MockTransaction = {
  walletId: number;
  transactionId: string;
  transactionType: number;
  amount: number;
  feeAmount: number;
  netTransactionAmount: number;
  status: number;
  referenceCode: string;
  transactionDate: string;
  currencyCode: string;
  isIncoming: boolean;
  senderWalletNumber?: string | null;
  receiverWalletNumber?: string | null;
  description?: string | null;
  bankAccountIban?: string | null;
};

type MockCard = {
  id: number;
  maskedPan: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  brand: string;
  isActive: boolean;
  createdAt: string;
};

type MockBankAccount = {
  id: number;
  iban: string;
  bankName: string;
  accountHolderName: string;
  isActive: boolean;
  createdAt: string;
};

const DEMO_USER_ID = 1001;
const DEMO_TOKEN = "demo-token";

const nowIso = (minutesAgo = 0) => new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

const store = {
  wallets: [
    {
      id: 7001,
      walletNumber: "NW-000001",
      virtualIban: "TR00 0000 0000 0000 0000 0000 01",
      balance: 2350.75,
      currencyCode: "TRY",
      isActive: true
    },
    {
      id: 7002,
      walletNumber: "NW-000002",
      virtualIban: "TR00 0000 0000 0000 0000 0000 02",
      balance: 890.2,
      currencyCode: "USD",
      isActive: true
    },
    {
      id: 7003,
      walletNumber: "NW-000003",
      virtualIban: "TR00 0000 0000 0000 0000 0000 03",
      balance: 520.4,
      currencyCode: "EUR",
      isActive: true
    }
  ] as MockWallet[],
  transactions: [
    {
      walletId: 7001,
      transactionId: "TX-9001",
      transactionType: 1,
      amount: 1200,
      feeAmount: 0,
      netTransactionAmount: 1200,
      status: 1,
      referenceCode: "RF-10001",
      transactionDate: nowIso(120),
      currencyCode: "TRY",
      isIncoming: true,
      description: "Top up"
    },
    {
      walletId: 7001,
      transactionId: "TX-9002",
      transactionType: 2,
      amount: 250,
      feeAmount: 2.5,
      netTransactionAmount: 247.5,
      status: 1,
      referenceCode: "RF-10002",
      transactionDate: nowIso(520),
      currencyCode: "TRY",
      isIncoming: false,
      receiverWalletNumber: "NW-000777",
      description: "P2P transfer"
    },
    {
      walletId: 7001,
      transactionId: "TX-9003",
      transactionType: 3,
      amount: 420,
      feeAmount: 4.2,
      netTransactionAmount: 415.8,
      status: 1,
      referenceCode: "RF-10003",
      transactionDate: nowIso(980),
      currencyCode: "TRY",
      isIncoming: false,
      bankAccountIban: "TR00 0000 0000 0000 0000 0000 99",
      description: "Withdraw"
    },
    {
      walletId: 7002,
      transactionId: "TX-9010",
      transactionType: 1,
      amount: 300,
      feeAmount: 0,
      netTransactionAmount: 300,
      status: 1,
      referenceCode: "RF-10010",
      transactionDate: nowIso(240),
      currencyCode: "USD",
      isIncoming: true,
      description: "Top up"
    },
    {
      walletId: 7003,
      transactionId: "TX-9020",
      transactionType: 1,
      amount: 180,
      feeAmount: 0,
      netTransactionAmount: 180,
      status: 1,
      referenceCode: "RF-10020",
      transactionDate: nowIso(360),
      currencyCode: "EUR",
      isIncoming: true,
      description: "Top up"
    }
  ] as MockTransaction[],
  cards: [
    {
      id: 3001,
      maskedPan: "**** **** **** 4242",
      cardHolderName: "Nova User",
      expiryMonth: 12,
      expiryYear: 2027,
      brand: "VISA",
      isActive: true,
      createdAt: nowIso(10000)
    },
    {
      id: 3002,
      maskedPan: "**** **** **** 1881",
      cardHolderName: "Nova User",
      expiryMonth: 7,
      expiryYear: 2028,
      brand: "MASTERCARD",
      isActive: false,
      createdAt: nowIso(20000)
    }
  ] as MockCard[],
  bankAccounts: [
    {
      id: 2001,
      iban: "TR00 0000 0000 0000 0000 0000 11",
      bankName: "Isbank",
      accountHolderName: "Nova User",
      isActive: true,
      createdAt: nowIso(15000)
    },
    {
      id: 2002,
      iban: "TR00 0000 0000 0000 0000 0000 22",
      bankName: "Garanti",
      accountHolderName: "Nova User",
      isActive: false,
      createdAt: nowIso(25000)
    }
  ] as MockBankAccount[]
};

let nextCardId = 3100;
let nextBankAccountId = 2100;
let nextTransactionId = 9100;

export function shouldUseMockByDefault(): boolean {
  return process.env.EXPO_PUBLIC_FORCE_MOCKS === "true";
}

export function isMockablePath(path: string): boolean {
  return path.startsWith("/api/");
}

export function getMockResponse(path: string, options?: RequestInit): unknown | undefined {
  const method = (options?.method || "GET").toUpperCase();

  if (path.startsWith("/api/auth/login") && method === "POST") {
    return { isSuccess: true, requiresProfileCompletion: false, token: DEMO_TOKEN, userId: DEMO_USER_ID };
  }

  if (path.startsWith("/api/auth/register/start") && method === "POST") {
    return { userId: DEMO_USER_ID, status: 1 };
  }

  if (path.startsWith("/api/auth/register/verify-otp") && method === "POST") {
    return {};
  }

  if (path.startsWith("/api/auth/register/complete") && method === "POST") {
    const payload = safeJson(options?.body) as { currencyCode?: string | null } | null;
    const currency = payload?.currencyCode?.trim().toUpperCase() || "TRY";
    return { userId: DEMO_USER_ID, walletId: store.wallets[0].id, walletNumber: store.wallets[0].walletNumber, currencyCode: currency };
  }

  if (path === "/api/wallets" && method === "GET") {
    return store.wallets;
  }

  if (path.startsWith("/api/wallets/") && method === "GET") {
    const id = Number(path.split("/").pop());
    return store.wallets.find((wallet) => wallet.id === id) || store.wallets[0];
  }

  if (path.startsWith("/api/transactions") && method === "GET") {
    if (path.startsWith("/api/transactions/")) {
      const id = path.split("/").pop() || "";
      return store.transactions.find((tx) => tx.transactionId === id) || store.transactions[0];
    }

    const walletId = Number(getQueryParam(path, "walletId"));
    const filtered = Number.isFinite(walletId)
      ? store.transactions.filter((tx) => tx.walletId === walletId)
      : store.transactions;
    return filtered.map((tx) => ({
      transactionId: tx.transactionId,
      transactionType: tx.transactionType,
      amount: tx.amount,
      feeAmount: tx.feeAmount,
      netTransactionAmount: tx.netTransactionAmount,
      status: tx.status,
      referenceCode: tx.referenceCode,
      transactionDate: tx.transactionDate,
      currencyCode: tx.currencyCode,
      isIncoming: tx.isIncoming,
      description: tx.description,
      bankAccountIban: tx.bankAccountIban
    }));
  }

  if (path === "/api/transactions/topup" && method === "POST") {
    const payload = safeJson(options?.body) as { walletId: number; amount: number; currencyCode: string; description?: string | null } | null;
    return createTransaction(1, payload?.walletId, payload?.amount, payload?.currencyCode, true, payload?.description);
  }

  if (path === "/api/transactions/withdraw" && method === "POST") {
    const payload = safeJson(options?.body) as { walletId: number; amount: number; currencyCode: string; description?: string | null } | null;
    return createTransaction(3, payload?.walletId, payload?.amount, payload?.currencyCode, false, payload?.description);
  }

  if (path === "/api/transactions/p2p" && method === "POST") {
    const payload = safeJson(options?.body) as { senderWalletId: number; amount: number; currencyCode: string; description?: string | null; receiverWalletNumber?: string } | null;
    return createTransaction(2, payload?.senderWalletId, payload?.amount, payload?.currencyCode, false, payload?.description, payload?.receiverWalletNumber);
  }

  if (path.startsWith("/api/cards") && method === "GET") {
    const includeInactive = getQueryParam(path, "includeInactive") === "true";
    const list = includeInactive ? store.cards : store.cards.filter((card) => card.isActive);
    if (path === "/api/cards" || path.startsWith("/api/cards?")) {
      return list.map((card) => ({
        id: card.id,
        maskedPan: card.maskedPan,
        cardHolderName: card.cardHolderName,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        brand: card.brand,
        isActive: card.isActive
      }));
    }
  }

  if (path.startsWith("/api/cards/") && method === "GET") {
    const id = Number(path.split("/").pop());
    return store.cards.find((card) => card.id === id) || store.cards[0];
  }

  if (path === "/api/cards" && method === "POST") {
    const payload = safeJson(options?.body) as {
      cardNumber?: string;
      cardHolderName?: string;
      expiryMonth?: number;
      expiryYear?: number;
    } | null;
    const cardNumber = payload?.cardNumber || "0000";
    const card: MockCard = {
      id: nextCardId++,
      maskedPan: `**** **** **** ${cardNumber.slice(-4)}`,
      cardHolderName: payload?.cardHolderName || "Nova User",
      expiryMonth: payload?.expiryMonth || 1,
      expiryYear: payload?.expiryYear || new Date().getFullYear() + 2,
      brand: "VISA",
      isActive: true,
      createdAt: nowIso()
    };
    store.cards.unshift(card);
    return card;
  }

  if (path.startsWith("/api/cards/") && method === "DELETE") {
    const id = Number(path.split("/").pop());
    const card = store.cards.find((item) => item.id === id);
    if (card) {
      card.isActive = false;
    }
    return {};
  }

  if (path.startsWith("/api/bank-accounts") && method === "GET") {
    const includeInactive = getQueryParam(path, "includeInactive") === "true";
    const list = includeInactive ? store.bankAccounts : store.bankAccounts.filter((acc) => acc.isActive);
    if (path === "/api/bank-accounts" || path.startsWith("/api/bank-accounts?")) {
      return list.map((acc) => ({
        id: acc.id,
        iban: acc.iban,
        bankName: acc.bankName,
        accountHolderName: acc.accountHolderName,
        isActive: acc.isActive
      }));
    }
  }

  if (path.startsWith("/api/bank-accounts/") && method === "GET") {
    const id = Number(path.split("/").pop());
    return store.bankAccounts.find((acc) => acc.id === id) || store.bankAccounts[0];
  }

  if (path === "/api/bank-accounts" && method === "POST") {
    const payload = safeJson(options?.body) as { iban?: string; bankName?: string; accountHolderName?: string } | null;
    const account: MockBankAccount = {
      id: nextBankAccountId++,
      iban: payload?.iban || "TR00 0000 0000 0000 0000 0000 00",
      bankName: payload?.bankName || "Local Bank",
      accountHolderName: payload?.accountHolderName || "Nova User",
      isActive: true,
      createdAt: nowIso()
    };
    store.bankAccounts.unshift(account);
    return account;
  }

  if (path.startsWith("/api/bank-accounts/") && method === "DELETE") {
    const id = Number(path.split("/").pop());
    const account = store.bankAccounts.find((item) => item.id === id);
    if (account) {
      account.isActive = false;
    }
    return {};
  }

  return undefined;
}

function safeJson(body?: RequestInit["body"]): unknown | null {
  if (!body) {
    return null;
  }
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return null;
}

function getQueryParam(path: string, key: string): string | null {
  const index = path.indexOf("?");
  if (index === -1) {
    return null;
  }
  const query = path.slice(index + 1);
  const pairs = query.split("&");
  for (const pair of pairs) {
    if (!pair) {
      continue;
    }
    const [rawKey, rawValue] = pair.split("=");
    if (rawKey === key) {
      return rawValue ? decodeURIComponent(rawValue) : "";
    }
  }
  return null;
}

function createTransaction(
  type: number,
  walletId?: number,
  amount?: number,
  currencyCode?: string,
  isIncoming?: boolean,
  description?: string | null,
  receiverWalletNumber?: string
) {
  const wallet = store.wallets.find((item) => item.id === walletId) || store.wallets[0];
  const usedAmount = typeof amount === "number" ? amount : 0;
  const feeAmount = Number((usedAmount * 0.01).toFixed(2));
  const net = Number((usedAmount - feeAmount).toFixed(2));
  if (!isIncoming && wallet) {
    wallet.balance = Number((wallet.balance - usedAmount).toFixed(2));
  } else if (isIncoming && wallet) {
    wallet.balance = Number((wallet.balance + usedAmount).toFixed(2));
  }
  const transaction: MockTransaction = {
    walletId: wallet.id,
    transactionId: `TX-${nextTransactionId++}`,
    transactionType: type,
    amount: usedAmount,
    feeAmount,
    netTransactionAmount: net,
    status: 1,
    referenceCode: `RF-${Math.floor(Math.random() * 90000 + 10000)}`,
    transactionDate: nowIso(),
    currencyCode: currencyCode || wallet.currencyCode,
    isIncoming: Boolean(isIncoming),
    receiverWalletNumber: receiverWalletNumber || null,
    description: description || null
  };
  store.transactions.unshift(transaction);
  return {
    transactionId: transaction.transactionId,
    referenceCode: transaction.referenceCode,
    status: transaction.status
  };
}

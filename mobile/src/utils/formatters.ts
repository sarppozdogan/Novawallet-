export function formatAmount(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currencyCode
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function getTransactionTypeLabel(type: number): string {
  switch (type) {
    case 1:
      return "Top up";
    case 2:
      return "P2P";
    case 3:
      return "Withdraw";
    default:
      return "Transaction";
  }
}

export function getTransactionStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Success";
    case 2:
      return "Failed";
    default:
      return "Unknown";
  }
}

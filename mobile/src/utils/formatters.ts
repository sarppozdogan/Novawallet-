import { getLocaleTag, translate } from "../i18n/i18n";

export function formatAmount(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(getLocaleTag(), {
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
  return new Intl.DateTimeFormat(getLocaleTag(), {
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
      return translate("transaction.type.top_up");
    case 2:
      return translate("transaction.type.p2p");
    case 3:
      return translate("transaction.type.withdraw");
    default:
      return translate("transaction.type.default");
  }
}

export function getTransactionStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return translate("transaction.status.pending");
    case 1:
      return translate("transaction.status.success");
    case 2:
      return translate("transaction.status.failed");
    default:
      return translate("transaction.status.unknown");
  }
}

import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNowStrict, isPast, isToday, isTomorrow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

const intlWithSupportedValues = Intl as typeof Intl & {
  supportedValuesOf?: (key: string) => string[];
};

const commonCurrencyCodes = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"];

export function normalizeCurrencyCode(currency?: string | null) {
  const normalized = currency?.trim().toUpperCase();
  return normalized || "INR";
}

export const supportedCurrencyCodes = (() => {
  const discoveredCodes = intlWithSupportedValues.supportedValuesOf?.("currency") ?? ["INR", "USD", "EUR", "GBP", "AED"];
  const uniqueCodes = Array.from(new Set([...commonCurrencyCodes, ...discoveredCodes.map((code) => code.toUpperCase())]));

  return uniqueCodes.sort((left, right) => {
    const leftPriority = commonCurrencyCodes.indexOf(left);
    const rightPriority = commonCurrencyCodes.indexOf(right);

    if (leftPriority !== -1 || rightPriority !== -1) {
      if (leftPriority === -1) return 1;
      if (rightPriority === -1) return -1;
      return leftPriority - rightPriority;
    }

    return left.localeCompare(right);
  });
})();

export function formatCurrency(amount?: number | null, currency = "INR") {
  if (amount == null) return "Not set";

  const normalizedCurrency = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0
    }).format(amount)}`;
  }
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "Not scheduled";

  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date?: Date | string | null) {
  if (!date) return "Not available";

  return format(new Date(date), "dd MMM yyyy, h:mm a");
}

export function formatDueLabel(date?: Date | string | null) {
  if (!date) return "No due date";

  const actualDate = new Date(date);

  if (isToday(actualDate)) return "Today";
  if (isTomorrow(actualDate)) return "Tomorrow";
  if (isPast(actualDate)) return `Overdue by ${formatDistanceToNowStrict(actualDate)}`;

  return format(actualDate, "EEE, dd MMM");
}

export function titleCase(input: string) {
  return input
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function serializeDateInput(value?: string | null) {
  if (!value) return undefined;

  return new Date(`${value}T09:00:00`).toISOString();
}

export function initialFromName(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

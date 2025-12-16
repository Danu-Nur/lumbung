import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ===== CURRENCY ===== */

type FormatCurrencyOptions = {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
};

export function formatCurrency(
  value: number | string,
  options: FormatCurrencyOptions = {}
) {
  const {
    locale = 'id-ID',
    currency = 'IDR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false,
  } = options;

  const num = Number(value);
  if (!Number.isFinite(num)) return '-';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
  }).format(num);
}

/* ===== DATE / DATETIME ===== */

type FormatDateOptions = {
  locale?: string;
  withTime?: boolean;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
};

export function formatDate(
  value: Date | string | number | null | undefined,
  options: FormatDateOptions = {}
) {
  if (!value) return '-';

  const {
    locale = 'id-ID',
    withTime = false,
    dateStyle = 'medium',
    timeStyle = 'short',
  } = options;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    ...(withTime ? { timeStyle } : {}),
  }).format(date);
}

export function formatDateTime(
  value: Date | string | number | null | undefined,
  options: Omit<FormatDateOptions, 'withTime'> = {}
) {
  return formatDate(value, {
    ...options,
    withTime: true,
  });
}

/* ===== ORDER NUMBER ===== */

export function generateOrderNumber(prefix = 'SO') {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = String(now.getTime()).slice(-5);
  return `${prefix}-${datePart}-${timePart}`;
}

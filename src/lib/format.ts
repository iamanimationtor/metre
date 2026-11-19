/** Persian number/currency formatting helpers (fa-IR digits & grouping). */

const nfInt = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });

export function faNum(n: number): string {
  return nfInt.format(Math.round(n));
}

export function faDecimal(n: number): string {
  return nf2.format(n);
}

/** Full toman amount with grouping. */
export function toman(n: number): string {
  return `${nfInt.format(Math.round(n))} تومان`;
}

/** Compact human-readable toman (e.g. ۱٫۲ میلیارد تومان). */
export function tomanCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${nf2.format(Math.round(v * 100) / 100)} میلیارد تومان`;
  }
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `${nfInt.format(Math.round(v))} میلیون تومان`;
  }
  return toman(n);
}

/** Compact price per unit, e.g. "۴۷٬۰۰۰ ت/کیلوگرم". */
export function unitPriceLabel(price: number, unit: string): string {
  return `${nfInt.format(Math.round(price))} ت/${unit}`;
}

export function dateFa(iso: string | Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return "";
  }
}

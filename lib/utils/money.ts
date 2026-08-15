export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function formatCurrency(cents: number): string {
  return `$${centsToDollars(cents).toFixed(2)}`;
}

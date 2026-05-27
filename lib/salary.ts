export function normalizeSalaryRange(value: string): string | null {
  const numbers = value.match(/\d+(?:,\d{3})*/g);
  if (!numbers || numbers.length < 2) return null;

  const [rawMin, rawMax] = numbers.map((item) => Number(item.replace(/,/g, "")));
  if (!Number.isFinite(rawMin) || !Number.isFinite(rawMax)) return null;

  const min = rawMin >= 1000 ? Math.round(rawMin / 1000) : rawMin;
  const max = rawMax >= 1000 ? Math.round(rawMax / 1000) : rawMax;

  if (min <= 0 || max <= 0 || min >= max) return null;

  return `$${min}k - $${max}k`;
}

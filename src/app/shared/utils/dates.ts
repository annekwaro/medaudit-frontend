/**
 * Whole calendar days from one ISO date to another (negative if `to` is earlier). Accepts dates
 * (yyyy-MM-dd) or timestamps; only the date part counts. UTC math avoids DST shifts.
 */
export function daysBetween(from: string, to: string): number {
  const utc = (iso: string) => {
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

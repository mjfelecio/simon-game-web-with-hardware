/**
 * Converts milliseconds into:
 * 65_432 -> "01:05.432"
 * 3_723_456 -> "1:02:03.456"
 * 
 * @example
 * formatDuration(5234);      // 00:05.234
 * formatDuration(65432);     // 01:05.432
 * formatDuration(3723456);   // 1:02:03.456
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = ms % 1_000;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(milliseconds).padStart(3, "0");

  if (hours > 0) {
    return `${hours}:${mm}:${ss}.${mmm}`;
  }

  return `${mm}:${ss}.${mmm}`;
}

/**
 * 
 * @example
 * formatDurationCompact(65432); // 1:05
 * formatDurationCompact(5234);  // 0:05
 */
export function formatDurationCompact(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
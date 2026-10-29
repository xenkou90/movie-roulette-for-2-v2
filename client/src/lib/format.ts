export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder}m`;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

export function formatTimeLeft(seconds: number): string {
  if (seconds < 60) {
    return seconds === 1 ? "1 second" : `${seconds} seconds`;
  }

  const minutes = Math.round(seconds / 60);
  return minutes === 1 ? "about a minute" : `about ${minutes} minutes`;
}

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? fallback : value;
}

function optionalPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    console.error(
      `Environment variable ${name} must be a positive whole number`,
    );
    process.exit(1);
  }
  return value;
}

export const env = {
  tmdbApiKey: required("TMDB_API_KEY"),
  port: optionalPositiveInt("PORT", 3001),
  clientUrl: optional("CLIENT_URL", "http://loclahost:5173"),
  resumeGraceMs: optionalPositiveInt("RESUME_GRACE_MS", 90_000),
  idleTimeoutMs: optionalPositiveInt("IDLE_TIMEOUT_MS", 12 * 60_000),
  waitingTimeoutMs: optionalPositiveInt("WAITING_TIMEOUT_MS", 30 * 60_000),
  idleWarningMs: optionalPositiveInt("IDLE_WARNING_MS", 2 * 60_000),
} as const;

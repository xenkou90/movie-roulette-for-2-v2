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

export const env = {
  tmdbApiKey: required("TMDB_API_KEY"),
  port: Number(optional("PORT", "3001")),
  clientUrl: optional("CLIENT_URL", "http://localhost:5173"),
} as const;
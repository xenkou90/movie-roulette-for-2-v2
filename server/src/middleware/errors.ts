import type { NextFunction, Request, Response } from "express";
import { TmdbError } from "../tmdb/client.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "not_found",
    message: `No route matches ${req.method} ${req.path}`,
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof TmdbError) {
    console.error(`[tmdb] ${error.message}`, error.cause ?? "");

    const status = error.status === 429 ? 503 : 502;
    res.status(status).json({
      error: "movie_service_unavailable",
      message: "Could not reach the movie service. Please try again.",
    });
    return;
  }

  console.error("[unhandled]", error);

  res.status(500).json({
    error: "internal_error",
    message: "Something went wrong.",
  });
}
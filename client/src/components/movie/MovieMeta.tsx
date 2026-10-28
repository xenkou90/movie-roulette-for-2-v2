import type { Movie } from "@movie-roulette/shared";
import { formatRuntime } from "../../lib/format";

interface MovieMetaProps {
  movie: Movie;
  muted?: boolean;
  className?: string;
}

function MovieMeta({ movie, muted = false, className = "" }: MovieMetaProps) {
  const genres = movie.genres.slice(0, 3).join(", ");

  return (
    <p
      className={`text-xs uppercase tracking-widest ${muted ? "opacity-70" : ""} ${className}`}
    >
      {movie.runtimeMinutes !== null && (
        <>
          <span aria-hidden="true">{formatRuntime(movie.runtimeMinutes)}</span>
          <span className="sr-only">
            Runtime {movie.runtimeMinutes} minutes
          </span>
          {" · "}
        </>
      )}

      {movie.rating > 0 ? (
        <>
          <span aria-hidden="true">★ </span>
          <span className="sr-only">Rating </span>
          {movie.rating.toFixed(1)}
        </>
      ) : (
        "Not rated yet"
      )}

      {genres !== "" && ` · ${genres}`}
    </p>
  );
}

export default MovieMeta;

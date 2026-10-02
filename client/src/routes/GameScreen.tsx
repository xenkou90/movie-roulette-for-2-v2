import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { useRoom } from "../hooks/useRoom";
import { useLeaveRoom } from "../hooks/useLeaveRoom";
import type { GameNotice } from "../game/gameReducer";
import { posterSrc, posterSrcSet } from "../lib/tmdbImage";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const noticeText: Record<GameNotice, string> = {
  partner_passed: "They passed on one of your picks.",
  partner_already_passed: "They'd already passed on that one.",
  next_movie_failed: "Couldn't load the next movie. Tap again to retry.",
};

function GameScreen() {
  const { code } = useParams();
  const { current, game, decide, clearNotice } = useRoom();
  const leave = useLeaveRoom();
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const notice = game.status === "playing" ? game.notice : null;
  const noticeId = game.status === "playing" ? game.noticeId : 0;

  useEffect(() => {
    if (notice === null) return;

    const timeout = setTimeout(clearNotice, 3000);
    return () => clearTimeout(timeout);
  }, [notice, noticeId, clearNotice]);

  if (current === null || current.room.code !== code) {
    return (
      <Navigate to={code === undefined ? "/" : `/room/${code}/wait`} replace />
    );
  }

  const { room, you } = current;

  if (game.status === "matched") {
    return <Navigate to={`/room/${room.code}/match`} replace />;
  }

  if (game.status !== "playing") {
    return <Navigate to={`/room/${room.code}/wait`} replace />;
  }

  const { movie, pending } = game;
  const partnerName =
    room.players.find((player) => player.socketId !== you.socketId)?.name ??
    "Your friend";
  const genres = movie.genres.slice(0, 3).join (", ");
  const hasRating = movie.rating > 0;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-sm flex-col gap-3 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmingLeave(true)}
        >
          Leave
        </Button>
        <p className="text-xs uppercase tracking-widest opacity-60">
          Room {room.code}
        </p>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {movie.posterPath !== null ? (
          <img
            key={movie.id}
            src={posterSrc(movie.posterPath)}
            srcSet={posterSrcSet(movie.posterPath)}
            sizes="(min-width: 400px) 352px, calc(100vw - 2rem)"
            width={500}
            height={750}
            alt={`Poster for ${movie.title}`}
            className="aspect-[2/3] h-full max-w-full rounded-2xl border-3 border-ink bg-ink/10 object-cover shadow-brutal-lg"
          />
        ) : (
          <div className="flex aspect-[2/3] h-full max-w-full items-center justify-center rounded-2xl border-3 border-ink bg-surface p-4 text-center font-heading uppercase shadow-brutal-lg">
            {movie.title}
          </div>
        )}

        <div
          role="status"
          aria-live="polite"
          className="absolute inset-x-0 top-3 flex justify-center"
        >
          {notice !== null && (
            <p className="rounded-lg border-2 border-ink bg-brand-yellow px-3 py-1 text-xs shadow-brutal-sm">
              {noticeText[notice]}
            </p>
          )}
        </div>
      </div>

      <section className="text-center">
        <h1 className="font-heading text-2xl leading-tight uppercase">
          {movie.title}
          {movie.releaseYear !== null && (
            <span className="font-body text-base normal-case opacity-70">
              {" "}
              ({movie.releaseYear})
            </span>
          )}
        </h1>

        <p className="mt-1 text-xs uppercase tracking-widest opacity-70">
          {hasRating ? (
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

        <p className="mt-2 line-clamp-3 text-sm">
          {movie.overview || "No synopsis available."}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="lg"
          disabled={pending}
          onClick={() => decide(movie.id, "skip")}
        >
          Nope
        </Button>
        <Button
          size="lg"
          disabled={pending}
          onClick={() => decide(movie.id, "like")}
        >
          I&apos;m in
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingLeave}
        title="Leaving already?"
        cancelLabel="Keep swiping"
        confirmLabel="Leave anyway"
        onCancel={() => setConfirmingLeave(false)}
        onConfirm={leave}
      >
        {partnerName} will be left swiping alone — and the popcorn&apos;s barely
        warm!
      </ConfirmDialog>
    </main>
  );
}

export default GameScreen;
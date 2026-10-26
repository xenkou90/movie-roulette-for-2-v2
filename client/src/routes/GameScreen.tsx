import { useCallback, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import type { Decision } from "@movie-roulette/shared";
import { useRoom } from "../hooks/useRoom";
import { useSocket } from "../hooks/useSocket";
import { useLeaveRoom } from "../hooks/useLeaveRoom";
import type { GameNotice } from "../game/gameReducer";
import { posterSrc, posterSrcSet } from "../lib/tmdbImage";
import { imdbUrl, letterboxdUrl } from "../lib/movieLinks";
import { decisionHaptic } from "../lib/haptics";
import { primeAudio } from "../lib/sound";
import { pageTitle } from "../lib/pageTitle";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import DelayedReveal from "../components/ui/DelayedReveal";
import ExternalLinkButton from "../components/ui/ExternalLinkButton";
import MovieMeta from "../components/movie/MovieMeta";
import ReconnectingScreen from "../components/room/ReconnectingScreen";

const PARTNER_AWAY_DELAY_MS = 1000;

const noticeText: Record<GameNotice, string> = {
  partner_passed: "They passed on one of your picks.",
  partner_already_passed: "They'd already passed on that one.",
  next_movie_failed: "Couldn't load the next movie. Tap again to retry.",
};

function GameScreen() {
  const { code } = useParams();
  const { current, game, decide, clearNotice, isRestoring } = useRoom();
  const { isConnected } = useSocket();
  const leave = useLeaveRoom();
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const notice = game.status === "playing" ? game.notice : null;
  const noticeId = game.status === "playing" ? game.noticeId : 0;
  const keyboardMovieId =
    game.status === "playing" && !game.pending && isConnected
      ? game.movie.id
      : null;

    const choose = useCallback(
      (movieId: number, decision: Decision) => {
        primeAudio();
        decisionHaptic(decision);
        decide(movieId, decision);
      },
      [decide],
    );

    useEffect(() => {
      if (notice === null) return;

      const timeout = setTimeout(clearNotice, 3000);
      return () => clearTimeout(timeout);
    }, [notice, noticeId, clearNotice]);

    useEffect(() => {
      if (keyboardMovieId === null || confirmingLeave) return;

      const movieId = keyboardMovieId;

      function handleKeyDown(event: KeyboardEvent) {
        if (
          event.repeat ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          choose(movieId, "skip");
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          choose(movieId, "like");
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [keyboardMovieId, confirmingLeave, choose]);

    if (current === null && isRestoring) {
      return <ReconnectingScreen />;
    }

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
    const partner = room.players.find((player) => player.id !== you.id);
    const partnerName = partner?.name ?? "Your friend";
    const awayPartner =
      partner !== undefined && !partner.connected ? partner : undefined;
    const actionsPaused = pending || !isConnected;

    return (
      <main className="mx-auto flex h-dvh w-full max-w-sm flex-col gap-3 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <title>{pageTitle("Picking a movie")}</title>

        <header className="flex items-center justify-between gap-3">
          <Button
            variant="accent"
            size="sm"
            onClick={() => setConfirmingLeave(true)}
          >
            Leave
          </Button>
          <p
            aria-hidden="true"
            className="hidden text-xs opacity-60 [@media(hover:hover)_and_(pointer:fine)]:block"
          >
            ← Nope · → I&apos;m in
          </p>
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
              className="aspect-[2/3] h-full max-w-full rounded-2xl border-3 border-ink bg-ink/10 object-cover shadow-brutal-lg motion-safe:animate-card-in"
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

          <div
            role="status"
            aria-live="polite"
            className="absolute inset-x-0 bottom-3 flex justify-center px-3"
          >
            {awayPartner !== undefined && (
              <DelayedReveal delayMs={PARTNER_AWAY_DELAY_MS}>
                <p className="rounded-lg border-2 border-ink bg-surface px-3 py-1 text-xs shadow-brutal-sm">
                  {awayPartner.name} is reconnecting — keep going!
                </p>
              </DelayedReveal>
            )}
          </div>
        </div>

        <section key={movie.id} className="text-center motion-safe:animate-card-in">
          <h1 className="font-heading text-2xl leading-tight uppercase">
            {movie.title}
            {movie.releaseYear !== null && (
              <span className="font-body text-base normal-case">
                {" "}
                ({movie.releaseYear})
              </span>
            )}
          </h1>
          <MovieMeta movie={movie} className="mt-1" />
          <p className="mt-2 line-clamp-3 text-sm">
            {movie.overview || "No synopsis available."}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <ExternalLinkButton href={imdbUrl(movie)} variant="ghost" size="sm">
            IMDb
          </ExternalLinkButton>
          <ExternalLinkButton href={letterboxdUrl(movie)} variant="ghost" size="sm">
            Letterboxd
          </ExternalLinkButton>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="lg"
            pending={actionsPaused}
            aria-keyshortcuts="ArrowLeft"
            onClick={() => choose(movie.id, "skip")}
          >
            Nope
          </Button>
          <Button
            size="lg"
            pending={actionsPaused}
            aria-keyshortcuts="ArrowRight"
            onClick={() => choose(movie.id, "like")}
          >
            I&apos;m in
          </Button>
        </div>

        <ConfirmDialog
          open={confirmingLeave}
          title="Leaving already?"
          cancelLabel="Keep picking"
          confirmLabel="Leave anyway"
          onCancel={() => setConfirmingLeave(false)}
          onConfirm={leave}
        >
          {partnerName} will be left picking alone — and the popcorn&apos;s barely
          warm!
        </ConfirmDialog>
      </main>
    );
}

export default GameScreen;
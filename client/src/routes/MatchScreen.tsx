import { Navigate, useParams } from "react-router";
import { useRoom } from "../hooks/useRoom";
import { useSocket } from "../hooks/useSocket";
import { useLeaveRoom } from "../hooks/useLeaveRoom";
import { posterSrc } from "../lib/tmdbImage";
import { pageTitle } from "../lib/pageTitle";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import MovieMeta from "../components/movie/MovieMeta";
import MovieLinks from "../components/movie/MovieLinks";
import ReconnectingScreen from "../components/room/ReconnectingScreen";

function MatchScreen() {
  const { code } = useParams();
  const {
    current,
    game,
    lastDeparture,
    requestRematch,
    returnToRoom,
    isRestoring,
  } = useRoom();
  const  { isConnected } = useSocket();
  const leave = useLeaveRoom();

  if (current === null && isRestoring) {
    return <ReconnectingScreen />;
  }

  if (current === null || current.room.code !== code) {
    return (
      <Navigate to={code === undefined ? "/" : `/room/${code}/wait`} replace />
    );
  }

  const { room, you } = current;

  if (game.status === "playing") {
    return <Navigate to={`/room/${room.code}/game`} replace />
  }

  if (game.status !== "matched") {
    return <Navigate to={`/room/${room.code}/wait`} replace />
  }

  const { movie, readyPlayerIds } = game;
  const partner = room.players.find((player) => player.id !== you.id);
  const youReady = readyPlayerIds.includes(you.id);
  const partnerReady =
    partner !== undefined && readyPlayerIds.includes(partner.id);

  let rematchStatus = "";
  if (partner === undefined) {
    rematchStatus = `${lastDeparture ?? "Your friend"} left the room.`;
  } else if (!partner.connected) {
    rematchStatus = `${partner.name} is reconnecting…`;
  } else if (youReady && !partnerReady) {
    rematchStatus = `Waiting for ${partner.name}…`;
  } else if (partnerReady && !youReady) {
    rematchStatus = `${partner.name} wants to play again!`;
  }

  return (
    <Screen>
      <title>{pageTitle("It's a match!")}</title>
      <Card className="flex flex-col items-center gap-3 text-center">
        <p className="-rotate-3 rounded-lg border-3 border-ink bg-brand-yellow px-4 py-1 font-heading text-xl uppercase shadow-brutal motion-safe:animate-pop">
          It&apos;s a match!
        </p>

        {movie.posterPath !== null && (
          <img
            src={posterSrc(movie.posterPath, 342)}
            width={342}
            height={513}
            alt={`Poster for ${movie.title}`}
            className="mt-2 aspect-[2/3] w-36 rounded-xl border-3 border-ink bg-ink/10 object-cover shadow-brutal motion-safe:animate-rise motion-safe:[animation-delay:150ms]"
          />
        )}

        <div className="motion-safe:animate-rise motion-safe:[animation-delay:300ms]">
          <h1 className="font-heading text-2xl leading-tight uppercase">
            {movie.title}
            {movie.releaseYear !== null && (
              <span className="font-body text-base normal-case opacity-70">
                {" "}
                ({movie.releaseYear})
              </span>
            )}
          </h1>
          <MovieMeta movie={movie} muted className="mt-1" />
        </div>

        <MovieLinks movie={movie} />

        <div className="flex w-full flex-col">
          <p
            role="status"
            aria-live="polite"
            className={rematchStatus === "" ? "text-sm" : "mb-2 text-sm"}
          >
            {rematchStatus}
          </p>

          {partner === undefined ? (
            <Button size="lg" className="w-full" onClick={returnToRoom}>
              Find a new partner
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              pending={youReady || !isConnected}
              onClick={requestRematch}
            >
              {youReady ? "You're ready" : "Play again"}
            </Button>
          )}
        </div>

        <Button variant="accent" size="sm" onClick={leave}>
          Leave
        </Button>
      </Card>
    </Screen>
  );
}

export default MatchScreen;
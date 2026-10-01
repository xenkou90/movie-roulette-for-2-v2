import { Navigate, useNavigate, useParams } from "react-router";
import { useRoom } from "../hooks/useRoom";
import { posterSrc } from "../lib/tmdbImage";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function MatchScreen() {
  const navigate = useNavigate();
  const { code } = useParams();
  const { current, game, leaveRoom } = useRoom();

  if(current === null || current.room.code !== code) {
    return (
      <Navigate to={code === undefined ? "/" : `/room/${code}/wait`} replace />
    );
  }

  const { room } = current;

  if (game.status === "playing") {
    return <Navigate to={`/room/${room.code}/game`} replace />
  }

  if (game.status !== "matched") {
    return <Navigate to={`/room/${room.code}/wait`} replace />
  }

  const { movie } = game;

  function handleLeave() {
    leaveRoom();
    navigate("/");
  }

  return (
    <Screen>
      <Card className="flex flex-col items-center gap-4 text-center">
        <p className="rounded-lg border-2 border-ink bg-brand-yellow px-4 py-1 font-heading text-lg uppercase shadow-brutal-sm">
          It&apos;s a match!
        </p>

        {movie.posterPath !== null && (
          <img
            src={posterSrc(movie.posterPath, 342)}
            width={342}
            height={513}
            alt={`Poster for ${movie.title}`}
            className="aspect-[2/3] w-48 rounded-xl border-3 border-ink object-cover shadow-brutal"
          />
        )}

        <h1 className="font-heading text-2xl leading-tight uppercase">
          {movie.title}
          {movie.releaseYear !== null && (
            <span className="font-body text-base normal-case opacity-70">
              {" "}
              ({movie.releaseYear})
            </span>
          )}
        </h1>

        <p className="text-sm">Movie night is decided.</p>

        <Button variant="ghost" onClick={handleLeave}>
          Leave room
        </Button>
      </Card>
    </Screen>
  );
}

export default MatchScreen;
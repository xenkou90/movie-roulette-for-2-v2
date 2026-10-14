import { Navigate, useNavigate, useParams } from "react-router";
import { useRoom } from "../hooks/useRoom";
import { useLeaveRoom } from "../hooks/useLeaveRoom";
import { useClipboard } from "../hooks/useClipboard";
import { joinLink } from "../lib/joinLink";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

type CopyTarget = "code" | "link" | "share";

function WaitingRoom() {
  const navigate = useNavigate();
  const { code } = useParams();
  const { current, lastDeparture, game } = useRoom();
  const leave = useLeaveRoom();
  const { result: copyResult, copy } = useClipboard<CopyTarget>();

  if (current === null || current.room.code !== code) {
    return (
      <Screen>
        <Card className="text-center">
          <h1 className="font-heading text-2xl uppercase">
            You&apos;re not in this room
          </h1>
          <p className="mt-3 text-sm">
            Rooms close when you leave, refresh or lose connection.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate("/")}>
            Back to home
          </Button>
        </Card>
      </Screen>
    );
  }

  const { room, you } = current;

  if (game.status === "playing") {
    return <Navigate to={`/room/${room.code}/game`} replace />;
  }

  if (game.status === "matched") {
    return <Navigate to={`/room/${room.code}/match`} replace />;
  }

  const partner = room.players.find((player) => player.socketId !== you.socketId);
  const isHost = room.players[0]?.socketId === you.socketId;
  const inviteUrl = joinLink(room.code);

  function buttonLabel(target: CopyTarget, idle: string, done: string): string {
    if (copyResult === null || copyResult.key !== target) return idle;
    return copyResult.ok ? done : "Couldn't copy";
  }

  async function handleShare() {
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: "Movie Roulette for 2",
          text: `Join my movie night — room ${room.code}`,
          url: inviteUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError"){
          return;
        }
      }
    }

    await copy(inviteUrl, "share");
  }

  let announcement = "";
  if (copyResult !== null) {
    if (!copyResult.ok) {
      announcement = "Couldn't copy to the clipboard.";
    } else if (copyResult.key === "code") {
      announcement = "Room code copied.";
    } else {
      announcement = "Invite link copied.";
    }
  }

  let status: string;
  let dotClass: string;

  if (game.status === "unavailable") {
    status = "Couldn't load movies right now. Leave and try again.";
    dotClass = "bg-danger";
  } else if (partner !== undefined) {
    status = `${partner.name} is here. Starting soon…`;
    dotClass = "bg-success";
  } else if (lastDeparture !== null) {
    status = `${lastDeparture} left. Waiting for someone new…`;
    dotClass = "bg-brand-yellow motion-safe:animate-pulse";
  } else {
    status = "Waiting for your friend…";
    dotClass = "bg-brand-yellow motion-safe:animate-pulse";
  }

  return (
    <Screen>
      <Card className="flex flex-col items-center gap-5 text-center">
        <h1 className="font-heading text-3xl uppercase">
          {isHost ? "Your Room" : "Joined!"}
        </h1>

        <div className="flex w-full flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-widest opacity-70">
            Room code
          </p>
          <p
            className="w-full rounded-xl border-3 border-ink bg-brand-yellow px-6 py-3 font-heading text-5xl tracking-[0.3em] shadow-brutal"
            aria-label={`Room code ${room.code.split("").join(" ")}`}
          >
            {room.code}
          </p>

          {partner === undefined && (
            <>
              <div className="grid w-full grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void copy(room.code, "code")}
                >
                  {buttonLabel("code", "Copy code", "Copied!")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void copy(inviteUrl, "link")}
                >
                  {buttonLabel("link", "Copy link", "Copied!")}
                </Button>
              </div>

              <Button className="w-full" onClick={() => void handleShare()}>
                {buttonLabel("share", "Share link", "Link copied!")}
              </Button>
            </>
          )}

          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
        </div>

        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <span
            aria-hidden="true"
            className={`h-3 w-3 shrink-0 rounded-full border-2 border-ink ${dotClass}`}
          />
          <p className="text-sm">{status}</p>
        </div>

        <ul className="w-full border-t-2 border-ink/10 pt-4">
          {room.players.map((player) => (
            <li key={player.socketId} className="font-heading text-xl">
              {player.name}
              {player.socketId === you.socketId && (
                <span className="font-body text-xs opacity-60"> (you)</span>
              )}
            </li>
          ))}
        </ul>

        <Button variant="ghost" onClick={leave}>
          Leave room
        </Button>
      </Card>
    </Screen>
  );
}

export default WaitingRoom;
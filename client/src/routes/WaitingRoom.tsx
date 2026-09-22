import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useRoom } from "../hooks/useRoom";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function WaitingRoom() {
  const navigate = useNavigate();
  const { code } = useParams();
  const { current, lastDeparture, leaveRoom } = useRoom();
  const [copied, setCopied] = useState(false);

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
  const partner = room.players.find((player) => player.socketId !== you.socketId);
  const isHost = room.players[0]?.socketId === you.socketId;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context or denied). The code stays visible to read.
    }
  }

  function handleLeave() {
    leaveRoom();
    navigate("/");
  }

  let status: string;
  if (partner !== undefined) {
    status = `${partner.name} is here. Starting soon…`;
  } else if (lastDeparture !== null) {
    status = `${lastDeparture} left. Waiting for someone new…`;
  } else {
    status = "Waiting for your friend…";
  }

  return (
    <Screen>
      <Card className="flex flex-col items-center gap-5 text-center">
        <h1 className="font-heading text-3xl uppercase">
          {isHost ? "Your Room": "Joined!"}
        </h1>

        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-widest opacity-70">
            Room code
          </p>
          <p
            className="w-full rounded-xl border-3 border-ink bg-brand-yellow px-6 py-3 font-heading text-5xl tracking-[0.3em] shadow-brutal"
            aria-label={`Room code ${room.code.split("").join(" ")}`}
          >
            {room.code}
          </p>
          <Button variant="secondary" className="w-full" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy code"}
          </Button>
        </div>

        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <span
            aria-hidden="true"
            className={`h-3 w-3 shrink-0 rounded-full border-2 border-ink ${
              partner !== undefined
                ? "bg-success"
                : "bg-brand-yellow motion-safe: animate-pulse"
            }`}
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

        <Button variant="ghost" onClick={handleLeave}>
          Leave Room
        </Button>
      </Card>
    </Screen>
  );
}

export default WaitingRoom;
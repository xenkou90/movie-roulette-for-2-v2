import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  PLAYER_NAME_MAX_LENGTH,
  ROOM_CODE_LENGTH,
  ROOM_CODE_REGEX,
  type RoomErrorCode,
} from "@movie-roulette/shared";
import { useSocket } from "../hooks/useSocket";
import { useRoom } from "../hooks/useRoom";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const errorMessages: Record<RoomErrorCode, string> = {
  invalid_name: "That name won't work. Try something shorter.",
  invalid_code: `Room codes are ${ROOM_CODE_LENGTH} digits.`,
  room_not_found: "No room with that code. Check it and try again.",
  room_full: "That room already has two players.",
  already_in_room: "You're already in a room.",
};

function JoinRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { socket, isConnected } = useSocket();

  const [name, setName] = useState("");
  const [code, setCode] = useState(() => {
    const fromUrl = searchParams.get("code") ?? "";
    return ROOM_CODE_REGEX.test(fromUrl) ? fromUrl : "";
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { enterRoom } = useRoom();

  const trimmedName = name.trim();
  const isCodeValid = ROOM_CODE_REGEX.test(code);
  const canSubmit =
    trimmedName.length > 0 && isCodeValid && isConnected && !isSubmitting;

  function handleCodeChange(value: string) {
    setCode(value.replace(/\D/g, "").slice(0, ROOM_CODE_LENGTH));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSubmitting(true);

    socket.emit("room:join", { code, name: trimmedName }, (result) => {
      if (result.ok) {
        enterRoom({ room: result.room, you: result.you });
        navigate(`/room/${result.room.code}/wait`);
        return;
      }

      setIsSubmitting(false);
      setError(errorMessages[result.error]);
    });
  }

  return (
    <Screen>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <h1 className="text-center font-heading text-3xl uppercase">
            Enter a Room
          </h1>

          <Input
            label="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={PLAYER_NAME_MAX_LENGTH}
            placeholder="e.g. Marco"
            autoComplete="given-name"
            autoFocus
          />

          <Input
            label="Room code"
            value={code}
            onChange={(event) => handleCodeChange(event.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="12345"
            hint={`${ROOM_CODE_LENGTH} digits`}
            className="text-center text-2xl tracking-[0.4em]"
            error={error ?? undefined}
          />

          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Joining…" : "Join Room"}
          </Button>

          <Button variant="ghost" onClick={() => navigate("/")}>
            Back
          </Button>
        </form>
      </Card>
    </Screen>
  );
}

export default JoinRoom;
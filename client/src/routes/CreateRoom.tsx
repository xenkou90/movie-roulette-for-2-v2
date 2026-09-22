import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { PLAYER_NAME_MAX_LENGTH } from "@movie-roulette/shared";
import { useSocket } from "../hooks/useSocket";
import { useRoom } from "../hooks/useRoom";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function CreateRoom() {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && isConnected && !isSubmitting;

  const { enterRoom } = useRoom();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSubmitting(true);

    socket.emit("room:create", { name: trimmedName }, (result) => {
      if (result.ok) {
        enterRoom({ room: result.room, you: result.you });
        navigate(`/room/${result.room.code}/wait`);
        return;
      }

      setIsSubmitting(false);
      setError(
        result.error === "invalid_name"
          ? "That name won't work. Try something shorter."
          : "Could not create a room. Please try again.",
      );
    });
  }

  return (
    <Screen>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <h1 className="text-center font-heading text-3xl uppercase">
            Create a Room
          </h1>

          <Input
            label="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={PLAYER_NAME_MAX_LENGTH}
            placeholder="e.g. Sofia"
            autoComplete="given-name"
            autoFocus
            error={error ?? undefined}
          />

          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Creating…" : "Create Room"}
          </Button>

          <Button variant="ghost" onClick={() => navigate("/")}>
            Back
          </Button>
        </form>
      </Card>
    </Screen>
  );
}

export default CreateRoom;
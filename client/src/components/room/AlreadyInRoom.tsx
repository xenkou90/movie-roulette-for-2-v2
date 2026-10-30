import { useNavigate } from "react-router";
import { useRoom } from "../../hooks/useRoom";
import { pageTitle } from "../../lib/pageTitle";
import Screen from "../ui/Screen";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface AlreadyInRoomProps {
  code: string;
}

function AlreadyInRoom({ code }: AlreadyInRoomProps) {
  const navigate = useNavigate();
  const { leaveRoom } = useRoom();

  return (
    <Screen>
      <title>{pageTitle("Still in a room")}</title>
      <Card className="flex flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-2xl uppercase">
          You&apos;re still in a room
        </h1>
        <p className="text-sm">
          You&apos;re in room {code}. Go back to it, or leave it to start
          something new.
        </p>
        <Button
          className="w-full"
          onClick={() => navigate(`/room/${code}/wait`)}
        >
          Back to room {code}
        </Button>
        <Button variant="accent" size="sm" onClick={leaveRoom}>
          Leave
        </Button>
      </Card>
    </Screen>
  );
}

export default AlreadyInRoom;

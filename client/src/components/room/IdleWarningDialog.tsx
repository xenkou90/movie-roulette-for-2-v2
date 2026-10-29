import { useId } from "react";
import { useRoom } from "../../hooks/useRoom";
import { formatTimeLeft } from "../../lib/format";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";

function IdleWarningDialog() {
  const { idleWarningSeconds, stillHere } = useRoom();
  const bodyId = useId();

  return (
    <Dialog
      open={idleWarningSeconds !== null}
      title="Popcorn break?"
      onClose={stillHere}
      describedBy={bodyId}
      className="text-center"
    >
      <p id={bodyId} className="mt-3 text-sm">
        You&apos;ve been quiet for a while. We&apos;ll free up your seat in{" "}
        {formatTimeLeft(idleWarningSeconds ?? 0)} unless you&apos;re still here.
      </p>

      <Button className="mt-6 w-full" onClick={stillHere}>
        I&apos;m still here
      </Button>
    </Dialog>
  );
}

export default IdleWarningDialog;

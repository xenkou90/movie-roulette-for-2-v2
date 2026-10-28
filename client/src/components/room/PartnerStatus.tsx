import type { RoomPlayerView } from "@movie-roulette/shared";
import DelayedReveal from "../ui/DelayedReveal";

const AWAY_DELAY_MS = 1000;

interface PartnerStatusProps {
  partner: RoomPlayerView;
}

function PartnerStatus({ partner }: PartnerStatusProps) {
  const present = (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-success"
      />
      <span className="min-w-0 truncate">with {partner.name}</span>
    </span>
  );

  if (partner.connected) {
    return present;
  }

  return (
    <DelayedReveal delayMs={AWAY_DELAY_MS} fallback={present}>
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-brand-yellow motion-safe:animate-pulse"
        />
        <span className="min-w-0 truncate">{partner.name} reconnecting…</span>
      </span>
    </DelayedReveal>
  );
}

export default PartnerStatus;

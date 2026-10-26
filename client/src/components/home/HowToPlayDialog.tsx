import { useId } from "react";
import Dialog from "../ui/Dialog";

interface HowToPlayDialogProps {
    open: boolean;
    onClose: () => void;
}

function HowToPlayDialog({ open, onClose }: HowToPlayDialogProps) {
    const creditsId = useId();

    return (
        <Dialog open={open} title="How it works" onClose={onClose} showCloseButton>
            <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 text-sm marker:font-heading">
                <li>
                    <strong className="font-heading uppercase">Create a room.</strong>{" "}
                    You&apos;ll get a 5-digit code to share with a friend.
                </li>
                <li>
                    <strong className="font-heading uppercase">Your friend joins</strong>{" "}
                    with the code or your invite link.
                </li>
                <li>
                    <strong className="font-heading uppercase">You both pick.</strong>{" "}
                    Tap Nope or I&apos;m in. Your picks stay secret — your friend never
                    sees which movies you liked.
                </li>
                <li>
                    <strong className="font-heading uppercase">It&apos;s a match</strong>{" "}
                    when you both say I&apos;m in to the same movie. Movie night,
                    decided.
                </li>
            </ol>

            <p className="mt-4 text-xs opacity-70">
                No accounts, no sign-up, no ads. On a keyboard, use ← and → to decide.
            </p>

            <section
                aria-labelledby={creditsId}
                className="mt-6 border-t-2 border-ink/10 pt-4"
            >
                <h3 id={creditsId} className="font-heading text-sm uppercase">
                    Credits
                </h3>

                <p className="mt-2 text-xs">
                    Imagined, created and designed by Xeno.
                </p>

                <a
                    href="https://www.themoviedb.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                    <img src="/tmdb-logo.svg" alt="TMDB" className="h-4 w-auto" />
                    <span className="sr-only"> (opens in  a new tab)</span>
                </a>

                <p className="mt-2 text-xs">
                    This product uses the TMDB API but is not endorsed or certified by
                    TMDB.
                </p>
            </section>
        </Dialog>
    );
}

export default HowToPlayDialog;
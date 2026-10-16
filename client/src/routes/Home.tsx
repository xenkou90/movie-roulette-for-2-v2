import { useState } from "react";
import { useNavigate } from "react-router";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import HowToPlayDialog from "../components/home/HowToPlayDialog";

function Home() {
    const navigate = useNavigate();
    const [showHowToPlay, setShowHowToPlay] = useState(false);

    return (
        <Screen>
            <div className="flex gap-2" aria-hidden="true">
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-brand-pink" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-brand-yellow" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-surface" />
            </div>

            <Card className="text-center">
                <h1 className="font-heading text-5xl leading-none tracking-tight uppercase">
                    Movie
                    <br />
                    Roulette
                    <span className="mt-3 inline-block rounded-md border-2 border-ink bg-brand-yellow px-3 py-1 text-2xl">
                        for 2
                    </span>
                </h1>

                <p className="mt-4 text-xs uppercase tracking-[0.25rem] opacity-60">
                    Swipe · Match · Watch
                </p>
            </Card>

            <div className="flex w-full max-w-sm flex-col gap-4">
                <Button onClick={() => navigate("/create")}>Create a Room</Button>
                <Button variant="secondary" onClick={() => navigate("/join")}>
                    Enter a Room
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowHowToPlay(true)}>
                    How it works
                </Button>
            </div>

            <div className="flex gap-2" aria-hidden="true">
                <span className="h-2 w-8 rounded-full border border-ink bg-brand-yellow" />
                <span className="h-2 w-8 rounded-full border border-ink bg-surface" />
                <span className="h-2 w-8 rounded-full border border-ink bg-brand-pink" />
            </div>

            <p className="text-[0.625rem] uppercase tracking-[0.2rem] opacity-60">
                Imagined, created, designed by Xeno
            </p>

            <HowToPlayDialog
                open={showHowToPlay}
                onClose={() => setShowHowToPlay(false)}
            />
        </Screen>
    );
}

export default Home;
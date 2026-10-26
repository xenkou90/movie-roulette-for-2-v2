import type { Movie } from "@movie-roulette/shared";
import { imdbUrl, letterboxdUrl } from "../../lib/movieLinks";
import ExternalLinkButton from "../ui/ExternalLinkButton";

interface MovieLinksProps {
    movie: Movie;
}

function MovieLinks({ movie }: MovieLinksProps) {
    return (
        <div className="flex justify-center gap-3">
            <ExternalLinkButton href={imdbUrl(movie)} variant="imdb" size="sm">
                IMDb
            </ExternalLinkButton>
            <ExternalLinkButton
                href={letterboxdUrl(movie)}
                variant="letterboxd"
                size="sm"
            >
                Letterboxd
            </ExternalLinkButton>
        </div>
    );
}

export default MovieLinks;
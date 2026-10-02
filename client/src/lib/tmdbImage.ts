const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const POSTER_WIDTHS = [342, 500, 780] as const;

type PosterWidth = (typeof POSTER_WIDTHS)[number];

export function posterSrc(path: string, width: PosterWidth = 500): string {
    return `${TMDB_IMAGE_BASE}/w${width}${path}`;
}

export function posterSrcSet(path: string): string {
    return POSTER_WIDTHS.map(
        (width) => `${posterSrc(path, width)} ${width}w`,
    ).join(", ");
}
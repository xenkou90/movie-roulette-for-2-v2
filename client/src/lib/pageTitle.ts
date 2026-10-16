const APP_NAME = "Movie Roulette for 2";

export function pageTitle(section?: string): string {
    return section === undefined ? APP_NAME : `${section} · ${APP_NAME}`;
}
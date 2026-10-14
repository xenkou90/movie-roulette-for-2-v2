export function joinLink(code: string): string {
    const url = new URL("/join", window.location.origin);
    url.searchParams.set("code", code);
    return url.toString();
}
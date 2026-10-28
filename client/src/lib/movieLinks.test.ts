import { describe, expect, it } from "vitest";
import { imdbUrl, letterboxdUrl } from "./movieLinks";
import { makeMovie } from "../test/fixtures";

describe("imdbUrl", () => {
  it("links to the title page when the IMDb ID is known", () => {
    const movie = makeMovie({ imdbId: "tt0137523" });

    expect(imdbUrl(movie)).toBe("https://www.imdb.com/title/tt0137523/");
  });

  it("falls back to a search by title and year", () => {
    const movie = makeMovie({ title: "Dune", releaseYear: 2021, imdbId: null });

    expect(imdbUrl(movie)).toBe("https://www.imdb.com/find/?q=Dune%202021");
  });

  it("encodes characters that have meaning in URLs", () => {
    const movie = makeMovie({
      title: "Fast & Furious",
      releaseYear: 2009,
      imdbId: null,
    });

    expect(imdbUrl(movie)).toBe(
      "https://www.imdb.com/find/?q=Fast%20%26%20Furious%202009",
    );
  });

  it("leaves out the year when it is unknown", () => {
    const movie = makeMovie({ title: "Dune", releaseYear: null, imdbId: null });

    expect(imdbUrl(movie)).toBe("https://www.imdb.com/find/?q=Dune");
  });
});

describe("letterboxdUrl", () => {
  it("links by TMDB ID", () => {
    const movie = makeMovie({ id: 550 });

    expect(letterboxdUrl(movie)).toBe("https://letterboxd.com/tmdb/550/");
  });
});

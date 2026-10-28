import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MovieMeta from "./MovieMeta";
import { makeMovie } from "../../test/fixtures";

describe("MovieMeta", () => {
  it("shows runtime, rating, and up to three genres", () => {
    render(
      <MovieMeta
        movie={makeMovie({
          runtimeMinutes: 138,
          rating: 7.84,
          genres: ["Drama", "Thriller", "Crime", "Mystery"],
        })}
      />,
    );

    expect(screen.getByText("2h 18m")).toBeInTheDocument();
    expect(screen.getByText(/7\.8/)).toBeInTheDocument();
    expect(screen.getByText(/Drama, Thriller, Crime/)).toBeInTheDocument();
    expect(screen.queryByText(/Mystery/)).not.toBeInTheDocument();
  });

  it("gives screen readers words instead of symbols", () => {
    render(
      <MovieMeta movie={makeMovie({ runtimeMinutes: 138, rating: 7.8 })} />,
    );

    expect(screen.getByText("Runtime 138 minutes")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
  });

  it("says when a movie hasn't been rated yet", () => {
    render(<MovieMeta movie={makeMovie({ rating: 0 })} />);

    expect(screen.getByText(/Not rated yet/)).toBeInTheDocument();
  });

  it("leaves out the runtime when it isn't known", () => {
    render(<MovieMeta movie={makeMovie({ runtimeMinutes: null })} />);

    expect(screen.queryByText(/Runtime/)).not.toBeInTheDocument();
  });
});

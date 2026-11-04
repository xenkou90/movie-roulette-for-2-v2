import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import JoinRoom from "./JoinRoom";

vi.mock("../hooks/useSocket", () => ({
  useSocket: () => ({ socket: { emit: vi.fn() }, isConnected: true }),
}));

vi.mock("../hooks/useRoom", () => ({
  useRoom: () => ({ current: null, enterRoom: vi.fn() }),
}));

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <JoinRoom />
    </MemoryRouter>,
  );
}

const invitation = /your friend wants to pick a movie with you/i;

describe("JoinRoom", () => {
  it("explains the invitation when opened from an invite link", () => {
    renderAt("/join?code=12345");

    expect(screen.getByText(invitation)).toBeInTheDocument();
    expect(screen.getByLabelText(/room code/i)).toHaveValue("12345");
  });

  it("reads the invitation with the name field, which has focus", () => {
    renderAt("/join?code=12345");

    const nameField = screen.getByLabelText(/your name/i);
    expect(nameField).toHaveFocus();
    expect(nameField).toHaveAccessibleDescription(invitation);
  });

  it("shows no invitation when the code is typed by hand", async () => {
    const user = userEvent.setup();
    renderAt("/join");

    await user.type(screen.getByLabelText(/room code/i), "12345");

    expect(screen.queryByText(invitation)).not.toBeInTheDocument();
  });

  it("shows no invitation for an invalid code in the link", () => {
    renderAt("/join?code=abc");

    expect(screen.queryByText(invitation)).not.toBeInTheDocument();
  });
});

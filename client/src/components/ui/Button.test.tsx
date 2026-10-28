import type { FormEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);

    await user.click(screen.getByRole("button", { name: "Go" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a plain button by default, so it never submits a form by accident", () => {
    render(<Button>Go</Button>);

    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("ignores presses while pending", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button pending onClick={onClick}>
        Go
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Go" });
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("stays focusable while pending", async () => {
    const user = userEvent.setup();
    render(<Button pending>Go</Button>);

    await user.tab();

    expect(screen.getByRole("button", { name: "Go" })).toHaveFocus();
  });

  it("cannot be focused when disabled", async () => {
    const user = userEvent.setup();
    render(<Button disabled>Go</Button>);

    await user.tab();

    expect(screen.getByRole("button", { name: "Go" })).not.toHaveFocus();
  });

  it("doesn't submit its form while pending", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" pending>
          Send
        </Button>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

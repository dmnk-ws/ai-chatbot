import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Tooltip from "@/components/elements/Tooltip";

function renderTooltip() {
  render(
    <Tooltip label="Send message">
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  return screen.getByRole("button", { name: "Trigger" });
}

describe("Tooltip", () => {
  it("shows its label while hovering the trigger", () => {
    const trigger = renderTooltip();

    fireEvent.mouseEnter(trigger);
    expect(screen.getByText("Send message")).toBeTruthy();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText("Send message")).toBeNull();
  });

  it("shows its label while the trigger has keyboard focus", () => {
    const trigger = renderTooltip();

    fireEvent.focus(trigger);
    expect(screen.getByText("Send message")).toBeTruthy();

    fireEvent.blur(trigger);
    expect(screen.queryByText("Send message")).toBeNull();
  });

  it("hides on Escape", () => {
    const trigger = renderTooltip();

    fireEvent.mouseEnter(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText("Send message")).toBeNull();
  });

  it("is not announced separately to assistive technology", () => {
    const trigger = renderTooltip();

    fireEvent.mouseEnter(trigger);

    expect(screen.getByText("Send message").getAttribute("aria-hidden")).toBe(
      "true",
    );
  });
});

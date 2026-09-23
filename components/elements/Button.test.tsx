import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Button from "@/components/elements/Button";

describe("Button", () => {
  it("names an icon-only button by its label", () => {
    render(
      <Button ariaLabel="Retry">
        <svg />
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("shows its label as a tooltip when asked to", () => {
    render(
      <Button ariaLabel="Retry" tooltip="top">
        <svg />
      </Button>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByText("Retry")).toBeTruthy();
  });

  it("shows no tooltip otherwise", () => {
    render(
      <Button ariaLabel="Retry">
        <svg />
      </Button>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Retry" }));

    expect(screen.queryByText("Retry")).toBeNull();
  });
});

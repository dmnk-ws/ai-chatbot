import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Menu from "@/components/elements/Menu";

function renderMenu() {
  const rename = vi.fn();
  const remove = vi.fn();
  render(
    <>
      <p>Outside</p>
      <Menu
        label="Chat options"
        icon={<svg />}
        items={[
          { label: "Rename", icon: <svg />, onSelect: rename },
          { label: "Delete", icon: <svg />, onSelect: remove, danger: true },
        ]}
      />
    </>,
  );
  return {
    rename,
    remove,
    trigger: screen.getByRole("button", { name: "Chat options" }),
  };
}

function items() {
  return screen.getAllByRole("menuitem");
}

describe("Menu", () => {
  it("opens with its items and focuses the first one", () => {
    const { trigger } = renderMenu();

    fireEvent.click(trigger);

    expect(screen.getByRole("menu", { name: "Chat options" })).toBeTruthy();
    expect(items().map((item) => item.textContent)).toEqual([
      "Rename",
      "Delete",
    ]);
    expect(document.activeElement).toBe(items()[0]);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("moves between items with the arrow keys", () => {
    const { trigger } = renderMenu();
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu");

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items()[1]);

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items()[0]);

    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(document.activeElement).toBe(items()[1]);
  });

  it("closes on Escape and returns focus to the trigger", () => {
    const { trigger } = renderMenu();
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when clicking outside", () => {
    const { trigger } = renderMenu();
    fireEvent.click(trigger);

    fireEvent.mouseDown(screen.getByText("Outside"));

    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("runs the chosen item and closes", () => {
    const { trigger, rename, remove } = renderMenu();
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));

    expect(rename).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

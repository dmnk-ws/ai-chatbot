import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Button from "@/components/elements/Button";
import Modal from "@/components/elements/Modal";

function renderModal(open = true) {
  const onClose = vi.fn();
  render(
    <>
      <Button>Trigger</Button>
      <Modal
        open={open}
        onClose={onClose}
        title="Delete file?"
        actions={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Delete</Button>
          </>
        }
      >
        This cannot be undone.
      </Modal>
    </>,
  );
  return onClose;
}

describe("Modal", () => {
  it("renders nothing when closed", () => {
    renderModal(false);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows a dialog named by its title", () => {
    renderModal();

    const dialog = screen.getByRole("dialog", { name: "Delete file?" });
    expect(dialog.textContent).toContain("This cannot be undone.");
  });

  it("moves focus to the first action", () => {
    renderModal();

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Cancel" }),
    );
  });

  it("closes on Escape", () => {
    const onClose = renderModal();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });

  it("closes when clicking outside the dialog", () => {
    const onClose = renderModal();

    fireEvent.click(screen.getByRole("dialog").parentElement!);

    expect(onClose).toHaveBeenCalled();
  });

  it("stays open when clicking inside the dialog", () => {
    const onClose = renderModal();

    fireEvent.click(screen.getByText("This cannot be undone."));

    expect(onClose).not.toHaveBeenCalled();
  });
});

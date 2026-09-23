"use client";

import React, {
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import Button, { ButtonVariant } from "@/components/elements/Button";
import type { TooltipSide } from "@/components/elements/Tooltip";

export interface MenuItem {
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

interface MenuProps {
  label: string;
  icon: ReactNode;
  items: MenuItem[];
  tooltip?: TooltipSide;
  triggerVariant?: ButtonVariant;
}

const GAP = 4;

export default function Menu({
  label,
  icon,
  items,
  tooltip,
  triggerVariant,
}: MenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });

  const itemButtons = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
    );

  useLayoutEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current?.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    if (!trigger) return;

    const fitsBelow = trigger.bottom + GAP + menuHeight <= window.innerHeight;
    setStyle({
      left: trigger.left,
      top: fitsBelow ? trigger.bottom + GAP : trigger.top - GAP - menuHeight,
    });
    itemButtons()[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const close = ({ returnFocus }: { returnFocus: boolean }) => {
    setOpen(false);
    setStyle({ opacity: 0 });
    if (returnFocus) triggerRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = itemButtons();
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === "Escape") {
      e.preventDefault();
      close({ returnFocus: true });
    } else if (e.key === "Tab") {
      close({ returnFocus: false });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    }
  };

  const select = (item: MenuItem) => {
    close({ returnFocus: false });
    item.onSelect();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant={triggerVariant}
        ariaLabel={label}
        ariaHasPopup="menu"
        ariaExpanded={open}
        tooltip={tooltip}
        onClick={() => (open ? close({ returnFocus: false }) : setOpen(true))}
      >
        {icon}
      </Button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            style={style}
            onKeyDown={handleKeyDown}
            className="fixed z-50 flex flex-col min-w-[120px] p-1 rounded-lg border border-gray-300 bg-white shadow-lg"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => select(item)}
                className={`grid grid-cols-[16px_1fr] gap-2 items-center w-full px-2 py-1 rounded-lg text-xs text-left cursor-pointer hover:bg-gray-100 focus-visible:bg-gray-100 focus:outline-none ${item.danger ? "text-red-600" : ""}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

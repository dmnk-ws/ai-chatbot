"use client";

import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type TooltipSide = "top" | "right" | "bottom";

interface TooltipProps {
  label: string;
  side?: TooltipSide;
  children: ReactNode;
}

const GAP = 8;

function position(rect: DOMRect, side: TooltipSide): CSSProperties {
  switch (side) {
    case "top":
      return {
        top: rect.top - GAP,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
      };
    case "bottom":
      return {
        top: rect.bottom + GAP,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + GAP,
        transform: "translateY(-50%)",
      };
  }
}

export default function Tooltip({
  label,
  side = "top",
  children,
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  const show = () => {
    const rect = triggerRef.current?.firstElementChild?.getBoundingClientRect();
    if (rect) setStyle(position(rect, side));
  };
  const hide = () => setStyle(null);

  useEffect(() => {
    if (!style) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStyle(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [style]);

  return (
    <span
      ref={triggerRef}
      className="contents"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) show();
      }}
      onBlur={hide}
    >
      {children}
      {style &&
        createPortal(
          <span
            aria-hidden="true"
            style={style}
            className="fixed z-50 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap pointer-events-none"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}

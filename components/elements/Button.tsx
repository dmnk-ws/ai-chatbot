import React, { ReactNode } from "react";

import Tooltip, { TooltipSide } from "@/components/elements/Tooltip";

type ButtonVariant = "icon" | "item" | "primary" | "secondary";

interface ButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  ariaLabel?: string;
  tooltip?: TooltipSide;
}

const VARIANTS: Record<ButtonVariant, { base: string; enabled: string }> = {
  icon: { base: "p-2 rounded-md", enabled: "hover:bg-gray-200" },
  item: {
    base: "flex items-center gap-4 w-full h-9 p-2 rounded-lg text-sm font-medium",
    enabled: "hover:bg-gray-200",
  },
  primary: {
    base: "py-2 px-4 rounded-md text-sm font-medium bg-black text-white",
    enabled: "hover:opacity-80",
  },
  secondary: {
    base: "py-2 px-4 rounded-md text-sm font-medium",
    enabled: "hover:bg-gray-100",
  },
};

function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "icon",
  ariaLabel,
  tooltip,
}: ButtonProps) {
  const { base, enabled } = VARIANTS[variant];

  const button = (
    <button
      className={`transition-colors ${base} ${
        disabled
          ? "cursor-not-allowed opacity-50 bg-gray-100"
          : `cursor-pointer ${enabled}`
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );

  if (!tooltip || !ariaLabel) return button;

  return (
    <Tooltip label={ariaLabel} side={tooltip}>
      {button}
    </Tooltip>
  );
}

export default Button;

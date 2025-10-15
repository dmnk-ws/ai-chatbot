import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}

function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      className={`p-2 rounded-md transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-50 bg-gray-100"
          : "cursor-pointer hover:bg-gray-200"
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;

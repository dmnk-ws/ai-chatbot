import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}

function Button({ children, onClick, type = "button" }: ButtonProps) {
  return (
    <button
      className="cursor-pointer p-2 hover:bg-gray-200 rounded-md"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export default Button;

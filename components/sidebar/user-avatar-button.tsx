import { User } from "lucide-react";
import React from "react";

import Button from "@/components/elements/Button";

interface UserAvatarButtonProps {
  label: string;
  onClick: () => void;
}

export default function UserAvatarButton({
  label,
  onClick,
}: UserAvatarButtonProps) {
  return (
    <Button variant="item" ariaLabel={label} tooltip="right" onClick={onClick}>
      <User className="w-4 h-4 shrink-0 text-black" />
    </Button>
  );
}

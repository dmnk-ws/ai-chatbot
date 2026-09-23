"use client";

import { SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import Button from "@/components/elements/Button";
import Modal from "@/components/elements/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { useGuestChat } from "@/contexts/GuestChatContext";

interface NewChatButtonProps {
  open: boolean;
  onNavigate?: () => void;
}

function NewChatButton({ open, onNavigate }: NewChatButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { hasMessages, clearGuestChat } = useGuestChat();
  const { startNewChat } = useChatHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  const handleNewChat = () => {
    if (!isAuthenticated && hasMessages) {
      setConfirmOpen(true);
      return;
    }
    startNewChat();
    router.push("/new");
    onNavigate?.();
  };

  const handleClear = () => {
    clearGuestChat();
    startNewChat();
    closeConfirm();
    onNavigate?.();
  };

  const handleLogin = () => {
    closeConfirm();
    router.push("/login");
  };

  return (
    <>
      <Button
        variant="item"
        ariaLabel="New chat"
        tooltip={open ? undefined : "right"}
        onClick={handleNewChat}
      >
        <SquarePen className="w-4 h-4 shrink-0 text-black" />
        {open && <span>New chat</span>}
      </Button>
      <Modal
        open={confirmOpen}
        onClose={closeConfirm}
        title="Start a new chat?"
        actions={
          <>
            <Button variant="secondary" onClick={handleClear}>
              Clear chat
            </Button>
            <Button variant="primary" onClick={handleLogin}>
              Log in
            </Button>
          </>
        }
      >
        Your current chat isn&apos;t saved. Log in to keep it.
      </Modal>
    </>
  );
}

export default NewChatButton;

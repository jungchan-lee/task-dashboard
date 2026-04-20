import { useState } from "react";
import { WSMessage } from "@/types/negotiationResponse";
import { Message } from "@/types/negotiation";
import { NegotiationMapper } from "./negotiationMapper";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSocketResponse = (data: WSMessage) => {
    const msg = NegotiationMapper.toMessage(data);

    if (!msg) return;

    setMessages((prev) => [...prev, msg]);
  };

  const sendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "BUYER", content: text },
    ]);
  };

  return {
    messages,
    sendMessage,
    handleSocketResponse,
  };
}
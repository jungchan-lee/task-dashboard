"use client";

import { useState } from "react";

type Props = {
  onSend: (msg: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    onSend(input);
    setInput("");
  };

  return (
  <form
    onSubmit={handleSubmit}
    className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full shadow-sm"
  >
    {/* 아이콘 */}
    <div className="text-gray-400 text-xl">📎</div>

    {/* 입력창 */}
    <input
      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type your negotiation strategy..."
    />

    {/* 전송 버튼 */}
    <button
      type="submit"
      className="w-8 h-8 flex items-center justify-center rounded-full bg-green-700 text-white hover:bg-green-800 transition"
    >
      ➤
    </button>
  </form>
);
}
"use client";

import { useState } from "react";

type Message = {
  role: string;
  content: string;
};

type Group = {
  title: string;
  messages: Message[];
};

export default function NegotiationPanel({ groups }: { groups: Group[] }) {
  return (
    <div className="space-y-4">

      {/* 타이틀 */}
      <div className="text-lg font-semibold text-gray-800">
        협상 내역
      </div>

      {/* 리스트 */}
      <div className="space-y-2">
        {groups.map((group, idx) => (
          <div
            key={group.title + idx}
            className="bg-white rounded-xl p-3 shadow-sm hover:bg-gray-50 transition cursor-pointer"
          >
            <GroupItem group={group} />
          </div>
        ))}
      </div>

    </div>
  );
}

function GroupItem({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">

      <div
        onClick={() => setOpen(!open)}
        className="
          cursor-pointer
          p-3 rounded-lg
          bg-white/5 border border-white/10
          hover:bg-white/10
        "
      >
        {group.title}
      </div>

      {open && (
        <div className="pl-4 space-y-2">
          {group.messages.map((msg, i) => (
            <div key={i} className="text-sm text-white/80">
              [{msg.role}] {msg.content}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
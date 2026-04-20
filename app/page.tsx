"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import { useChat } from "../services/useChat";
import { connectSocket, sendSocketMessage } from "../services/chat";
import { NegotiationMapper } from "../services/negotiationMapper";
import { Group } from "@/types/negotiation";
import { WSMessage } from "@/types/negotiationResponse";
import NegotiationTimeline from "@/components/NegotiationTimeLine";

export default function Page() {
  const { messages, sendMessage, handleSocketResponse } = useChat();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    connectSocket((data: WSMessage) => {
      
    // 1️⃣ [핵심] 모든 데이터를 매퍼로 변환 시도
    const message = NegotiationMapper.toMessage(data);

    if (message) {
      // 2️⃣ 채팅창과 사이드바가 공유하는 messages 배열 업데이트
      // handleSocketResponse 내부에서 setMessages((prev) => [...prev, msg])가 실행되어야 함
      handleSocketResponse(data); 

      // 3️⃣ 사이드바용 그룹 데이터 업데이트 (필요한 경우만)
      setGroups((prev) => {
        if (prev.length === 0 && data.type === "INFO") {
          return [NegotiationMapper.createInitialGroup(data)];
        }
        if (prev.length > 0) {
          const updated = [...prev];
          updated[0] = NegotiationMapper.appendMessage(updated[0], message);
          return updated;
        }
        return prev;
      });
    }

    });
  }, []);

  const handleSend = (text: string) => {
    sendMessage(text);
    sendSocketMessage(text);
  };

  return (
    <div className="w-full h-screen bg-[#f3f4f6] flex flex-col">
      
      {/* 🔹 상단 바 */}
      <div className="h-16 flex items-center justify-between px-6 bg-[#effdf6] backdrop-blur-sm border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold">
            AM
          </div>
          <div className="font-semibold text-gray-800">
            Agent Market
          </div>
        </div>

        <div className="text-sm text-gray-600 font-medium">
          NEGOTIATOR ALPHA
        </div>
      </div>

      {/* ✅ 상단 빈 영역 (나중에 타임라인/그래프 들어갈 자리) */}
      <NegotiationTimeline messages={messages} />
  
      {/* ✅ 메인 영역 (4:6) */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6 bg-[#f6faf9]">
  
      {/* 🔹 좌측 */}
      <div className="w-2/5 bg-white rounded-2xl shadow-sm overflow-y-auto">
        <Sidebar messages={messages} />
      </div>

      {/* 🔹 우측 */}
      <div className="w-3/5 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        
        {/* 채팅 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          <MessageList messages={messages} />
        </div>

        {/* 입력창 */}
        <div className="px-4 py-3 bg-white">
          <ChatInput onSend={handleSend} />
        </div>
      </div>

    </div>
    </div>
  );
}
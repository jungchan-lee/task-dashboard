import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/negotiation";
import { ReceiptText } from "lucide-react";
import ReceiptModal from "./ReceiptModal"; // 👈 분리한 컴포넌트 임포트

type Props = {
  messages: Message[];
};

export default function MessageList({ messages }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");

  const visibleMessages = messages.filter(msg => msg.meta?.type !== "DECISION");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto p-6 space-y-6">
      {visibleMessages.map((msg, i) => {
        const isRightSide = msg.role === "BUYER";
        const isSystem = msg.role === "SYSTEM";
        const isFinalResult = msg.meta?.type === "FINAL_RESULT";

        // 1. 시스템 메시지
        if (isSystem && msg.meta?.type === "TURN_UPDATE") {
          return (
            <div key={`system-${i}`} className="flex justify-center my-2">
              <div className="px-4 py-1 bg-gray-200/50 rounded-full text-[11px] text-gray-500 font-medium">
                {msg.content}
              </div>
            </div>
          );
        }

        // 2. FINAL_RESULT 버튼
        if (isFinalResult) {
          const isSuccess = msg.meta?.status === "SUCCESS";
          return (
            <div key={`final-${i}`} className="flex justify-center my-10 animate-bubble">
              <button 
                onClick={() => {
                  setSelectedReport(msg.content);
                  setIsReceiptOpen(true);
                }}
                className="group relative flex flex-col items-center gap-4 bg-white border-2 border-[#1a4d3a] p-8 rounded-[32px] shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className={`absolute -top-4 px-4 py-1 rounded-full text-white text-[10px] font-black tracking-widest shadow-md ${isSuccess ? 'bg-blue-500' : 'bg-red-500'}`}>
                  {msg.meta?.status}
                </div>
                <div className="bg-[#f0f7f4] group-hover:bg-[#1a4d3a] p-4 rounded-2xl transition-colors duration-300">
                  <ReceiptText size={36} className="text-[#1a4d3a] group-hover:text-white" />
                </div>
                <div className="text-center">
                  <h4 className="text-[#1a4d3a] font-black text-xl mb-1">협상 리포트 도착</h4>
                  <p className="text-gray-400 text-xs font-medium">최종 결과를 확인하려면 클릭하세요</p>
                </div>
              </button>
            </div>
          );
        }

        if (isSystem) return null;

        // 3. 일반 채팅 (사용자가 변경한 색상 유지)
        return (
          <div key={`msg-${i}`} className={`flex ${isRightSide ? "justify-end" : "justify-start"} animate-bubble`}>
            <div className={`flex gap-3 max-w-[85%] ${isRightSide ? "flex-row-reverse" : "flex-row"}`}>
              {!isRightSide && (
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-sm mt-1">
                  <span className="text-xl">🤖</span>
                </div>
              )}
              <div className={`flex flex-col ${isRightSide ? "items-end" : "items-start"}`}>
                {!isRightSide && (
                  <span className="text-[12px] text-gray-500 font-bold mb-1.5 ml-1 uppercase tracking-tight">{msg.role}</span>
                )}
                <div className={`px-4 py-3 rounded-[20px] shadow-sm text-[14.5px] leading-relaxed ${
                  isRightSide ? "bg-[#c8ebfd] text-[#3c4043] rounded-tr-none" : "bg-[#eff5f4] text-[#3c4043] rounded-tl-none border border-gray-100"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      <div ref={bottomRef} className="h-4" />

      {/* 🟢 분리된 영수증 모달 사용 */}
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        content={selectedReport} 
      />
    </div>
  );
}
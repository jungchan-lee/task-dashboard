import { Message } from "@/types/negotiation";
import { useMemo, useRef } from "react";
import { User, Store } from "lucide-react";

interface Props {
  messages: Message[];
}

export default function NegotiationTimeline({ messages }: Props) {
  const normalize = (text: any) => String(text || "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();

  // 1. 벤더 목록 추출
  const vendors = useMemo(() => {
    const nameMap = new Map<string, string>();
    messages.forEach((m) => {
      if (m.role?.toUpperCase().startsWith("VENDOR")) {
        const key = normalize(m.role);
        if (key.length >= 7 && !nameMap.has(key)) {
          nameMap.set(key, m.role.replace(/_/g, " ").toUpperCase());
        }
      }
    });
    return Array.from(nameMap.entries()).map(([id, label]) => ({ id, label })).sort((a, b) => a.id.localeCompare(b.id));
  }, [messages]);

  // 2. 하이라이트 상태 유지 및 FINAL_RESULT 즉시 강제 종료
  const lastValidState = useRef({ sender: "", receivers: [] as string[] });

  const activeData = useMemo(() => {
    if (messages.length === 0) return { sender: "", receivers: [] };

    // [중요] 배열의 가장 마지막 메시지를 무조건 먼저 확인 (로딩 제외)
    const absoluteLast = [...messages].reverse().find(m => !m.loading);
    
    // ⭐ 가장 마지막 메시지가 FINAL_RESULT라면, 이전 상태 다 버리고 무조건 종료
    if (absoluteLast?.meta?.type === "FINAL_RESULT") {
      lastValidState.current = { sender: "", receivers: [] };
      return lastValidState.current;
    }

    // FINAL_RESULT가 아닐 때만 "데이터가 있는" 유효 메시지를 찾아서 업데이트
    const validMsg = [...messages].reverse().find(m => 
      !m.loading && 
      m.meta && 
      (m.meta.receivers || (m.meta as any).receiver)
    );

    if (validMsg && validMsg.meta) {
      const sender = normalize(validMsg.role);
      const rawRec = validMsg.meta.receivers || (validMsg.meta as any).receiver || [];
      const receivers = Array.isArray(rawRec) ? rawRec.map(r => normalize(r)) : [normalize(rawRec)];
      
      lastValidState.current = { sender, receivers };
    }

    return lastValidState.current;
  }, [messages]);

  // 3. 하이라이트 판정
  const isBuyerActive = useMemo(() => {
    const { sender, receivers } = activeData;
    if (!sender && receivers.length === 0) return false;
    return sender === "BUYER" || sender === "USER" || receivers.some(r => r === "BUYER" || r === "USER");
  }, [activeData]);

  const isVendorActive = (vendorId: string) => {
    const { sender, receivers } = activeData;
    if (!sender && receivers.length === 0) return false;
    const target = normalize(vendorId);
    return sender === target || receivers.includes(target);
  };

  // 4. 선 길이 계산
  const activeLineStyle = useMemo(() => {
    // 아무도 활성화 안 되어 있으면 0%
    if (!isBuyerActive && !vendors.some(v => isVendorActive(v.id))) return { width: "0%" };
    
    const lastIdx = vendors.reduce((max, v, idx) => isVendorActive(v.id) ? Math.max(max, idx) : max, -1);
    if (lastIdx >= 0) return { width: `${50 + ((lastIdx + 1) * (45 / (vendors.length || 1)))}%` };
    return { width: isBuyerActive ? "32%" : "0%" };
  }, [vendors, isBuyerActive, activeData]);

  return (
    <div className="h-44 bg-[#f6faf9] flex items-center justify-center px-10 shrink-0">
      <div className="relative flex items-center justify-between w-full max-w-5xl">
        <div className="absolute h-[1px] bg-gray-200 left-8 right-8 top-[48%] -translate-y-1/2" />
        <div 
          className="absolute h-[2.5px] bg-[#1a4d3a] left-8 top-[48%] -translate-y-1/2 transition-all duration-500 ease-in-out"
          style={activeLineStyle}
        />

        <div className="flex flex-col items-center gap-3 w-24 z-10 bg-[#f6faf9] py-2 relative">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 bg-white
            ${isBuyerActive ? "border-[3.5px] border-[#1a4d3a] shadow-xl scale-110 -translate-y-3" : "border border-gray-100 opacity-20 scale-95"}
          `}>
            <User size={28} className={isBuyerActive ? "text-[#1a4d3a] stroke-[2.5px]" : "text-gray-300"} />
            {isBuyerActive && <div className="absolute -bottom-14 bg-[#1a4d3a] text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md">ACTIVE</div>}
          </div>
          <span className={`text-[11px] transition-all ${isBuyerActive ? "text-[#1a4d3a] font-black" : "text-gray-300"}`}>YOU (BUYER)</span>
        </div>

        <div className="z-10 bg-[#f6faf9] px-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all duration-500 ${isBuyerActive || vendors.some(v => isVendorActive(v.id)) ? "bg-[#1a4d3a] text-white" : "bg-gray-100 text-gray-300"}`}>
            <span className="text-xs font-bold">⇌</span>
          </div>
        </div>

        <div className="flex gap-10 items-center z-10 bg-[#f6faf9] pl-4 py-2">
          {vendors.map((v) => {
            const active = isVendorActive(v.id);
            return (
              <div key={v.id} className="flex flex-col items-center gap-3 w-20 relative">
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white
                  ${active ? "border-[3.5px] border-[#1a4d3a] shadow-xl scale-110 -translate-y-3" : "border border-gray-100 opacity-20 scale-95"}
                `}>
                  <Store size={28} className={active ? "text-[#1a4d3a] stroke-[2.5px]" : "text-gray-300"} />
                  {active && <div className="absolute -bottom-14 bg-[#1a4d3a] text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md">ACTIVE</div>}
                </div>
                <span className={`text-[11px] transition-all ${active ? "text-[#1a4d3a] font-black" : "text-gray-300"}`}>{v.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
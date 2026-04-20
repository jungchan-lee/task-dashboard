// NegotiationTimeline.tsx

import { Message } from "@/types/negotiation";
import { useMemo } from "react";
import { User, Store } from "lucide-react";

interface Props {
  messages: Message[];
}

export default function NegotiationTimeline({ messages }: Props) {
  // 공백, 언더바 제거하고 대문자로 통일 (비교용)
  const normalize = (text: string) => text?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

  // 1. 중복 제거된 벤더 목록
  const vendors = useMemo(() => {
  const nameMap = new Map<string, string>(); 
  
  messages.forEach((m) => {
    // 1. role이 있고 VENDOR로 시작해야 함
    // 2. 동시에 "VENDOR" 그 자체이거나 "VENDOR_" 형태인 것은 무시 (구체적인 이름이 있는 것만 수집)
    if (m.role && m.role.startsWith("VENDOR")) {
      const key = normalize(m.role);
      
      // 구체적인 이름이 붙은 경우만 추가 (예: VENDORA, VENDORB 등)
      // "VENDOR"라는 6글자보다 긴 경우만 통과시키면 깔끔합니다.
      if (key.length > 6) { 
        if (!nameMap.has(key)) {
          nameMap.set(key, m.role.replace('_', ' ').toUpperCase());
        }
      }
    }
  });
  
  return Array.from(nameMap.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.id.localeCompare(b.id));
}, [messages]);

  // 2. 현재 활성화된 벤더 찾기
  const activeVendorId = useMemo(() => {
    if (messages.length === 0) return null;

    // 🟢 최신 메시지 확인
    const lastMessage = messages[messages.length - 1];

    // 🟢 FINAL_RESULT가 온 경우 즉시 하이라이트 종료
    if (lastMessage.meta?.type === "FINAL_RESULT") {
      return null;
    }

    // 🟢 그 외에는 뒤에서부터 찾아서 가장 최근의 TURN_UPDATE를 가진 벤더를 유지
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.meta?.type === "TURN_UPDATE" && m.role) {
        return normalize(m.role);
      }
    }
    
    return null;
  }, [messages]);

  const activeIndex = vendors.findIndex(v => v.id === activeVendorId);

  return (
    <div className="h-44 bg-[#f6faf9] flex items-center justify-center px-10 overflow-hidden">
      <div className="relative flex items-center justify-between w-full max-w-5xl">
        
        <div className="absolute h-[1px] bg-gray-200 left-8 right-8 top-[48%] -translate-y-1/2 z-0" />

        {/* 하이라이트 선 */}
        <div 
          className="absolute h-[2.5px] bg-[#1a4d3a] left-8 top-[48%] -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
          style={{ 
            width: activeIndex >= 0 
              ? `calc(50% + ${(activeIndex + 1) * (45 / (vendors.length || 1))}% )` 
              : "0%" 
          }}
        />

        {/* BUYER */}
        <div className="flex flex-col items-center gap-3 w-24 z-10 bg-[#f6faf9] py-2">
          <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
            <User size={28} className="text-gray-600" />
          </div>
          <span className="text-[11px] font-bold text-gray-400">YOU (BUYER)</span>
        </div>

        {/* 중앙 아이콘 */}
        <div className="z-10 bg-[#f6faf9] px-4">
          <div className="w-10 h-10 rounded-full bg-[#1a4d3a] flex items-center justify-center shadow-lg border-4 border-white transform rotate-12">
            <span className="text-white text-xs font-bold">⇌</span>
          </div>
        </div>

        {/* VENDORS 리스트 */}
        <div className="flex gap-10 items-center z-10 bg-[#f6faf9] pl-4 py-2">
          {vendors.map((vendor) => {
            const isActive = activeVendorId === vendor.id;
        return (
            <div key={vendor.id} className="flex flex-col items-center gap-3 w-20 relative">
            <div 
                className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white
                ${isActive 
                    ? "border-[3.5px] border-[#1a4d3a] shadow-[0_10px_20px_rgba(26,77,58,0.2)] scale-110 -translate-y-3 opacity-100" 
                    : "border border-gray-100 opacity-20 scale-95"
                }
                `}
            >
                <Store 
                size={28} 
                className={isActive ? "text-[#1a4d3a] stroke-[2.5px]" : "text-gray-300"} 
                />
                
                {/* 🟢 ACTIVE 뱃지 위치 하향 조정 (-bottom-12) */}
                {isActive && (
                <div className="absolute -bottom-18 bg-[#1a4d3a] text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md z-20">
                    ACTIVE
                </div>
                )}
            </div>

            {/* 🟢 벤더 이름 하이라이트 (isActive일 때 색상 및 두께 강화) */}
            <span className={`
                text-[11px] transition-all duration-500 whitespace-nowrap z-10
                ${isActive 
                ? "text-[#1a4d3a] font-black scale-105" 
                : "text-gray-300 font-medium"
                }
            `}>
                {vendor.label}
            </span>
            </div>
        );
        })}
        </div>
        </div>
      </div>
  );
}
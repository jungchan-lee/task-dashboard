import { Message } from "@/types/negotiation";
import { useMemo } from "react";
import { User, Store } from "lucide-react";

interface Props {
  messages: Message[];
}

export default function NegotiationTimeline({ messages }: Props) {
  // 공백, 언더바 제거하고 대문자로 통일 (비교용 정규화)
  const normalize = (text: string) => text?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

  // 1. 중복 제거된 벤더 목록 추출
  const vendors = useMemo(() => {
    const nameMap = new Map<string, string>();
    
    messages.forEach((m) => {
      if (m.role && m.role.startsWith("VENDOR")) {
        const key = normalize(m.role);
        // 구체적인 ID가 있는 경우만 수집 (예: VENDOR_A)
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

  // 2. 현재 활성화된 참여자들(Sender + Receivers) 식별
  const activeParticipants = useMemo(() => {
    if (messages.length === 0) return { sender: null, receivers: [] as string[] };

    const lastMessage = messages[messages.length - 1];

    // 협상 종료 시 하이라이트 모두 제거
    if (lastMessage.meta?.type === "FINAL_RESULT") {
      return { sender: null, receivers: [] };
    }

    // 최신 메시지부터 역순으로 탐색하여 현재 턴의 주체 확인
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      
      // TURN_UPDATE: 다중 수신자 지원
      if (m.meta?.type === "TURN_UPDATE") {
        return {
          sender: normalize(m.role),
          receivers: (m.meta.receivers || []).map(r => normalize(r))
        };
      }
      
      // DECISION: 제안한 벤더 단독 활성화
      if (m.meta?.type === "DECISION") {
        return { sender: normalize(m.role), receivers: [] };
      }
    }
    
    return { sender: null, receivers: [] };
  }, [messages]);

  // 3. BUYER 활성화 여부 (송신자이거나 수신자 명단에 있을 때)
  const isBuyerActive = useMemo(() => {
    const { sender, receivers } = activeParticipants;
    const buyerKeys = ["BUYER", "USER"];
    const isSender = buyerKeys.includes(sender || "");
    const isReceiver = receivers.some(r => buyerKeys.includes(r));
    return isSender || isReceiver;
  }, [activeParticipants]);

  // 4. 특정 벤더 활성화 여부 확인 함수
  const isVendorActive = (vendorId: string) => {
    const { sender, receivers } = activeParticipants;
    return sender === vendorId || receivers.includes(vendorId);
  };

  // 5. 하이라이트 선(Line)의 길이 계산 (가장 멀리 있는 활성 벤더 기준)
  const activeLineStyle = useMemo(() => {
    if (messages.length === 0 || (!isBuyerActive && activeParticipants.receivers.length === 0 && !activeParticipants.sender)) {
      return { width: "0%" };
    }

    if (isBuyerActive && activeParticipants.receivers.length === 0 && activeParticipants.sender === "BUYER") {
      return { width: "32%" }; // 바이어만 혼자 말할 때
    }

    // 활성화된 벤더들 중 가장 오른쪽에 있는 인덱스 찾기
    const lastActiveVendorIndex = vendors.reduce((maxIdx, v, idx) => {
      return isVendorActive(v.id) ? Math.max(maxIdx, idx) : maxIdx;
    }, -1);

    if (lastActiveVendorIndex >= 0) {
      const progress = 50 + ((lastActiveVendorIndex + 1) * (45 / (vendors.length || 1)));
      return { width: `${progress}%` };
    }

    return { width: isBuyerActive ? "32%" : "0%" };
  }, [vendors, isBuyerActive, activeParticipants]);

  return (
    <div className="h-44 bg-[#f6faf9] flex items-center justify-center px-10 overflow-hidden shrink-0">
      <div className="relative flex items-center justify-between w-full max-w-5xl">
        
        {/* 기본 배경 선 */}
        <div className="absolute h-[1px] bg-gray-200 left-8 right-8 top-[48%] -translate-y-1/2 z-0" />

        {/* 동적 하이라이트 선 */}
        <div 
          className="absolute h-[2.5px] bg-[#1a4d3a] left-8 top-[48%] -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
          style={activeLineStyle}
        />

        {/* BUYER 섹션 */}
        <div className="flex flex-col items-center gap-3 w-24 z-10 bg-[#f6faf9] py-2 relative">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 bg-white
            ${isBuyerActive 
              ? "border-[3.5px] border-[#1a4d3a] shadow-[0_10px_20px_rgba(26,77,58,0.2)] scale-110 -translate-y-3" 
              : "border border-gray-100 opacity-20 scale-95"
            }
          `}>
            <User 
              size={28} 
              className={isBuyerActive ? "text-[#1a4d3a] stroke-[2.5px]" : "text-gray-300"} 
            />
            {isBuyerActive && (
              <div className="absolute -bottom-14 bg-[#1a4d3a] text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md z-20">
                ACTIVE
              </div>
            )}
          </div>
          <span className={`
            text-[11px] transition-all duration-500 whitespace-nowrap z-10
            ${isBuyerActive ? "text-[#1a4d3a] font-black scale-105" : "text-gray-300 font-medium"}
          `}>
            YOU (BUYER)
          </span>
        </div>

        {/* 중앙 교환 아이콘 */}
        <div className="z-10 bg-[#f6faf9] px-4">
          <div className="w-10 h-10 rounded-full bg-[#1a4d3a] flex items-center justify-center shadow-lg border-4 border-white transform rotate-12">
            <span className="text-white text-xs font-bold">⇌</span>
          </div>
        </div>

        {/* VENDORS 리스트 섹션 */}
        <div className="flex gap-10 items-center z-10 bg-[#f6faf9] pl-4 py-2">
          {vendors.map((vendor) => {
            const isActive = isVendorActive(vendor.id);
            return (
              <div key={vendor.id} className="flex flex-col items-center gap-3 w-20 relative">
                <div 
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white
                    ${isActive 
                      ? "border-[3.5px] border-[#1a4d3a] shadow-[0_10px_20px_rgba(26,77,58,0.2)] scale-110 -translate-y-3" 
                      : "border border-gray-100 opacity-20 scale-95"
                    }
                  `}
                >
                  <Store 
                    size={28} 
                    className={isActive ? "text-[#1a4d3a] stroke-[2.5px]" : "text-gray-300"} 
                  />
                  {isActive && (
                    <div className="absolute -bottom-14 bg-[#1a4d3a] text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md z-20">
                      ACTIVE
                    </div>
                  )}
                </div>

                <span className={`
                  text-[11px] transition-all duration-500 whitespace-nowrap z-10
                  ${isActive ? "text-[#1a4d3a] font-black scale-105" : "text-gray-300 font-medium"}
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
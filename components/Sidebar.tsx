import { Message } from "@/types/negotiation";
import { Wallet, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMemo } from "react";

interface SidebarProps {
  messages: Message[];
}

export default function Sidebar({ messages }: SidebarProps) {
  // 1. 가격 포맷 함수
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "0";
    return price.toLocaleString('ko-KR');
  };

  // 🟢 수정: DECISION(협상 중) 또는 FINAL_RESULT(협상 완료) 로그 모두 추출
  const historyLogs = useMemo(() => 
    messages.filter(m => m.meta?.type === "DECISION" || m.meta?.type === "FINAL_RESULT"), 
    [messages]
  );

  // 🟢 Helper: 메시지 타입에 따른 올바른 가격 추출 (price 또는 final_price)
  const getPriceFromLog = (log: Message) => {
    return log.meta?.type === "FINAL_RESULT" 
      ? log.meta?.summary?.final_price || 0 
      : log.meta?.price || 0;
  };

  // 2. 마켓 범위 및 현재 위치 계산
  const { marketLow, marketHigh, positionPercent } = useMemo(() => {
    if (historyLogs.length === 0) {
      return { marketLow: 0, marketHigh: 0, positionPercent: 0 };
    }

    // 🟢 모든 로그에서 적절한 가격 추출
    const allPrices = historyLogs.map(log => getPriceFromLog(log));
    const current = allPrices[allPrices.length - 1];
    
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);

    const range = max - min;
    const percent = range === 0 ? 50 : ((current - min) / range) * 100;

    return { 
      marketLow: min, 
      marketHigh: max, 
      positionPercent: percent 
    };
  }, [historyLogs]);

  // 3. 현재 가격, 트렌드, 차액 계산
  const { currentPrice, trend, diff } = useMemo(() => {
    if (historyLogs.length === 0) return { currentPrice: 0, trend: "none", diff: 0 };

    // 🟢 최신 가격 추출 (협상 완료 시 final_price 반영)
    const current = getPriceFromLog(historyLogs[historyLogs.length - 1]);
    
    if (historyLogs.length < 2) return { currentPrice: current, trend: "none", diff: 0 };

    const previous = getPriceFromLog(historyLogs[historyLogs.length - 2]);
    const difference = Math.abs(current - previous);

    if (current > previous) return { currentPrice: current, trend: "up", diff: difference };
    if (current < previous) return { currentPrice: current, trend: "down", diff: difference };
    return { currentPrice: current, trend: "none", diff: 0 };
  }, [historyLogs]);

  return (
    <div className="h-full bg-gray-100">
      <div className="h-full bg-white rounded-3xl shadow-xl p-8 flex flex-col font-sans">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1a4d3a]">Negotiation Logs</h2>
          <span className="bg-[#f3e8ff] text-[#a855f7] text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
            COLLABORATIVE
          </span>
        </div>

        {/* 상단 정보 카드 */}
        <div className="bg-[#f1f7f5] rounded-2xl p-5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#a3d9cf] p-2.5 rounded-xl">
              <Wallet size={24} className="text-[#1a4d3a]" />
            </div>
            <div>
              <div className="text-[13px] text-gray-500 font-medium">Current Budget</div>
              <div className="text-xl font-bold text-[#1a4d3a]">
                {formatPrice(currentPrice)} <span className="text-xs ml-0.5 font-normal">KRW</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[13px] text-gray-400 font-medium mb-1">Price Change</div>
            <div className={`flex items-center justify-end gap-1.5 text-xl font-bold ${
              trend === "up" ? "text-red-500" : trend === "down" ? "text-blue-500" : "text-gray-400"
            }`}>
              {trend === "up" && <TrendingUp size={20} />}
              {trend === "down" && <TrendingDown size={20} />}
              {trend === "none" && <Minus size={20} className="text-gray-300" />}
              <span>
                {trend !== "none" ? `${trend === "up" ? "+" : "-"}${formatPrice(diff)}` : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* 🔹 동적 마켓 바 영역 */}
        <div className="px-1 mb-4">
          <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-2 tracking-widest">
            <div className="flex flex-col">
              <span>MARKET LOW</span>
              <span className="text-[#1a4d3a] mt-0.5">{formatPrice(marketLow)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span>MARKET HIGH</span>
              <span className="text-[#1a4d3a] mt-0.5">{formatPrice(marketHigh)}</span>
            </div>
          </div>

          <div className="relative h-3 w-full bg-[#e8f5e9] rounded-full overflow-visible">
            <div 
              className="absolute left-0 top-0 h-full bg-[#a3d9cf] rounded-l-full transition-all duration-500 ease-out" 
              style={{ width: `${positionPercent}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-4 border-[#1a4d3a] rounded-full shadow-md z-10 transition-all duration-500 ease-out"
              style={{ left: `${positionPercent}%` }}
            />
          </div>
          
          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              Current Position: {Math.round(positionPercent)}%
            </span>
          </div>
        </div>

        {/* 히스토리 로그 섹션 */}
        <div className="flex-1 flex flex-col min-h-0 px-1">
          <div className="text-[11px] font-bold text-gray-400 mb-4 tracking-widest flex-shrink-0">
            HISTORY LOG
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {historyLogs.filter(log => log.meta?.type !== "FINAL_RESULT").length === 0 ? (
                <div className="text-sm text-gray-300 italic">No activity yet...</div>
              ) : (
                // 1. FINAL_RESULT가 아닌 로그만 필터링한 뒤 
                // 2. 역순으로 정렬하여 렌더링
                historyLogs
                  .filter(log => log.meta?.type !== "FINAL_RESULT")
                  .slice() // 원본 배열 복사
                  .reverse()
                  .map((log, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center gap-4 p-1 rounded-lg transition-colors hover:bg-gray-50/50"
                    >
                      <span className="text-[12px] text-gray-400 font-medium w-12 flex-shrink-0 text-left">
                        {log.meta?.time}
                      </span>

                      <span className="text-[12px] font-bold w-18 flex-shrink-0 text-left truncate text-[#1a4d3a]">
                        {log.role}
                      </span>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-600 font-medium block truncate text-left">
                          {log.content}
                        </span>
                      </div>

                      <span className="font-bold text-[#1a4d3a] flex-shrink-0 min-w-[70px] text-right">
                        {formatPrice(getPriceFromLog(log))}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
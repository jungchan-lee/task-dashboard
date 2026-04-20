import { ReceiptText, X, DollarSign, Store } from "lucide-react";
import { Message } from "@/types/negotiation";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null; // props 변경
}

export default function ReceiptModal({ isOpen, onClose, message }: ReceiptModalProps) {
  if (!isOpen || !message) return null;

  const { content: report, meta } = message;
  const finalPrice = meta?.summary?.final_price || 0;
  console.log(meta?.summary?.final_price);
  const finalVendor = meta?.summary?.final_vendor || "N/A";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a4d3a]/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* 상단 헤더 */}
        <div className="bg-[#1a4d3a] p-6 text-white relative flex-shrink-0">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ReceiptText size={24} />
            </div>
            <h3 className="text-lg font-black tracking-tight">RECEIPT</h3>
          </div>
        </div>

        {/* 영수증 본문 */}
        <div className="px-8 py-6 -mt-4 bg-white rounded-t-[32px] relative flex-1 overflow-hidden flex flex-col">
          
          {/* 🟢 NEW: 최종 가격 및 판매자 하이라이트 섹션 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={14} className="text-[#1a4d3a]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Final Price</span>
              </div>
              <p className="text-[#1a4d3a] font-black text-lg">
                {finalPrice.toLocaleString()}원
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <Store size={14} className="text-[#1a4d3a]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Vendor</span>
              </div>
              <p className="text-[#1a4d3a] font-black text-lg truncate w-full text-center">
                {finalVendor}
              </p>
            </div>
          </div>

          {/* 리포트 본문 스크롤 영역 */}
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[35vh] border-t border-dashed border-gray-100 pt-4">
            {report.split('\n').map((line, idx) => {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine.startsWith('---')) return null;

              const formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#1a4d3a] font-bold">$1</strong>');
              
              return (
                <div key={idx} className="text-[13px] text-gray-600 leading-snug flex gap-2">
                  {(trimmedLine.startsWith('-') || trimmedLine.match(/^\d\./)) && (
                    <span className="text-[#1a4d3a] font-bold"></span>
                  )}
                  <p dangerouslySetInnerHTML={{ __html: formattedLine }} className="flex-1" />
                </div>
              );
            })}
          </div>

          {/* 하단 장식 및 버튼 */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Status</p>
                {/* 🟢 COMPLETED 대신 실제 status 출력 */}
                <p className={`text-lg font-black uppercase ${
                    meta?.status === "SUCCESS" ? "text-blue-600" : 
                    meta?.status === "FAILED" ? "text-red-500" : "text-[#1a4d3a]"
                }`}>
                    {meta?.status || "COMPLETED"}
                </p>
                </div>
                <div className="text-right text-[10px] text-gray-300">
                {/* meta.time이 있다면 그걸 쓰고, 없으면 현재 날짜 출력 */}
                {meta?.time || new Date().toLocaleDateString()}
                </div>
            </div>
            
            <button 
                onClick={onClose}
                className="w-full py-3.5 bg-[#1a4d3a] hover:bg-[#123528] text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
                확인 완료
            </button>
            </div>
        </div>
      </div>
    </div>
  );
}
import { ReceiptText, X } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export default function ReceiptModal({ isOpen, onClose, content }: ReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a4d3a]/40 backdrop-blur-md animate-in fade-in duration-300">
      {/* 세로 크기를 줄이기 위해 max-h 제한 및 flex-col 적용 */}
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[85vh]">
        
        {/* 상단 헤더: 패딩을 줄여 세로 공간 확보 */}
        <div className="bg-[#1a4d3a] p-6 text-white relative flex-shrink-0">
          {/* <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button> */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ReceiptText size={24} />
            </div>
            <h3 className="text-lg font-black tracking-tight">NEGOTIATION RECEIPT</h3>
          </div>
        </div>

        {/* 영수증 본문: -mt-4 정도로 헤더와 살짝 겹치게 하여 컴팩트하게 */}
        <div className="px-8 py-6 -mt-4 bg-white rounded-t-[32px] relative flex-1 overflow-hidden flex flex-col">
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[40vh]">
            {content.split('\n').map((line, idx) => {
              if (!line.trim()) return <div key={idx} className="h-1" />;
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine.startsWith('---')) return null;

              const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#1a4d3a] font-bold">$1</strong>');
              
              return (
                <div key={idx} className="text-[13px] text-gray-600 leading-snug flex gap-2">
                  {line.startsWith('-') || line.match(/^\d\./) ? (
                    <span className="text-[#1a4d3a] font-bold"></span>
                  ) : null}
                  <p dangerouslySetInnerHTML={{ __html: formattedLine }} className="flex-1" />
                </div>
              );
            })}
          </div>

          {/* 하단 장식 및 버튼: 간격 축소 */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <div className="text-left">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Status</p>
                <p className="text-md font-black text-[#1a4d3a]">COMPLETED</p>
              </div>
              <div className="text-right text-[10px] text-gray-300">
                {new Date().toLocaleDateString()}
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
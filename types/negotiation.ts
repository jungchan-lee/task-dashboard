export type Message = {
  role: string;
  content: string;
  loading?: boolean;
  meta?: {
    type?: "INFO" | "DECISION" | "FINAL_RESULT" | "TURN_UPDATE";
    price?: number;
    action?: string;
    time?: string;
    // FINAL_RESULT 전용 데이터
    status?: string;       // "SUCCESS" | "FAILED"
    report?: string;       // 전체 리포트 텍스트
    summary?: {
      title: string;
      final_decision: string;
      turn_reached: number;
      decision_reason: string;
    };
  };
};

export type Group = {
  id: string;
  title: string;
  messages: Message[];
};
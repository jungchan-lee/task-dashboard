// types/wsMessage.ts

export type WSType = "TURN_UPDATE" | "INFO" | "DECISION" | "FINAL_RESULT";

export type TurnUpdateMessage = {
  type: "TURN_UPDATE";
  sender: "BUYER" | "VENDOR";
  content: string;
  turn: number;
};

export type InfoMessage = {
  type: "INFO";
  message: string;
  buyer_intent: {
    objective: string;
    constraints: {
      base_budget: number;
      max_budget: number;
    };
    utility_function: string;
    deadline?: string | null;
  };
};

export type DecisionMessage = {
  type: "DECISION";
  agent: "BUYER" | "VENDOR";
  action: string;
  context: string;
  price: number;
  reason: string;
  decision_time: string;
  vendor_id: string;
};

export type FinalResultMessage = {
  type: "FINAL_RESULT";
  status: string;
  report: string;
  summary: {
    title: string;
    final_price: number;
    final_decision: string;
    final_vendor: string;
    turn_reached: number;
    buyer_constraints:{
        buget: string;
    },
    decision_reason: string;
  },
  decision_time:string;
};


export type WSMessage =
  | TurnUpdateMessage
  | InfoMessage
  | DecisionMessage
  | FinalResultMessage;
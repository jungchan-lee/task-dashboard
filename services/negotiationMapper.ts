import { Group, Message } from "@/types/negotiation";
import { WSMessage } from "@/types/negotiationResponse";

export class NegotiationMapper {
  static createInitialGroup(data: WSMessage): Group {
     let title = "";
    // INFO일 때만 title 생성
    if (data.type === "INFO") {
      title = data.buyer_intent?.objective ?? "";
    }

    return {
      id: crypto.randomUUID(),
      title,
      messages: [],
    };
  }

  static toMessage(data: WSMessage): Message | null {
    switch (data.type) {
      case "TURN_UPDATE":
        return {
          role: data.sender,
          content: data.content,
          meta: {
          type: "TURN_UPDATE" 
        }
        };

      case "DECISION":
        return {
          role: data.vendor_id,
          content: data.context, 
          meta: {
            type: "DECISION",
            price: data.price,
            action: data.action,
            time: data.decision_time // 시간 정보 저장
          },
        };

      case "INFO":
        return {
            role: "SYSTEM",
            content: data.message,
            meta: {
                type: "INFO"
            }
        };
      case "FINAL_RESULT":
        return {
            role: "SYSTEM",
            content: data.report, // 리포트 본문
            meta: {
            type: "FINAL_RESULT",
            status: data.status,
            price: data.summary.final_price, // 0 또는 최종 낙찰가
            time: data.decision_time,        // 요청하신 결정 시간
            report: data.report,
            summary: {
                title: data.summary.title,
                final_decision: data.summary.final_decision, // "REJECT" 또는 "ACCEPT"
                turn_reached: data.summary.turn_reached,
                decision_reason: data.summary.decision_reason,
            },
            },
        };


      default:
        return null;
    }
  }

  static appendMessage(group: Group, message: Message): Group {
    return {
      ...group,
      messages: [...group.messages, message],
    };
  }
}
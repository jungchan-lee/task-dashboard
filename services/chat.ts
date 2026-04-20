// services/chat.ts

const WS_URL = "wss://beverlee-lazulitic-lustfully.ngrok-free.dev/negotiation/ws/negotiate";

let socket: WebSocket | null = null;

type WSMessage = any;

type MessageHandler = (data: WSMessage) => void;

let handler: MessageHandler | null = null;

export function connectSocket(onMessage: MessageHandler) {
  if (socket) return;

  handler = onMessage;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("ws message:", data);

    handler?.(data);
  };

  socket.onerror = (err) => {
    console.error("ws error:", err);
  };

  socket.onclose = () => {
    console.log("WebSocket closed");
    socket = null;
  };
}

export function sendSocketMessage(message: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("socket not connected");
    return;
  }

  socket.send(
    JSON.stringify({
      instruction: message,
    })
  );
}
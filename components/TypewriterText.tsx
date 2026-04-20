// components/TypewriterText.tsx
import { useState, useEffect, useRef } from "react";

export default function TypewriterText({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. 새 텍스트가 들어오면 즉시 이전 타이머 제거 및 텍스트 초기화
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedText("");
    
    let i = 0;
    
    // 2. 타이핑 시작
    timerRef.current = setInterval(() => {
      setDisplayedText((prev) => {
        if (i < text.length) {
          const nextChar = text.charAt(i);
          i++;
          return prev + nextChar;
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
      });
    }, speed);

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]); // text가 바뀌면 이 이펙트가 처음부터 다시 실행됨

  return <span>{displayedText}</span>;
}
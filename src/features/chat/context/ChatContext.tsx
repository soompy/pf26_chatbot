"use client";

/**
 * ChatContext — useChat 결과를 컴포넌트 트리 전체에 공유
 *
 * ChatWindow에서 useChat()을 한 번만 호출하고 Context로 내려준다.
 * MessageList와 ChatInput이 각자 useChat()을 호출하면
 * error 상태가 인스턴스별로 분리되어 재생성 에러가 배너에 표시되지 않는다.
 */

import { createContext, useContext } from "react";
import type { UseChatReturn } from "../hooks/useChat";

const ChatContext = createContext<UseChatReturn | null>(null);

export function ChatProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: UseChatReturn;
}) {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): UseChatReturn {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext는 ChatProvider 하위에서만 사용할 수 있습니다.");
  return ctx;
}

"use client";

/**
 * StoreHydration
 *
 * Zustand persist + skipHydration 패턴에서
 * 클라이언트 마운트 후 localStorage 상태를 store에 주입.
 *
 * layout.tsx 에 한 번만 배치하면 됨.
 */

import { useEffect } from "react";
import { useChatStore } from "../stores/chatStore";

export function StoreHydration() {
  useEffect(() => {
    // rehydrate() 완료 후 activeThreadId가 없으면 스레드를 1개 생성.
    // ChatWindow에서 처리하면 hydration 전/후로 effect가 2번 트리거돼
    // 새로고침마다 빈 스레드가 2개씩 쌓이는 문제가 생긴다.
    const run = async () => {
      await useChatStore.persist.rehydrate();
      const { activeThreadId, threads, createThread } = useChatStore.getState();
      const isValidThread = threads.some((t) => t.id === activeThreadId);
      if (!activeThreadId || !isValidThread) {
        createThread();
      }
    };
    run();
  }, []);

  return null;
}

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
    useChatStore.persist.rehydrate();
  }, []);

  return null;
}

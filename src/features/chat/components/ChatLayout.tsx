"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";

export function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="relative flex h-[100dvh] overflow-hidden bg-bg">
      {/* 모바일 백드롭 — 사이드바 열릴 때 배경 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <ChatWindow onOpenSidebar={() => setIsSidebarOpen(true)} />
    </main>
  );
}

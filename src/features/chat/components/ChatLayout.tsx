"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";

export function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="relative flex h-[100dvh] overflow-hidden bg-bg">
      {/* 모바일 백드롭 — 항상 DOM에 유지하고 opacity로 페이드 제어 */}
      <div
        className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "bg-black/60 opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <ChatWindow onOpenSidebar={() => setIsSidebarOpen(true)} />
    </main>
  );
}

import { Sidebar } from "@/features/chat/components/Sidebar";
import { ChatWindow } from "@/features/chat/components/ChatWindow";

export default function Home() {
  return (
    <main className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <ChatWindow />
    </main>
  );
}

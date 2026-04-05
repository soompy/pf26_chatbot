import { ChatLayout } from "@/features/chat/components/ChatLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <ChatLayout />
    </ErrorBoundary>
  );
}

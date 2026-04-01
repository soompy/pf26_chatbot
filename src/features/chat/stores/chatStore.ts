import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, Thread, ModelId } from "../types/chat.types";

interface ChatStore {
  // 현재 활성 스레드
  activeThreadId: string | null;
  threads: Thread[];

  // 현재 선택된 모델
  selectedModel: ModelId;

  // 스트리밍 메시지 ID (진행 중인 스트림 추적)
  streamingMessageId: string | null;

  // Actions
  createThread: () => string;
  selectThread: (id: string) => void;
  deleteThread: (id: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  updateMessage: (threadId: string, messageId: string, patch: Partial<Message>) => void;
  removeMessage: (threadId: string, messageId: string) => void;
  setStreamingMessageId: (id: string | null) => void;
  setModel: (model: ModelId) => void;

  // 현재 스레드 getter
  getActiveThread: () => Thread | undefined;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      activeThreadId: null,
      threads: [],
      selectedModel: "gpt-4o",
      streamingMessageId: null,

      createThread: () => {
        const id = generateId();
        const now = new Date();
        set((state) => ({
          threads: [
            {
              id,
              title: "New conversation",
              messages: [],
              model: state.selectedModel,
              createdAt: now,
              updatedAt: now,
            },
            ...state.threads,
          ],
          activeThreadId: id,
        }));
        return id;
      },

      selectThread: (id) => set({ activeThreadId: id }),

      deleteThread: (id) =>
        set((state) => {
          const remaining = state.threads.filter((t) => t.id !== id);
          return {
            threads: remaining,
            activeThreadId:
              state.activeThreadId === id
                ? (remaining[0]?.id ?? null)
                : state.activeThreadId,
          };
        }),

      addMessage: (threadId, message) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, message],
                  updatedAt: new Date(),
                  // 첫 사용자 메시지로 제목 자동 생성
                  title:
                    t.messages.length === 0 && message.role === "user"
                      ? message.content.slice(0, 40) || t.title
                      : t.title,
                }
              : t
          ),
        })),

      updateMessage: (threadId, messageId, patch) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, ...patch } : m
                  ),
                  updatedAt: new Date(),
                }
              : t
          ),
        })),

      removeMessage: (threadId, messageId) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.filter((m) => m.id !== messageId),
                  updatedAt: new Date(),
                }
              : t
          ),
        })),

      setStreamingMessageId: (id) => set({ streamingMessageId: id }),

      setModel: (model) => set({ selectedModel: model }),

      getActiveThread: () => {
        const { threads, activeThreadId } = get();
        return threads.find((t) => t.id === activeThreadId);
      },
    }),
    {
      name: "chatbot-ui-store",
      // SSR/클라이언트 상태 불일치 방지:
      // 서버에서는 localStorage를 읽지 않고 초기값 유지,
      // 클라이언트 마운트 후 StoreHydration 컴포넌트가 rehydrate() 호출.
      skipHydration: true,
      partialize: (state) => ({
        threads: state.threads,
        selectedModel: state.selectedModel,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);

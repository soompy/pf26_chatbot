export type Role = "user" | "assistant" | "system";

export type MessageStatus = "streaming" | "done" | "error";

export interface Attachment {
  id: string;
  type: "image" | "file";
  name: string;
  /** base64 data URL (이미지·PDF). 텍스트 파일은 빈 문자열 */
  url: string;
  mimeType: string;
  size: number;
  /** txt/md/json/csv 파일의 디코딩된 텍스트 원문 */
  textContent?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  status: MessageStatus;
  attachments?: Attachment[];
  /** persist 후 rehydration 시 string으로 복원될 수 있음 */
  createdAt: Date | string;
  model?: string;
  tokenCount?: number;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  model: ModelId;
  /** persist 후 rehydration 시 string으로 복원될 수 있음 */
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type ModelId = "gpt-4o" | "gpt-4o-mini" | "claude-opus-4-6" | "claude-sonnet-4-6";

export const MODEL_MAX_TOKENS: Record<ModelId, number> = {
  "gpt-4o": 128000,
  "gpt-4o-mini": 128000,
  "claude-opus-4-6": 200000,
  "claude-sonnet-4-6": 200000,
};

export interface ModelOption {
  id: ModelId;
  name: string;
  provider: "openai" | "anthropic";
  description: string;
  maxTokens: number;
  supportsVision: boolean;
}

export interface ChatRequest {
  messages: Pick<Message, "role" | "content">[];
  model: ModelId;
  stream: true;
  systemPrompt?: string;
  attachments?: Attachment[];
}

// 스트리밍 상태 머신
export type StreamState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "streaming"; partial: string }
  | { status: "done"; content: string }
  | { status: "error"; error: string };

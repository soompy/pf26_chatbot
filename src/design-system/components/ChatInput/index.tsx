/**
 * ChatInput — 재사용 가능한 base 컴포넌트
 *
 * store에 의존하지 않는 순수 UI 컴포넌트.
 * features/chat 에서 이 컴포넌트를 감싸 store와 연결.
 *
 * 기능:
 *   - 멀티라인 textarea 자동 높이 확장 (min 44px ~ max 200px)
 *   - Enter 전송 / Shift+Enter 줄바꿈 / Cmd+Enter 전송 (Mac)
 *   - 파일 첨부 (drag-and-drop + 클릭)
 *   - 전송/중단 버튼 상태 관리
 *   - 글자 수 카운터 (maxLength 초과 시 경고)
 *
 * 접근성:
 *   - role="form" + aria-label
 *   - textarea aria-describedby → 힌트 텍스트 연결
 *   - 파일 input aria-label
 *   - 전송 버튼 aria-label (상태 반영)
 *   - 키보드 완전 지원 (Tab 순서 최적화)
 *   - 드래그 중 aria-dropeffect
 */

"use client";

import {
  useState,
  useRef,
  useCallback,
  useId,
  type KeyboardEvent,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Paperclip, Send, Square, Mic, X, FileText } from "lucide-react";
import { Button } from "@/design-system/components/Button";
import type { Attachment } from "@/features/chat/types/chat.types";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

/* ── Props ─────────────────────────────────────────────── */

export interface ChatInputProps {
  /** 메시지 전송 콜백 */
  onSubmit: (content: string, attachments: Attachment[]) => void;
  /** 스트리밍 중단 콜백 */
  onStop?: () => void;
  /** 스트리밍 진행 중 여부 */
  isStreaming?: boolean;
  /** 입력 비활성화 */
  disabled?: boolean;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 최대 글자 수 (0: 제한 없음) */
  maxLength?: number;
  /** 최대 첨부 파일 수 (기본 5) */
  maxAttachments?: number;
  /** 허용 파일 타입 (input accept 속성) */
  acceptedFileTypes?: string;
  /** 음성 입력 버튼 표시 여부 */
  showVoiceInput?: boolean;
  className?: string;
}

/* ── 파일 첨부 미리보기 ──────────────────────────────── */

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2",
        "bg-surface-overlay border border-line rounded-token px-2.5 py-1.5",
        "text-token-xs text-text-secondary max-w-[180px]",
      )}
      role="listitem"
    >
      {attachment.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-8 w-8 object-cover rounded shrink-0"
        />
      ) : (
        <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-accent" />
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate">{attachment.name}</p>
        <p className="text-text-muted">{(attachment.size / 1024).toFixed(0)}KB</p>
      </div>

      <button
        onClick={() => onRemove(attachment.id)}
        aria-label={`${attachment.name} 제거`}
        className="ml-1 text-text-muted hover:text-error transition-colors shrink-0 focus-visible:text-error"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── ChatInput ─────────────────────────────────────────── */

export function ChatInput({
  onSubmit,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "메시지를 입력하세요... (Shift+Enter 줄바꿈)",
  maxLength = 0,
  maxAttachments = 5,
  acceptedFileTypes = "image/*,.pdf,.txt,.md,.json,.csv",
  showVoiceInput = true,
  className,
}: ChatInputProps) {
  const [value, setValue]           = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging]  = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ARIA 연결용 ID
  const hintId   = useId();
  const formId   = useId();

  /* ── 전송 ── */
  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if ((!trimmed && !attachments.length) || isStreaming || disabled) return;
    onSubmit(trimmed, attachments);
    setValue("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [value, attachments, isStreaming, disabled, onSubmit]);

  /* ── 키보드 ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter (단독) or Cmd/Ctrl+Enter → 전송
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  /* ── textarea 자동 높이 ── */
  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (maxLength > 0 && val.length > maxLength) return;
    setValue(val);
    // 높이 재계산
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [maxLength]);

  /* ── 파일 처리 ── */
  const processFiles = useCallback(
    (files: File[]) => {
      const remaining = maxAttachments - attachments.length;
      const toAdd = files.slice(0, remaining);
      const newAttachments: Attachment[] = toAdd.map((file) => ({
        id:       `${Date.now()}-${file.name}`,
        type:     file.type.startsWith("image/") ? "image" : "file",
        name:     file.name,
        url:      URL.createObjectURL(file),
        mimeType: file.type,
        size:     file.size,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    },
    [attachments.length, maxAttachments],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      processFiles(Array.from(e.target.files ?? []));
      e.target.value = "";
    },
    [processFiles],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  /* ── Drag & Drop ── */
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    // 자식 요소로 이동할 때 오탐 방지
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles],
  );

  /* ── 음성 입력 ── */
  const toggleRecording = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    type SpeechRecCtor = new () => {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };

    const Ctor =
      (window as unknown as Record<string, SpeechRecCtor>)["SpeechRecognition"] ||
      (window as unknown as Record<string, SpeechRecCtor>)["webkitSpeechRecognition"];
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setValue((prev) => prev + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend   = () => setIsRecording(false);

    setIsRecording(true);
    recognition.start();
  }, [isRecording]);

  /* ── 파생 상태 ── */
  const isOverLimit = maxLength > 0 && value.length > maxLength * 0.9;
  const canSubmit   = (value.trim().length > 0 || attachments.length > 0) && !isStreaming && !disabled;
  const atMaxFiles  = attachments.length >= maxAttachments;

  return (
    <div
      className={cn("border-t border-line bg-surface p-4", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-dropeffect={isDragging ? "copy" : "none"}
    >
      {/* 드래그 오버레이 */}
      {isDragging && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center",
            "bg-accent-subtle border-2 border-dashed border-accent rounded-token-lg",
            "text-accent font-medium text-token-sm",
            "animate-[fade-in_0.15s_ease-out]",
          )}
          aria-live="assertive"
          aria-label="파일을 여기에 놓으세요"
        >
          파일을 여기에 놓으세요
        </div>
      )}

      {/* 첨부 파일 목록 */}
      {attachments.length > 0 && (
        <div
          className="flex flex-wrap gap-2 mb-3"
          role="list"
          aria-label="첨부 파일"
        >
          {attachments.map((att) => (
            <AttachmentChip
              key={att.id}
              attachment={att}
              onRemove={removeAttachment}
            />
          ))}
        </div>
      )}

      {/* 입력 폼 */}
      <form
        id={formId}
        role="form"
        aria-label="메시지 입력"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className={cn(
          "flex items-end gap-2 rounded-2xl px-3 py-2",
          "bg-surface-raised border border-line",
          "focus-within:border-accent/50 transition-colors duration-fast",
          isDragging && "border-accent",
        )}
      >
        {/* 파일 첨부 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          disabled={disabled || atMaxFiles}
          aria-label={atMaxFiles ? `최대 ${maxAttachments}개까지 첨부 가능` : "파일 첨부"}
          title={atMaxFiles ? `최대 ${maxAttachments}개` : "파일 첨부 (Drag & Drop 가능)"}
          className="shrink-0 text-text-muted hover:text-text-secondary mb-0.5"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes}
          aria-label="파일 선택"
          className="sr-only"
          onChange={handleFileChange}
          tabIndex={-1}
        />

        {/* textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? "응답 생성 중..." : placeholder}
          disabled={disabled}
          rows={1}
          aria-label="메시지 입력"
          aria-describedby={hintId}
          aria-multiline="true"
          className={cn(
            "flex-1 bg-transparent resize-none",
            "text-token-base text-text-primary placeholder:text-text-muted",
            "focus:outline-none min-h-[36px] max-h-[200px] py-2 leading-relaxed",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />

        {/* 음성 입력 */}
        {showVoiceInput && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label={isRecording ? "음성 입력 중단" : "음성 입력 시작"}
            aria-pressed={isRecording}
            title="음성 입력"
            className={cn(
              "shrink-0 mb-0.5 transition-colors",
              isRecording ? "text-error animate-pulse" : "text-text-muted hover:text-text-secondary",
            )}
            onClick={toggleRecording}
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}

        {/* 전송 / 중단 */}
        {isStreaming ? (
          <Button
            variant="secondary"
            size="icon"
            type="button"
            aria-label="응답 생성 중단"
            title="중단 (Esc)"
            className="shrink-0 mb-0.5"
            onClick={onStop}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="icon"
            type="submit"
            disabled={!canSubmit}
            aria-label="메시지 전송 (Enter)"
            title="전송"
            className="shrink-0 mb-0.5"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </form>

      {/* 힌트 / 글자 수 */}
      <div
        id={hintId}
        className="flex items-center justify-between mt-2 px-1"
      >
        <p className="text-token-xs text-text-muted">
          Enter 전송 · Shift+Enter 줄바꿈
          {!atMaxFiles && " · 파일 드래그 가능"}
        </p>

        {maxLength > 0 && (
          <span
            className={cn(
              "text-token-xs tabular-nums",
              isOverLimit ? "text-warning" : "text-text-muted",
              value.length >= maxLength && "text-error font-medium",
            )}
            aria-live="polite"
            aria-label={`${value.length}자 / ${maxLength}자`}
          >
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

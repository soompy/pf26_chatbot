"use client";

import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from "react";
import { Button } from "@/design-system";
import { useStreamingChat } from "../../hooks/useStreamingChat";
import type { Attachment } from "../../types/chat.types";
import { AttachmentPreview } from "./AttachmentPreview";
import { Paperclip, Send, Square, Mic } from "lucide-react";

export function ChatInput() {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, stopStreaming, isStreaming } = useStreamingChat();

  const handleSubmit = useCallback(() => {
    if ((!input.trim() && !attachments.length) || isStreaming) return;
    sendMessage(input, attachments);
    setInput("");
    setAttachments([]);
    // textarea 높이 리셋
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, attachments, isStreaming, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // textarea 자동 높이 조절
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  // 파일 첨부 처리
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newAttachments: Attachment[] = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      type: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      url: URL.createObjectURL(file),
      mimeType: file.type,
      size: file.size,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // 음성 입력 토글 (Web Speech API)
  const toggleRecording = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("이 브라우저는 음성 입력을 지원하지 않습니다.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    type AnySpeechRecognition = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    type SpeechRecognitionCtor = new () => AnySpeechRecognition;
    const SpeechRecognitionCtor =
      (window as unknown as Record<string, SpeechRecognitionCtor>)["SpeechRecognition"] ||
      (window as unknown as Record<string, SpeechRecognitionCtor>)["webkitSpeechRecognition"];

    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    setIsRecording(true);
    recognition.start();
  }, [isRecording]);

  const canSubmit = (input.trim().length > 0 || attachments.length > 0) && !isStreaming;

  return (
    <div className="border-t border-[var(--color-border)] bg-surface p-4">
      {/* 첨부 파일 미리보기 */}
      {attachments.length > 0 && (
        <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
      )}

      <div className="flex items-end gap-2 bg-surface-raised border border-[var(--color-border)] rounded-2xl px-3 py-2 focus-within:border-accent/50 transition-colors">
        {/* 파일 첨부 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-text-muted hover:text-text-secondary mb-0.5"
          onClick={() => fileInputRef.current?.click()}
          title="파일 첨부"
          type="button"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md,.json,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 텍스트 입력 */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요... (Shift+Enter 줄바꿈)"
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none min-h-[36px] max-h-[200px] py-2 leading-relaxed"
        />

        {/* 음성 입력 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 mb-0.5 transition-colors ${
            isRecording
              ? "text-error animate-pulse"
              : "text-text-muted hover:text-text-secondary"
          }`}
          onClick={toggleRecording}
          title="음성 입력"
          type="button"
        >
          <Mic className="w-4 h-4" />
        </Button>

        {/* 전송 / 중단 버튼 */}
        {isStreaming ? (
          <Button
            variant="secondary"
            size="icon"
            onClick={stopStreaming}
            className="shrink-0 mb-0.5"
            title="생성 중단"
            type="button"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="icon"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="shrink-0 mb-0.5"
            title="전송 (Enter)"
            type="button"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="text-xs text-text-muted text-center mt-2">
        Enter 전송 · Shift+Enter 줄바꿈 · 파일 첨부 지원
      </p>
    </div>
  );
}

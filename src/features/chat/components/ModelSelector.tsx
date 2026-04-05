"use client";

import { useChatStore } from "../stores/chatStore";
import { Badge } from "@/design-system";
import type { ModelId, ModelOption } from "../types/chat.types";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    description: "최고 성능 Anthropic 모델",
    maxTokens: 200000,
    supportsVision: true,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    description: "균형 잡힌 성능과 속도",
    maxTokens: 200000,
    supportsVision: true,
  },
];

export function ModelSelector() {
  const { selectedModel, setModel } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 버튼 위치 기반으로 드롭다운 좌표 계산
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [isOpen]);

  const current = MODEL_OPTIONS.find((m) => m.id === selectedModel)!;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised border border-[var(--color-border)] hover:border-accent/40 text-sm text-text-secondary hover:text-text-primary transition-all"
      >
        <span className="font-medium">{current.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && createPortal(
        <>
          {/* 클릭 외부 감지 오버레이 — body 직속으로 렌더링 */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          {/* 드롭다운 패널 — backdrop-filter stacking context 밖에 위치 */}
          <div
            className="fixed z-[9999] w-64 bg-surface-raised border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden animate-slide-up"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {MODEL_OPTIONS.map((model) => (
              <ModelOption
                key={model.id}
                model={model}
                isSelected={selectedModel === model.id}
                onSelect={(id) => {
                  setModel(id);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function ModelOption({
  model,
  isSelected,
  onSelect,
}: {
  model: ModelOption;
  isSelected: boolean;
  onSelect: (id: ModelId) => void;
}) {
  return (
    <button
      onClick={() => onSelect(model.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-overlay transition-colors ${
        isSelected ? "bg-accent/10" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{model.name}</span>
          <Badge variant="model" size="sm">
            {model.provider === "openai" ? "OpenAI" : "Anthropic"}
          </Badge>
          {model.supportsVision && (
            <Badge variant="accent" size="sm">
              Vision
            </Badge>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5">{model.description}</p>
      </div>
      {isSelected && (
        <span className="text-accent text-xs mt-0.5 shrink-0">✓</span>
      )}
    </button>
  );
}

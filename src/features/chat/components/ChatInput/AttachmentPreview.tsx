"use client";

import { X, FileText } from "lucide-react";
import type { Attachment } from "../../types/chat.types";

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="relative group flex items-center gap-2 bg-surface-overlay border border-[var(--color-border)] rounded-xl p-2 text-xs text-text-secondary max-w-[180px]"
        >
          {att.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={att.url}
              alt={att.name}
              className="h-8 w-8 object-cover rounded-lg shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-accent" />
            </div>
          )}
          <span className="truncate">{att.name}</span>
          <button
            onClick={() => onRemove(att.id)}
            className="ml-auto text-text-muted hover:text-error transition-colors shrink-0"
            aria-label={`${att.name} 제거`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

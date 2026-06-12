"use client";

import { useId, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import ModalShell from "./ModalShell";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ModalShell
      open={open}
      onClose={onCancel}
      role="alertdialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={messageId}
      zIndexClass="z-[110]"
      initialFocusRef={variant === "danger" ? cancelButtonRef : undefined}
    >
      <div className="p-6 flex gap-4">
        {variant === "danger" && (
          <div className="shrink-0 w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
            <AlertTriangle size={20} aria-hidden />
          </div>
        )}
        <div>
          <h2 id={titleId} className="font-headline-sm text-headline-sm text-on-surface font-bold">
            {title}
          </h2>
          <p id={messageId} className="mt-2 text-body-sm text-on-surface-variant leading-relaxed">
            {message}
          </p>
        </div>
      </div>
      <div className="px-6 py-4 bg-surface-container-highest border-t border-outline-variant flex justify-end gap-3">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-high rounded transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 font-bold rounded transition-colors disabled:opacity-50 flex items-center gap-2 ${
            variant === "danger"
              ? "bg-error text-on-error hover:bg-error/90"
              : "bg-primary text-on-primary hover:bg-primary/90"
          }`}
        >
          {isLoading && <Loader2 className="animate-spin" size={16} aria-hidden />}
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

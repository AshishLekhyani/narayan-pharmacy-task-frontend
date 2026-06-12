"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

type InlineNoticeProps = {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
};

export default function InlineNotice({ type, message, onDismiss }: InlineNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`mb-6 rounded-lg border px-4 py-3 text-body-sm ${
        type === "success"
          ? "border-primary bg-primary-container/20 text-on-surface"
          : "border-error bg-error-container/20 text-error"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span>{message}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-on-surface-variant hover:text-on-surface"
            aria-label="Dismiss notice"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

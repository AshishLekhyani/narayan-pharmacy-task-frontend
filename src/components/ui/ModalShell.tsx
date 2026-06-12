"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFocusTrap } from "../../hooks/use-focus-trap";
import { useScrollLock } from "../../hooks/use-scroll-lock";

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  ariaLabelledBy: string;
  ariaDescribedBy?: string;
  role?: "dialog" | "alertdialog";
  zIndexClass?: string;
  panelClassName?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

export default function ModalShell({
  open,
  onClose,
  ariaLabelledBy,
  ariaDescribedBy,
  role = "dialog",
  zIndexClass = "z-[100]",
  panelClassName = "bg-surface border border-outline-variant shadow-2xl rounded-xl w-full max-w-md overflow-hidden",
  initialFocusRef,
  children,
}: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);
  useFocusTrap({
    active: open,
    containerRef: panelRef,
    onEscape: onClose,
    initialFocusRef,
  });

  return (
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 ${zIndexClass} flex items-center justify-center bg-black/50 backdrop-blur-sm px-4`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role={role}
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className={panelClassName}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type PortalDropdownOption<T extends string> = {
  value: T;
  label: string;
};

type PortalDropdownProps<T extends string> = {
  value: T;
  options: PortalDropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  menuWidth?: number;
  align?: "left" | "right";
};

export default function PortalDropdown<T extends string>({
  value,
  options,
  onChange,
  className = "",
  menuWidth,
  align = "left",
}: PortalDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });

  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportPadding = 16;
    const menuGap = 4;
    const preferredHeight = Math.min(280, options.length * 48 + 8);
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - menuGap;
    const spaceAbove = rect.top - viewportPadding - menuGap;
    const shouldOpenAbove = spaceBelow < preferredHeight && spaceAbove > spaceBelow;
    const availableHeight = Math.max(120, shouldOpenAbove ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(preferredHeight, availableHeight);
    const width = menuWidth ?? rect.width;

    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.min(Math.max(left, viewportPadding), window.innerWidth - width - viewportPadding);

    setDropdownStyle({
      top: shouldOpenAbove ? rect.top - menuGap - maxHeight : rect.bottom + menuGap,
      left,
      width,
      maxHeight,
    });
  }, [align, menuWidth, options.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    if (isOpen) {
      updateDropdownPosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  const dropdownPortal: ReactNode =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                data-lenis-prevent
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  top: `${dropdownStyle.top}px`,
                  left: `${dropdownStyle.left}px`,
                  width: `${dropdownStyle.width}px`,
                  maxHeight: `${dropdownStyle.maxHeight}px`,
                  zIndex: 99999,
                }}
                className="bg-surface border border-outline-variant rounded-xl shadow-xl overflow-y-auto py-1"
              >
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-surface-container text-body-sm transition-colors ${
                      value === option.value
                        ? "bg-primary-container/30 text-primary font-bold"
                        : "text-on-surface"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) updateDropdownPosition();
          setIsOpen((open) => !open);
        }}
        className="w-full min-w-[180px] bg-surface border border-outline-variant text-left text-on-surface px-4 py-2 rounded-lg text-body-sm flex justify-between items-center gap-2 hover:bg-surface-container-low transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={18}
          className={`text-on-surface-variant shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {dropdownPortal}
    </div>
  );
}

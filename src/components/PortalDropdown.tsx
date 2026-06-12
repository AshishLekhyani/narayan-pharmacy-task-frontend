"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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
  triggerClassName?: string;
  menuClassName?: string;
  menuWidth?: number;
  align?: "left" | "right";
  ariaLabel?: string;
};

export default function PortalDropdown<T extends string>({
  value,
  options,
  onChange,
  className = "",
  triggerClassName,
  menuClassName = "bg-surface border border-outline-variant rounded-xl shadow-xl overflow-y-auto py-1",
  menuWidth,
  align = "left",
  ariaLabel = "Select option",
}: PortalDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });
  const listboxId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
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

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const selectOption = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.value);
      closeMenu();
    },
    [closeMenu, onChange, options]
  );

  const openMenu = useCallback(() => {
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    updateDropdownPosition();
    setIsOpen(true);
  }, [selectedIndex, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    if (isOpen) {
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

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) openMenu();
      return;
    }
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu();
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % options.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + options.length) % options.length);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setHighlightIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setHighlightIndex(options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(highlightIndex);
    }
  };

  const dropdownPortal: ReactNode =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                id={listboxId}
                role="listbox"
                tabIndex={-1}
                data-lenis-prevent
                onKeyDown={handleMenuKeyDown}
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
                className={menuClassName}
              >
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    id={`${listboxId}-option-${index}`}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectOption(index)}
                    className={`w-full text-left px-4 py-3 hover:bg-surface-container text-body-sm transition-colors ${
                      value === option.value || highlightIndex === index
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
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={
          triggerClassName ??
          "w-full min-w-[180px] bg-surface border border-outline-variant text-left text-on-surface px-4 py-2 rounded-lg text-body-sm flex justify-between items-center gap-2 hover:bg-surface-container-low transition-colors"
        }
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`text-on-surface-variant shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {dropdownPortal}
    </div>
  );
}

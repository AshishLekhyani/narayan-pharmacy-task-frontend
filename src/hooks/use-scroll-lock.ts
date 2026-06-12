import { useEffect } from "react";

/** Locks document scroll while `locked` is true (e.g. modal open). */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, [locked]);
}

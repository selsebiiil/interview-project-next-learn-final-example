import { useEffect } from "react";

export function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };
    document.addEventListener("mouseup", listener);
    document.addEventListener("touchend", listener);
    return () => {
      document.removeEventListener("mouseup", listener);
      document.removeEventListener("touchend", listener);
    };
  }, [ref, handler]);
}

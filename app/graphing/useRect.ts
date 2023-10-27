import { useLayoutEffect, useState } from "react";

export const useRect = (el: React.RefObject<HTMLElement | SVGElement>) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setRect(entries[0].contentRect);
    });
    observer.observe(el.current!);
    return () => observer.disconnect();
  }, [el]);
  return rect;
};

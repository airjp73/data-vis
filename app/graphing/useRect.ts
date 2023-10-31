import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const useRect = (el: React.RefObject<HTMLElement | SVGElement>) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useIsomorphicEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setRect(entries[0].contentRect);
    });
    observer.observe(el.current!);
    return () => observer.disconnect();
  }, [el]);
  return rect;
};

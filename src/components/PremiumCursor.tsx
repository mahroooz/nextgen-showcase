import { useEffect, useRef, useState } from "react";

/**
 * PremiumCursor — a smooth, premium cursor that follows the mouse on desktop
 * and the touch point on mobile/tablet. Uses a soft glowing dot + a trailing
 * ring with spring-like lerp for a luxe feel.
 */
export function PremiumCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const dot = useRef({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let raf = 0;

    const setTarget = (x: number, y: number) => {
      target.current.x = x;
      target.current.y = y;
      if (!visible) setVisible(true);
    };

    const onMouseMove = (e: MouseEvent) => setTarget(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0] ?? e.changedTouches[0];
      if (t) setTarget(t.clientX, t.clientY);
    };
    const onDown = () => setActive(true);
    const onUp = () => setActive(false);
    const onLeave = () => setVisible(false);

    const isInteractive = (el: Element | null): boolean => {
      let n: Element | null = el;
      while (n) {
        const tag = n.tagName;
        if (
          tag === "A" ||
          tag === "BUTTON" ||
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          tag === "LABEL" ||
          n.getAttribute("role") === "button" ||
          (n as HTMLElement).isContentEditable
        ) return true;
        n = n.parentElement;
      }
      return false;
    };
    const onOver = (e: MouseEvent) => setHovering(isInteractive(e.target as Element));

    const tick = () => {
      // Dot follows quickly; ring trails smoothly
      dot.current.x += (target.current.x - dot.current.x) * 0.45;
      dot.current.y += (target.current.y - dot.current.y) * 0.45;
      ring.current.x += (target.current.x - ring.current.x) * 0.18;
      ring.current.y += (target.current.y - ring.current.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchend", onUp, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchend", onUp);
    };
  }, [visible]);

  const baseRing = "fixed left-0 top-0 z-[9999] pointer-events-none rounded-full will-change-transform";
  const ringSize = hovering ? "h-12 w-12" : "h-9 w-9";
  const ringScale = active ? "scale-75" : "scale-100";

  return (
    <>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          html, body, * { cursor: none !important; }
        }
      `}</style>
      <div
        ref={ringRef}
        className={`${baseRing} ${ringSize} ${ringScale} transition-[width,height,transform,background-color,border-color] duration-200 ease-out border border-primary/70 bg-primary/5 backdrop-blur-[1px]`}
        style={{
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 24px hsl(var(--primary) / 0.25), inset 0 0 12px hsl(var(--primary) / 0.15)",
          mixBlendMode: "difference",
        }}
        aria-hidden
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 z-[9999] pointer-events-none h-1.5 w-1.5 rounded-full will-change-transform"
        style={{
          opacity: visible ? 1 : 0,
          background: "hsl(var(--primary))",
          boxShadow: "0 0 12px hsl(var(--primary) / 0.9), 0 0 24px hsl(var(--primary) / 0.5)",
        }}
        aria-hidden
      />
    </>
  );
}

export default PremiumCursor;

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Revela o conteudo quando ele entra na viewport. USO SOMENTE NO PAINEL —
 * nunca em telas do colaborador (formulario com scroll-reveal e bug de UX).
 * Fallbacks: sem IntersectionObserver, ou com prefers-reduced-motion,
 * o conteudo ja aparece visivel (o CSS de .reveal cuida do reduced-motion).
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const Tag = as ?? "div";
  const ref = useRef<HTMLElement | null>(null);
  const [visivel, setVisivel] = useState(
    typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (visivel || typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisivel(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visivel]);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", visivel && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

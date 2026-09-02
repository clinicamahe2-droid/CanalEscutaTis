import tisLogo from "@/assets/tis-logo.jpg";
import { cn } from "@/lib/utils";

/**
 * Marca do cliente (TIS — Terminal Intermodal Sul), uso discreto.
 * O arquivo e um JPEG com fundo branco: renderiza dentro de um "chip" branco
 * para o retangulo nao destoar do fundo off-white do app. O `scale` corta um
 * pouco da margem branca da propria arte.
 */
export function LogoTIS({
  className,
  height = 24,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-border/60",
        className,
      )}
      style={{ height, padding: 2 }}
    >
      <img
        src={tisLogo}
        alt="TIS — Terminal Intermodal Sul"
        width={height * 1.07}
        height={height}
        loading="lazy"
        decoding="async"
        className="h-full w-auto scale-[1.18]"
      />
    </span>
  );
}

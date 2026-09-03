import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      screens: {
        // Breakpoint proprio do hero da Home (canalescutahomev3.html usa
        // 920px, nao bate com nenhum breakpoint padrao do Tailwind).
        "mahe-2col": "921px",
      },
      fontFamily: {
        // Sistema "documento, nao spa", pele Matcha — ver DECISOES.md (2026-09-03).
        display: ['"Instrument Serif"', "Georgia", "serif"],
        body: ['"Hanken Grotesk"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        // So para o hero da Home (ver DECISOES.md, 2026-09-03 — hero "Mahe").
        "mahe-display": ['"Fraunces"', "Georgia", "serif"],
        "mahe-body": ['"Source Sans 3"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "mahe-mono": ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // --- tokens do sistema novo (fonte da verdade: designsystemescuta.html) ---
        ink: {
          DEFAULT: "hsl(var(--ink))",
          2: "hsl(var(--ink-2))",
        },
        record: "hsl(var(--record))",
        paper: {
          DEFAULT: "hsl(var(--paper))",
          raised: "hsl(var(--paper-raised))",
          2: "hsl(var(--paper-2))",
        },
        seal: {
          DEFAULT: "hsl(var(--seal))",
          foreground: "hsl(var(--seal-foreground))",
          tint: "var(--seal-tint)",
          line: "var(--seal-line)",
        },
        signal: {
          DEFAULT: "hsl(var(--signal))",
          tint: "var(--signal-tint)",
        },
        stamp: {
          DEFAULT: "hsl(var(--stamp))",
          tint: "var(--stamp-tint)",
        },
        line: "var(--line)",
        "line-2": "var(--line-2)",

        // --- aliases semanticos (compat shadcn / painel, fora de escopo deste redesign) ---
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          soft: "hsl(var(--primary-soft))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface2: "hsl(var(--surface-2))",
        // Fora de escopo (Bloco 0-a): usados so pelo painel (severidade/status),
        // valores antigos, sem equivalente no sistema novo — ver DECISOES.md.
        warning: {
          DEFAULT: "hsl(var(--warning))",
          soft: "hsl(var(--warning-soft))",
        },
        critical: {
          DEFAULT: "hsl(var(--critical))",
          soft: "hsl(var(--critical-soft))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          soft: "hsl(var(--success-soft))",
        },
        // Paleta so do hero da Home (ver DECISOES.md, 2026-09-03 — hero "Mahe").
        // Nao reaproveita ink/paper/seal/stamp: e outra referencia visual
        // (canalescutahomev3.html), usada num unico componente.
        mahe: {
          cream: "#F6F1E4",
          "cream-2": "#EEE5CD",
          "border-warm": "#E1D6B8",
          ink: "#212F1B",
          "ink-soft": "#535E48",
          muted: "#8B9278",
          "green-900": "#141D0E",
          "green-800": "#1F2C16",
          "green-700": "#2C3E20",
          gold: "#D89A4C",
          "gold-dark": "#B87F36",
          "gold-soft": "#F1E1BF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Entrada padrao das telas: suave, curta, sem blur (texto pequeno + Android medio).
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // So para o hero da Home (ver DECISOES.md, 2026-09-03 — hero "Mahe").
        "mahe-fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "mahe-glow-breathe": {
          "0%, 100%": { opacity: "0.28" },
          "50%": { opacity: "0.5" },
        },
        "mahe-ring-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "70%": { transform: "scale(1.25)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        "mahe-dot-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.75)" },
        },
        "mahe-orb-breathe": {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "reveal-in": "reveal-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "mahe-fade-up": "mahe-fade-up 0.6s ease-out forwards",
        "mahe-glow-breathe": "mahe-glow-breathe 3.4s ease-in-out infinite",
        "mahe-ring-pulse": "mahe-ring-pulse 2.8s ease-in-out infinite",
        "mahe-dot-pulse": "mahe-dot-pulse 1.6s ease-in-out infinite",
        "mahe-orb-breathe": "mahe-orb-breathe 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

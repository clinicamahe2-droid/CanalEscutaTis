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
      fontFamily: {
        // Sistema "acolhedor", pele Fable — ver DECISOES.md (2026-09-08).
        display: ['"Fraunces"', '"Palatino Linotype"', '"Book Antiqua"', "Georgia", "serif"],
        body: ['"Figtree"', '"Segoe UI"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Cascadia Mono"', "Consolas", "monospace"],
      },
      colors: {
        // --- paleta "acolhedora" crua (ver index.css) — usada pelas classes
        // de componente novas e em utilitarios pontuais (ex.: text-broto). ---
        oliva: "var(--oliva)",
        creme: "var(--creme)",
        bege: {
          DEFAULT: "var(--bege)",
          hover: "var(--bege-hover)",
        },
        papel: "var(--papel)",
        texto: "var(--texto)",
        salvia: {
          DEFAULT: "var(--salvia)",
          2: "var(--salvia-2)",
        },
        broto: "var(--broto)",
        ouro: "var(--ouro)",
        risco: {
          DEFAULT: "var(--risco)",
          tint: "var(--risco-tint)",
          line: "var(--risco-line)",
        },
        linha: "var(--linha)",
        "linha-2": "var(--linha-2)",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // So o fluxo do colaborador usa `xl` — raio mais generoso da pele
        // "acolhedora" (cards/opcoes/campos). Nao mexe em lg/md/sm (Card,
        // Popover etc. do painel da equipe continuam com --radius).
        xl: "16px",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "reveal-in": "reveal-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

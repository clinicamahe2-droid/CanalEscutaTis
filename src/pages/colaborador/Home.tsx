import { Link, useNavigate } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { LogoMahe } from "@/components/LogoMahe";
import { useConfigPublica } from "@/hooks/dados";

/**
 * Hero de duas colunas — ver DECISOES.md (2026-09-03), fonte:
 * canalescutahomev3.html. Único componente do app com a paleta/tipografia
 * `mahe-*` (cream/verde-escuro/dourado, Fraunces/Source Sans 3/IBM Plex
 * Mono) — não usa os tokens `ink/paper/seal` do resto do fluxo de propósito,
 * é outra referência visual (ver comentário em tailwind.config.ts).
 */

const PASSOS = [
  { n: "01", titulo: "Relato", desc: "Você conta o que houver" },
  { n: "02", titulo: "Código", desc: "Recebe um código de acompanhamento" },
  { n: "03", titulo: "Retorno", desc: "Equipe analisa e responde" },
];

export default function Home() {
  const nav = useNavigate();
  const { data: config } = useConfigPublica();
  const nomeCanal = config?.nome_canal ?? "Canal de Escuta";

  return (
    <div className="grid min-h-[100dvh] grid-cols-1 mahe-2col:grid-cols-[1.15fr_0.85fr]">
      {/* painel esquerdo — conteudo */}
      <div className="relative flex flex-col overflow-hidden bg-mahe-cream px-6 pb-12 pt-7 font-mahe-body text-mahe-ink safe-t sm:px-9 lg:px-14 xl:px-[4.5rem]">
        {/* fundo liso nao da nada pro backdrop-blur dos botoes desfocar — este
            glow existe so pra isso (ver comentario em index.css). */}
        <div className="mahe-glow-warm pointer-events-none absolute left-[-8%] top-[18%] z-0 h-[420px] w-[420px] animate-mahe-orb-breathe rounded-full" />

        <div className="relative z-[1] mb-auto flex items-center justify-between border-b border-mahe-border-warm pb-5 font-mahe-mono text-[0.72rem] tracking-wide text-mahe-ink-soft">
          <span className="uppercase">TIS · Terminal Intermodal Sul</span>
          <span className="mahe-seal-pill inline-flex items-center gap-1.5 rounded-full px-[11px] py-[5px] uppercase text-mahe-ink backdrop-blur-[8px]">
            <Lock className="h-[11px] w-[11px]" strokeWidth={2} />
            Sigilo garantido
          </span>
        </div>

        <div className="relative z-[1] my-11 max-w-[520px] animate-mahe-fade-up opacity-0">
          <div className="mahe-icon-ring relative mb-[18px] flex h-14 w-14 items-center justify-center rounded-full bg-mahe-gold-soft">
            <Check className="h-6 w-6 text-mahe-gold-dark" strokeWidth={2} />
          </div>
          <span className="mb-2.5 block font-mahe-mono text-[0.72rem] uppercase tracking-wide text-mahe-gold-dark">
            Um espaço para você ser ouvido
          </span>
          <h1 className="mb-[18px] font-mahe-display text-[clamp(2.4rem,5vw,3.3rem)] font-bold leading-[1.04] text-mahe-ink">
            {nomeCanal}
          </h1>
          <p className="mb-[30px] max-w-[46ch] text-[1.08rem] leading-[1.55] text-mahe-ink-soft">
            {config?.mensagem_boas_vindas ??
              "Aqui você pode contar o que está vivendo, do seu jeito e no seu tempo. Não pedimos seu nome nem guardamos nada que possa te identificar — só queremos ouvir, com cuidado."}
          </p>

          <div className="mb-9 flex flex-wrap gap-3.5">
            <button
              onClick={() => nav("/relatar/categoria")}
              className="mahe-btn-primary relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/45 px-[26px] py-[15px] text-[0.98rem] font-bold text-[#2B1B06] backdrop-blur-[14px] backdrop-saturate-[1.6] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Quero contar o que aconteceu →
            </button>
            <button
              onClick={() => nav("/consulta")}
              className="mahe-btn-secondary relative inline-flex items-center rounded-xl border border-white/65 px-6 py-[15px] text-[0.96rem] font-semibold text-mahe-ink backdrop-blur-[10px] backdrop-saturate-[1.4] transition-all duration-200 hover:-translate-y-0.5"
            >
              Já contei — quero saber como está
            </button>
          </div>
        </div>

        <div className="relative z-[1] mb-8 flex gap-0">
          <div className="absolute left-[26px] right-[26px] top-[15px] h-px bg-mahe-border-warm" />
          {PASSOS.map((p) => (
            <div key={p.n} className="relative z-[1] flex-1 px-1.5 text-center">
              <div className="mahe-step-dot mx-auto mb-2 flex h-[30px] w-[30px] items-center justify-center rounded-full font-mahe-mono text-[0.72rem] font-bold text-mahe-gold-dark backdrop-blur-[6px]">
                {p.n}
              </div>
              <h5 className="mb-[3px] text-[0.78rem] font-semibold uppercase tracking-wide text-mahe-ink">
                {p.titulo}
              </h5>
              <p className="text-[0.76rem] text-mahe-muted">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative z-[1] mt-auto safe-b border-t border-mahe-border-warm pt-5 text-center">
          <Link
            to="/equipe/entrar"
            className="font-mahe-mono text-[0.72rem] uppercase tracking-wide text-mahe-muted transition-colors hover:text-mahe-ink"
          >
            Acesso da equipe de escuta →
          </Link>
        </div>
      </div>

      {/* painel direito — marca */}
      <div className="mahe-panel-brand relative flex min-h-[320px] items-center justify-center overflow-hidden px-8 py-12">
        <div className="mahe-glow-orb absolute right-[-10%] top-[12%] h-[420px] w-[420px] animate-mahe-orb-breathe rounded-full" />
        <div className="mahe-glow-orb two absolute bottom-[-6%] left-[-8%] h-[340px] w-[340px] animate-mahe-orb-breathe rounded-full" />
        <div className="relative z-[2] animate-mahe-fade-up text-center text-[#EFE9D6] opacity-0 [animation-delay:150ms]">
          <div className="mahe-status-pill mb-7 inline-flex items-center gap-[7px] rounded-full px-[14px] py-[6px] font-mahe-mono text-[0.68rem] uppercase tracking-wide text-mahe-gold backdrop-blur-[10px] backdrop-saturate-[1.6]">
            <span className="mahe-dot-pulse h-1.5 w-1.5 rounded-full bg-mahe-gold" />
            Canal ativo · sigilo garantido
          </div>
          <div className="mahe-brand-tile relative mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[22px] backdrop-blur-[12px] backdrop-saturate-[1.6]">
            <LogoMahe size={42} />
          </div>
          <h2 className="mb-1.5 font-mahe-display text-[1.9rem] font-bold text-[#F7F2E2]">{nomeCanal}</h2>
          <div className="mb-9 font-mahe-mono text-[0.68rem] uppercase tracking-wide text-[#A9B39A]">
            Psicologia organizacional
          </div>
          <div className="mx-auto max-w-[280px] border-t border-white/10 pt-4 text-[0.8rem] text-[#A9B39A]">
            Conduzido por <b className="font-semibold text-[#EFE9D6]">Clínica Mahê</b>
            <br />
            Márcia Helena Bússolo — CRP 02959
          </div>
        </div>
      </div>
    </div>
  );
}

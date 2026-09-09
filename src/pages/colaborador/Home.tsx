import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Phone } from "lucide-react";
import { Broto } from "@/components/Broto";
import { useConfigPublica } from "@/hooks/dados";

/**
 * Home — sistema "acolhedor", pele Fable (ver DECISOES.md, 2026-09-08;
 * fonte: redesign-proposta-fable.html). Substitui o hero de duas colunas
 * "Mahe": uma coluna so, sem icone em circulo, titulo a esquerda. Mesmo
 * sistema do resto do fluxo do colaborador, nao mais uma referencia visual
 * separada.
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
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto w-full max-w-md px-5 pb-10 safe-t">
        <div className="flex items-center justify-between gap-2.5 py-1.5 pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Broto size={22} className="shrink-0 text-oliva" />
            {nomeCanal}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-salvia">
            <Lock className="h-[13px] w-[13px]" strokeWidth={2} />
            Sigilo garantido
          </div>
        </div>

        <div className="hero-video">
          <video
            className="hero-bg-video"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          >
            <source src="/video/home-hero.mp4" type="video/mp4" />
          </video>
          <div className="hero-veu" />
          <div className="hero-conteudo">
            <div className="mb-2.5 text-xs font-medium text-salvia">TIS · Terminal Intermodal Sul</div>
            <h1 className="text-[2.1rem] font-display font-medium leading-[1.08] text-ink mb-3.5">
              Um espaço para você ser ouvido.
            </h1>
            <p className="max-w-[32ch] text-[0.97rem] leading-[1.55] text-texto">
              Aqui você pode contar o que está vivendo, do seu jeito e no seu tempo.{" "}
              <span className="marca">Não pedimos seu nome</span> nem guardamos nada que possa te
              identificar, só queremos ouvir, com cuidado.
            </p>

            <div className="flex flex-col gap-2.5 my-5">
              <button
                onClick={() => nav("/relatar/categoria")}
                className="btn-oliva flex w-full items-center justify-between gap-3 rounded-[16px] py-[15px] pl-5 pr-[18px] text-left"
              >
                <span>
                  <span className="block text-base font-semibold leading-tight">
                    Quero contar o que aconteceu
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] font-normal text-[#C9CFB8]">
                    Sem nome, sem login. Só o que você quiser contar.
                  </span>
                </span>
                <ArrowRight className="h-[18px] w-[18px] shrink-0" />
              </button>
              <button
                onClick={() => nav("/consulta")}
                className="btn-bege flex w-full items-center justify-between gap-3 rounded-[16px] py-[15px] pl-5 pr-[18px] text-left text-[0.95rem] font-semibold"
              >
                Já contei, quero saber como está
                <ArrowRight className="h-[18px] w-[18px] shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <div className="passos">
          {PASSOS.map((p) => (
            <div key={p.n} className="text-[0.78rem] leading-tight text-salvia">
              <em>{p.n}</em>
              <b className="block text-[0.81rem] font-semibold text-ink mb-0.5">{p.titulo}</b>
              {p.desc}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-4 text-[0.81rem] text-salvia">
          <Phone className="h-3.5 w-3.5 text-salvia-2 shrink-0" />
          <span>
            Precisa falar com alguém agora?{" "}
            <Link to="/apoio" className="font-semibold text-ink underline underline-offset-[3px] decoration-line-2">
              Ver contatos de apoio
            </Link>
          </span>
        </div>

        <div className="rodape-home flex items-end justify-between gap-3 text-xs leading-[1.5] text-salvia">
          <div>
            Conduzido por <b className="font-semibold text-ink">Clínica Mahê</b>
            <br />
            Márcia Helena Bússolo · CRP 02959
          </div>
          <Link to="/equipe/entrar" className="whitespace-nowrap text-salvia">
            Acesso da equipe →
          </Link>
        </div>
      </div>
    </div>
  );
}

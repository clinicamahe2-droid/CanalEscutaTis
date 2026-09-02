import { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { Selo } from "@/components/Selo";
import { LogoTIS } from "@/components/LogoTIS";
import { useConfigPublica } from "@/hooks/dados";

const CLAUSULAS = [
  {
    num: "01",
    titulo: "Anonimato garantido",
    desc: "Nome, IP e aparelho nunca são registrados.",
  },
  {
    num: "02",
    titulo: "Sem retaliação",
    desc: "Sua identidade não é exigida em nenhuma etapa.",
  },
  {
    num: "03",
    titulo: "Equipe dedicada",
    desc: "Cada relato é lido por alguém responsável por isso.",
  },
];

const PASSOS = [
  { codigo: "01 · RELATO", desc: "Você conta o que houver" },
  { codigo: "02 · CÓDIGO", desc: "Recebe um código de acompanhamento" },
  { codigo: "03 · RETORNO", desc: "Equipe analisa e responde" },
];

export default function Home() {
  const nav = useNavigate();
  const { data: config } = useConfigPublica();

  return (
    <Tela className="justify-center">
      {/* timbre — nome de quem emite o canal + o compromisso, lado a lado */}
      <div className="-mx-5 px-5 py-2.5 border-b border-line flex items-center justify-between">
        <span className="font-mono text-[0.65rem] tracking-wide text-record uppercase">
          TIS · Terminal Intermodal Sul
        </span>
        <span className="font-mono text-[0.65rem] tracking-wide text-seal uppercase">
          Sigilo garantido
        </span>
      </div>

      <div className="pt-7 pb-2 flex flex-col items-center text-center">
        <Selo size={52} className="mb-4" />
        <span className="font-mono text-[0.68rem] tracking-wide text-record uppercase">
          Canal confidencial
        </span>
        <h1 className="text-3xl font-display font-medium text-ink mt-1.5">
          {config?.nome_canal ?? "Canal de Escuta"}
        </h1>
        <p className="text-sm text-ink-2 mt-2.5 max-w-[26ch]">
          {config?.mensagem_boas_vindas ??
            "Você pode relatar sem se identificar. Não registramos seu nome, seu IP ou o aparelho que você está usando — só o que você quiser contar."}
        </p>
      </div>

      <div className="mt-7 space-y-2.5">
        <Button className="w-full" onClick={() => nav("/relatar/categoria")}>
          Fazer um relato
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => nav("/consulta")}>
          Já enviei — consultar status
        </Button>
      </div>

      <div className="mt-7 border-t border-b border-line divide-y divide-line">
        {CLAUSULAS.map((c) => (
          <div key={c.num} className="flex gap-3 py-2.5">
            <span className="font-mono text-[0.62rem] text-seal shrink-0 pt-0.5">{c.num}</span>
            <div>
              <b className="block text-[0.8rem] font-semibold text-ink">{c.titulo}</b>
              <span className="text-[0.72rem] text-ink-2">{c.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-1.5">
          {PASSOS.map((p, i) => (
            <Fragment key={p.codigo}>
              <span className="font-mono text-[0.6rem] text-seal whitespace-nowrap">{p.codigo}</span>
              {i < PASSOS.length - 1 && <span className="flex-1 h-px bg-line-2" />}
            </Fragment>
          ))}
        </div>
        <div className="flex mt-1.5">
          {PASSOS.map((p) => (
            <p key={p.codigo} className="flex-1 text-[0.64rem] text-record text-center leading-tight px-1 first:pl-0 last:pr-0 first:text-left last:text-right">
              {p.desc}
            </p>
          ))}
        </div>
      </div>

      <Link
        to="/apoio"
        className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold text-signal"
      >
        <AlertCircle className="w-3 h-3" />
        Está em risco agora? Ver contatos de apoio imediato
      </Link>

      <div className="mt-auto pt-8 flex flex-col items-center gap-3 text-center">
        <Link
          to="/equipe/entrar"
          className="font-mono text-[0.62rem] tracking-wide text-record uppercase hover:text-ink"
        >
          Acesso da equipe de escuta
        </Link>
        <div className="flex items-center gap-2 text-[0.65rem] text-ink-2">
          <LogoTIS height={20} />
          <span>Canal disponibilizado pela TIS — Terminal Intermodal Sul</span>
        </div>
      </div>
    </Tela>
  );
}

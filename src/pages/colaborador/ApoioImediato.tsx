import { useNavigate } from "react-router-dom";
import { Tela } from "@/components/colaborador/Tela";

const CONTATOS = [
  {
    nome: "CVV · Centro de Valorização da Vida",
    numero: "188",
    desc: "Apoio emocional, 24h, gratuito e sigiloso",
  },
  {
    nome: "Disque Direitos Humanos",
    numero: "100",
    desc: "Violência, assédio e discriminação",
  },
  { nome: "SAMU", numero: "192", desc: "Emergência médica" },
];

export default function ApoioImediato() {
  const nav = useNavigate();
  return (
    <Tela titulo="Apoio imediato" onVoltar={() => nav(-1)}>
      <p className="text-sm text-ink-2 mb-5">
        Se você corre risco agora, ligue direto. Não é preciso esperar o retorno pelo canal.
      </p>
      <div className="stagger space-y-3">
        {CONTATOS.map((c) => (
          <a
            key={c.numero}
            href={`tel:${c.numero}`}
            className="block rounded-xl border border-line-2 bg-card p-4 transition-colors duration-200 hover:border-seal-line"
          >
            <div className="font-semibold text-sm text-ink">{c.nome}</div>
            <div className="font-mono text-xl text-ink mt-0.5">{c.numero}</div>
            <div className="text-[0.72rem] text-ink-2 mt-0.5">{c.desc}</div>
          </a>
        ))}
      </div>
    </Tela>
  );
}

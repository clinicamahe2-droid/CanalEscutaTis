import { useNavigate } from "react-router-dom";
import { Tela } from "@/components/colaborador/Tela";

const CONTATOS = [
  {
    nome: "CVV — Centro de Valorização da Vida",
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
      <p className="text-sm text-muted-foreground mb-4">
        Se você corre risco agora, ligue direto — não é preciso esperar o retorno pelo canal.
      </p>
      <div className="space-y-3">
        {CONTATOS.map((c) => (
          <a
            key={c.numero}
            href={`tel:${c.numero}`}
            className="block rounded-xl border border-border bg-card p-4 hover:border-primary/50"
          >
            <div className="font-semibold text-sm">{c.nome}</div>
            <div className="font-mono text-lg text-primary-dark">{c.numero}</div>
            <div className="text-xs text-muted-foreground">{c.desc}</div>
          </a>
        ))}
      </div>
    </Tela>
  );
}

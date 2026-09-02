import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { useConfigPublica } from "@/hooks/dados";

export default function Home() {
  const nav = useNavigate();
  const { data: config } = useConfigPublica();

  return (
    <Tela className="justify-center">
      <div className="py-6">
        <div className="text-2xl font-display font-semibold text-primary-dark">
          {config?.nome_canal ?? "Canal de Escuta"}
        </div>
        <p className="text-sm text-muted-foreground mt-1">Empresa Demonstração</p>

        <div className="mt-6 rounded-xl bg-primary-soft/70 p-4 text-sm text-foreground flex gap-3">
          <ShieldCheck className="w-5 h-5 text-primary-dark shrink-0 mt-0.5" />
          <p>
            {config?.mensagem_boas_vindas ??
              "Você pode relatar sem se identificar. Não registramos seu nome, seu IP ou o aparelho que você está usando."}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Button className="w-full" onClick={() => nav("/relatar/categoria")}>
            Fazer um relato
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => nav("/consulta")}>
            Já enviei — consultar status
          </Button>
        </div>

        <Link
          to="/apoio"
          className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-primary-dark hover:underline"
        >
          <LifeBuoy className="w-4 h-4" />
          Está em risco agora? Ver contatos de apoio imediato
        </Link>
      </div>

      <div className="mt-auto pt-6 text-center">
        <Link to="/equipe/entrar" className="text-xs text-muted-foreground hover:text-foreground">
          Acesso da equipe de escuta
        </Link>
      </div>
    </Tela>
  );
}

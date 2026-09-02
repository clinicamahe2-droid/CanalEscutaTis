import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  erro: Error | null;
}

/** Nenhuma tela sem saida: se algo estourar no render, mostra recuperacao. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    // sem telemetria externa de proposito (anonimato). Só console.
    console.error("[ErrorBoundary]", erro, info.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-display font-semibold mb-2">Algo saiu do lugar</h1>
          <p className="text-sm text-muted-foreground mb-6">
            A tela encontrou um erro inesperado. Seus dados não foram perdidos.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => this.setState({ erro: null })}>
              Tentar de novo
            </Button>
            <Button onClick={() => (window.location.href = "/")}>Voltar ao início</Button>
          </div>
        </div>
      </div>
    );
  }
}

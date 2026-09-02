import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background px-6 text-center">
      <div>
        <div className="font-mono text-sm text-muted-foreground">404</div>
        <h1 className="text-xl font-display font-semibold mt-1 mb-4">Página não encontrada</h1>
        <Button asChild>
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}

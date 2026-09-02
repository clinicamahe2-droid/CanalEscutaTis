import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DemoBanner } from "@/components/DemoBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { RotaProtegida } from "@/components/RotaProtegida";

import Home from "@/pages/colaborador/Home";
import ApoioImediato from "@/pages/colaborador/ApoioImediato";
import RelatarLayout from "@/pages/colaborador/RelatarLayout";
import Categoria from "@/pages/colaborador/Categoria";
import Urgencia from "@/pages/colaborador/Urgencia";
import Relato from "@/pages/colaborador/Relato";
import Revisao from "@/pages/colaborador/Revisao";
import Protocolo from "@/pages/colaborador/Protocolo";
import Consulta from "@/pages/colaborador/Consulta";

import Login from "@/pages/equipe/Login";
import PainelLayout from "@/pages/equipe/PainelLayout";
import VisaoGeral from "@/pages/equipe/VisaoGeral";
import CaixaDeCasos from "@/pages/equipe/CaixaDeCasos";
import CasoDetalhe from "@/pages/equipe/CasoDetalhe";
import Relatorios from "@/pages/equipe/Relatorios";
import Alertas from "@/pages/equipe/Alertas";
import Configuracoes from "@/pages/equipe/Configuracoes";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <BrowserRouter>
            <AuthProvider>
              <DemoBanner />
              <Routes>
                {/* canal público (anônimo) */}
                <Route path="/" element={<Home />} />
                <Route path="/apoio" element={<ApoioImediato />} />
                <Route path="/relatar" element={<RelatarLayout />}>
                  <Route index element={<Navigate to="/relatar/categoria" replace />} />
                  <Route path="categoria" element={<Categoria />} />
                  <Route path="urgencia" element={<Urgencia />} />
                  <Route path="relato" element={<Relato />} />
                  <Route path="revisao" element={<Revisao />} />
                  <Route path="protocolo" element={<Protocolo />} />
                </Route>
                <Route path="/consulta" element={<Consulta />} />

                {/* equipe de escuta */}
                <Route path="/equipe/entrar" element={<Login />} />
                <Route
                  path="/painel"
                  element={
                    <RotaProtegida>
                      <PainelLayout />
                    </RotaProtegida>
                  }
                >
                  <Route index element={<VisaoGeral />} />
                  <Route path="casos" element={<CaixaDeCasos />} />
                  <Route path="casos/:id" element={<CasoDetalhe />} />
                  <Route path="relatorios" element={<Relatorios />} />
                  <Route path="alertas" element={<Alertas />} />
                  <Route path="config" element={<Configuracoes />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <Sonner position="top-center" />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

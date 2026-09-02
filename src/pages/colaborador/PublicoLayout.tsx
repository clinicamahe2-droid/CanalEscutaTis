import { Outlet } from "react-router-dom";
import { RelatoProvider } from "@/fluxo/RelatoContext";

/**
 * Envolve TODO o canal publico (home, apoio, relatar, consulta) com o
 * RelatoProvider. Assim ir ate /apoio no meio do fluxo nao desmonta o
 * provider nem perde o rascunho do relato.
 */
export default function PublicoLayout() {
  return (
    <RelatoProvider>
      <Outlet />
    </RelatoProvider>
  );
}

import { Outlet } from "react-router-dom";
import { RelatoProvider } from "@/fluxo/RelatoContext";

export default function RelatarLayout() {
  return (
    <RelatoProvider>
      <Outlet />
    </RelatoProvider>
  );
}

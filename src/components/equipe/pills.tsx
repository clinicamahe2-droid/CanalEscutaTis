import { Badge } from "@/components/ui/badge";
import { GRAVIDADE_ROTULO, STATUS_ROTULO } from "@/dominio/categorias";
import type { Gravidade, StatusCaso } from "@/dominio/tipos";

const GRAV_VARIANTE: Record<Gravidade, "critical" | "warning" | "success"> = {
  critica: "critical",
  media: "warning",
  baixa: "success",
};

export function PillGravidade({ g }: { g: Gravidade }) {
  return <Badge variant={GRAV_VARIANTE[g]}>{GRAVIDADE_ROTULO[g]}</Badge>;
}

const STATUS_VARIANTE: Record<StatusCaso, "critical" | "warning" | "success" | "neutral"> = {
  recebido: "neutral",
  triagem: "warning",
  em_andamento: "success",
  encaminhado: "warning",
  concluido: "success",
};

export function PillStatus({ s }: { s: StatusCaso }) {
  return <Badge variant={STATUS_VARIANTE[s]}>{STATUS_ROTULO[s]}</Badge>;
}

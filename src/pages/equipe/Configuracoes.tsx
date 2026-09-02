import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useConfiguracoes, useSalvarConfiguracoes, useResetarDemo } from "@/hooks/dados";
import { CATEGORIAS } from "@/dominio/categorias";
import { MODO_DADOS } from "@/data";
import type { CategoriaId, ConfiguracoesCanal } from "@/dominio/tipos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Configuracoes() {
  const { data, isLoading } = useConfiguracoes();
  const salvar = useSalvarConfiguracoes();
  const resetar = useResetarDemo();
  const [form, setForm] = useState<ConfiguracoesCanal | null>(null);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  if (isLoading || !form) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const patch = (p: Partial<ConfiguracoesCanal>) => setForm((f) => (f ? { ...f, ...p } : f));
  const toggleCategoria = (id: CategoriaId) => {
    const set = new Set(form.categorias_ativas);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ categorias_ativas: CATEGORIAS.filter((c) => set.has(c.id)).map((c) => c.id) });
  };

  async function gravar() {
    try {
      await salvar.mutateAsync({
        nome_canal: form.nome_canal,
        dominio: form.dominio,
        mensagem_boas_vindas: form.mensagem_boas_vindas,
        categorias_ativas: form.categorias_ativas,
        permitir_anexos: form.permitir_anexos,
        permitir_mensagens_pos_encerramento: form.permitir_mensagens_pos_encerramento,
        pesquisa_encerramento_ativa: form.pesquisa_encerramento_ativa,
      });
      toast.success("Configurações salvas.");
    } catch {
      toast.error("Não foi possível salvar.");
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <header className="mb-5">
        <h1 className="text-xl font-display font-semibold">Configurações do canal</h1>
        <p className="text-sm text-muted-foreground">Nome, categorias e regras de recebimento.</p>
      </header>

      <div className="space-y-5">
        <div>
          <Label htmlFor="nome">Nome público do canal</Label>
          <Input id="nome" className="mt-1" value={form.nome_canal} onChange={(e) => patch({ nome_canal: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="dom">Domínio de acesso</Label>
          <Input id="dom" className="mt-1" value={form.dominio} onChange={(e) => patch({ dominio: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="msg">Mensagem de boas-vindas (tela inicial)</Label>
          <textarea
            id="msg"
            value={form.mensagem_boas_vindas}
            onChange={(e) => patch({ mensagem_boas_vindas: e.target.value })}
            className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-card p-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <Label>Categorias ativas</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIAS.map((c) => {
              const ativa = form.categorias_ativas.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCategoria(c.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    ativa
                      ? "border-primary bg-primary-soft text-primary-dark"
                      : "border-border bg-surface2 text-muted-foreground line-through",
                  )}
                >
                  {c.rotulo}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Categorias desativadas somem da tela de seleção do colaborador.
          </p>
        </div>

        <ToggleLinha
          rot="Permitir anexos (foto/print)"
          v={form.permitir_anexos}
          on={(v) => patch({ permitir_anexos: v })}
        />
        <ToggleLinha
          rot="Permitir mensagens após o caso encerrado"
          v={form.permitir_mensagens_pos_encerramento}
          on={(v) => patch({ permitir_mensagens_pos_encerramento: v })}
        />
        <ToggleLinha
          rot="Pesquisa de encerramento ativada"
          v={form.pesquisa_encerramento_ativa}
          on={(v) => patch({ pesquisa_encerramento_ativa: v })}
        />

        <div className="flex gap-3 pt-2">
          <Button onClick={gravar} disabled={salvar.isPending}>
            {salvar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar configurações
          </Button>
          {MODO_DADOS === "local" && (
            <Button
              variant="outline"
              disabled={resetar.isPending}
              onClick={async () => {
                await resetar.mutateAsync();
                setForm(null);
                toast.success("Dados de demonstração restaurados.");
              }}
            >
              {resetar.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Restaurar dados de demonstração
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleLinha({ rot, v, on }: { rot: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3.5 py-3">
      <span className="text-sm">{rot}</span>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
}

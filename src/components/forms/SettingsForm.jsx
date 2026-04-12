import React, { useEffect, useState } from "react";
import { Button, Input, Label } from "../ui/Primitives.jsx";
import { Loader2 } from "lucide-react";

export default function SettingsForm({
  settings,
  onSave,
  saving,
  onCancel,
}) {
  const [diasPadraoProducao, setDiasPadraoProducao] = useState(0);

  useEffect(() => {
    setDiasPadraoProducao(settings?.diasPadraoProducao || 0);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      diasPadraoProducao: Number(diasPadraoProducao || 0),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">

      <div className="grid gap-2">
        <Label>Dias úteis padrão de produção</Label>
        <Input
          type="number"
          min="0"
          value={diasPadraoProducao}
          onChange={(e) => setDiasPadraoProducao(e.target.value)}
          placeholder="Ex: 5"
        />
        <p className="text-xs text-slate-500">
          Esse valor será usado automaticamente para calcular o prazo de produção dos pedidos.
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>

        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

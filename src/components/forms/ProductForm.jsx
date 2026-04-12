import React, { useEffect, useState } from "react";
import { Button, Input, Label, SelectField } from "../ui/Primitives.jsx";
import { Loader2 } from "lucide-react";

const emptyProduct = {
  nome: "",
  ativo: true,
};

export default function ProductForm({ onSave, initialValues, onCancel, saving }) {
  const [form, setForm] = useState(initialValues || emptyProduct);

  useEffect(() => {
    setForm(initialValues || emptyProduct);
  }, [initialValues]);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      nome: String(form.nome || "").trim(),
      ativo: form.ativo === true || form.ativo === "true",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label>Nome do produto</Label>
        <Input
          value={form.nome}
          onChange={(e) => updateField("nome", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label>Status</Label>
        <SelectField
          value={String(form.ativo)}
          onChange={(value) => updateField("ativo", value === "true")}
          options={[
            { value: "true", label: "Ativo" },
            { value: "false", label: "Inativo" },
          ]}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar produto
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

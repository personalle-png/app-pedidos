import React, { useEffect, useState } from "react";
import { emptyOrder } from "../../utils/orderHelpers.js";
import { Button, Input, Label, SelectField, Textarea } from "../ui/Primitives.jsx";
import { Loader2 } from "lucide-react";

function addBusinessDays(dateString, businessDays, holidays = []) {
  if (!dateString || businessDays === null || businessDays === undefined || businessDays === "") {
    return "";
  }

  const date = new Date(`${dateString}T12:00:00`);
  let daysToAdd = Number(businessDays);

  if (Number.isNaN(daysToAdd)) return "";

  const holidaySet = new Set(
    (holidays || []).map((h) => String(h.data).slice(0, 10))
  );

  while (daysToAdd > 0) {
    date.setDate(date.getDate() + 1);

    const day = date.getDay();
    const iso = date.toISOString().slice(0, 10);

    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidaySet.has(iso);

    if (!isWeekend && !isHoliday) {
      daysToAdd -= 1;
    }
  }

  return date.toISOString().slice(0, 10);
}

const tipoEnvioOptions = [
  "JADLOG",
  "CORREIOS REGULAR",
  "CORREIOS EXPRESSO",
  "BUSLOG",
  "EXPRESSO SÃO MIGUEL",
  "AZUL CARGO",
  "RETIRADA",
];

export default function OrderForm({
  onSave,
  initialValues,
  onCancel,
  clients,
  themes,
  settings,
  holidays,
  products,
  saving,
}) {
  const [form, setForm] = useState(emptyOrder);

  useEffect(() => {
    const safeForm = {
      ...emptyOrder,
      ...(initialValues || {}),
      item:
        typeof initialValues?.item === "object"
          ? initialValues.item?.value || ""
          : initialValues?.item || "",
      tema:
        typeof initialValues?.tema === "object"
          ? initialValues.tema?.value || ""
          : initialValues?.tema || "",
      tipoEnvio:
        typeof initialValues?.tipoEnvio === "object"
          ? initialValues.tipoEnvio?.value || ""
          : initialValues?.tipoEnvio || "",
    };

    setForm(safeForm);
  }, [initialValues]);

  useEffect(() => {
    if (form.dataPedido && settings?.diasPadraoProducao !== undefined && settings?.diasPadraoProducao !== null) {
      const prazoCalculado = addBusinessDays(
        form.dataPedido,
        settings.diasPadraoProducao,
        holidays || []
      );

      setForm((current) => ({
        ...current,
        prazoEntrega: prazoCalculado,
      }));
    }
  }, [form.dataPedido, settings?.diasPadraoProducao, holidays]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleClientSelect = (name) => {
    const client = (clients || []).find((c) => c.nome === name);

    setForm((current) => ({
      ...current,
      cliente: name,
      cidade: client?.cidade || current.cidade,
      estado: client?.estado || current.estado,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      item: typeof form.item === "object" ? form.item.value : String(form.item || ""),
      tema: typeof form.tema === "object" ? form.tema.value : String(form.tema || ""),
      tipoEnvio:
        typeof form.tipoEnvio === "object"
          ? form.tipoEnvio.value
          : String(form.tipoEnvio || ""),
      pedido: form.pedido ? Number(form.pedido) : undefined,
      qtd: Number(form.qtd || 0),
      prazoTransporte: Number(form.prazoTransporte || 0),
      dataPedido: form.dataPedido || null,
      referencia: form.referencia || null,
      dataFesta: form.dataFesta || null,
      prazoEntrega: form.prazoEntrega || null,
      observacoesPedido: form.observacoesPedido || "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label>Cliente</Label>
        <Input
          list="clientes-lista"
          value={form.cliente || ""}
          onChange={(e) => {
            updateField("cliente", e.target.value);
            handleClientSelect(e.target.value);
          }}
          required
          placeholder="Digite para pesquisar cliente"
        />
        <datalist id="clientes-lista">
          {(clients || []).map((client) => (
            <option key={client.id} value={client.nome} />
          ))}
        </datalist>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Item</Label>
          <SelectField
            value={typeof form.item === "object" ? form.item.value : form.item || ""}
            onChange={(value) => updateField("item", value)}
            options={(products || []).map((product) => product.nome)}
            placeholder="Selecione um produto"
          />
        </div>

        <div className="grid gap-2">
          <Label>Tema</Label>
          <Input
            list="themes-list"
            value={form.tema || ""}
            onChange={(e) => updateField("tema", e.target.value)}
            placeholder="Digite ou selecione um tema"
          />
          <datalist id="themes-list">
            {(themes || []).map((theme) => (
              <option key={theme.id} value={theme.nome} />
            ))}
          </datalist>
        </div>

        <div className="grid gap-2">
          <Label>Quantidade</Label>
          <Input
            type="number"
            min="1"
            value={form.qtd || ""}
            onChange={(e) => updateField("qtd", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Situação</Label>
          <SelectField
            value={form.situacao || "Em Aberto"}
            onChange={(value) => updateField("situacao", value)}
            options={["Em Aberto", "Em Andamento", "Arte enviada", "Finalizado"]}
          />
        </div>

        <div className="grid gap-2">
          <Label>Cidade</Label>
          <Input
            value={form.cidade || ""}
            onChange={(e) => updateField("cidade", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Estado</Label>
          <Input
            value={form.estado || ""}
            onChange={(e) => updateField("estado", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Data do pedido</Label>
          <Input
            type="date"
            value={form.dataPedido || ""}
            onChange={(e) => updateField("dataPedido", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Data combinada</Label>
          <Input
            type="date"
            value={form.referencia || ""}
            onChange={(e) => updateField("referencia", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Data da festa</Label>
          <Input
            type="date"
            value={form.dataFesta || ""}
            onChange={(e) => updateField("dataFesta", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="grid gap-2">
          <Label>Prazo de produção padrão</Label>
          <Input
            value={
              settings?.diasPadraoProducao !== undefined && settings?.diasPadraoProducao !== null
                ? `${settings.diasPadraoProducao} dia(s) útil(eis)`
                : "Não configurado"
            }
            readOnly
            className="bg-slate-100 cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <Label>Prazo de produção</Label>
          <Input
            type="date"
            value={form.prazoEntrega || ""}
            readOnly
            className="bg-slate-100 cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <Label>Prazo de transporte (dias úteis)</Label>
          <Input
            type="number"
            min="0"
            value={form.prazoTransporte || ""}
            onChange={(e) => updateField("prazoTransporte", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Tipo de envio</Label>
          <SelectField
            value={form.tipoEnvio || ""}
            onChange={(value) => updateField("tipoEnvio", value)}
            options={tipoEnvioOptions}
            placeholder="Selecione o tipo de envio"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações do pedido</Label>
        <Textarea
          value={form.observacoesPedido || ""}
          onChange={(e) => updateField("observacoesPedido", e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar pedido
        </Button>

        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

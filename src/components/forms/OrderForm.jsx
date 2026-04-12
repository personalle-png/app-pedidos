import React, { useEffect, useState } from 'react';
import { emptyOrder } from '../../utils/orderHelpers.js';
import { Button, Input, Label, SelectField, Textarea } from '../ui/Primitives.jsx';
import { Loader2 } from 'lucide-react';

const itemOptions = [
  "Jogo da memória",
  "Jogo de tabuleiro",
  "Quebra-cabeça 12 peças P",
  "Jogo da velha",
  "Sacolinha",
  "Jogo da velha MDF G",
  "Jogo da velha MDF P",
  "Jogo de tabuleiro com caixinha de papel",
  "Jogo de tabuleiro MDF com caixa MDF",
];

const tipoEnvioOptions = [
  "JADLOG",
  "CORREIOS REGULAR",
  "CORREIOS EXPRESSO",
  "BUSLOG",
  "EXPRESSO SÃO MIGUEL",
  "AZUL CARGO",
  "RETIRADA",
];

export default function OrderForm({ onSave, initialValues, onCancel, clients, themes, saving }) {
  const [form, setForm] = useState(initialValues || emptyOrder);

  useEffect(() => {
    setForm(initialValues || emptyOrder);
  }, [initialValues]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleClientSelect = (name) => {
    const client = clients.find((c) => c.nome === name);
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
    pedido: form.pedido ? Number(form.pedido) : undefined,
    qtd: Number(form.qtd || 0),
    prazoTransporte: Number(form.prazoTransporte || 0),
    dataPedido: form.dataPedido || null,
    referencia: form.referencia || null,
    dataFesta: form.dataFesta || null,
    prazoEntrega: form.prazoEntrega || null,
    tema: form.tema || "",
  });
};

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
  <div className="grid gap-2">
    <Label>Cliente</Label>
    <Input
      list="clientes-lista"
      value={form.cliente}
      onChange={(e) => {
        updateField("cliente", e.target.value);
        handleClientSelect(e.target.value);
      }}
      required
      placeholder="Digite para pesquisar cliente"
    />
    <datalist id="clientes-lista">
      {clients.map((client) => (
        <option key={client.id} value={client.nome} />
      ))}
    </datalist>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
    <div className="grid gap-2">
      <Label>Item</Label>
      <SelectField
        value={form.item}
        onChange={(value) => updateField("item", value)}
        options={itemOptions}
        placeholder="Selecione um item"
      />
    </div>
<div className="grid gap-2">
    <Label>Tema</Label>
    <Input
      list="themes-list"
      value={form.tema}
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
        value={form.qtd}
        onChange={(e) => updateField("qtd", e.target.value)}
        required
      />
    </div>
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <div className="grid gap-2">
      <Label>Situação</Label>
      <SelectField
        value={form.situacao}
        onChange={(value) => updateField("situacao", value)}
        options={["Em Aberto", "Em Andamento", "Arte enviada", "Finalizado"]}
      />
    </div>

    <div className="grid gap-2">
      <Label>Cidade</Label>
      <Input value={form.cidade} onChange={(e) => updateField("cidade", e.target.value)} />
    </div>

    <div className="grid gap-2">
      <Label>Estado</Label>
      <Input value={form.estado} onChange={(e) => updateField("estado", e.target.value)} />
    </div>
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <div className="grid gap-2">
      <Label>Data do pedido</Label>
      <Input type="date" value={form.dataPedido} onChange={(e) => updateField("dataPedido", e.target.value)} />
    </div>

    <div className="grid gap-2">
      <Label>Data combinada</Label>
      <Input type="date" value={form.referencia} onChange={(e) => updateField("referencia", e.target.value)} />
    </div>

    <div className="grid gap-2">
      <Label>Data da festa</Label>
      <Input type="date" value={form.dataFesta} onChange={(e) => updateField("dataFesta", e.target.value)} />
    </div>
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <div className="grid gap-2">
      <Label>Prazo de produção</Label>
      <Input
        type="date"
        value={form.prazoEntrega}
        onChange={(e) => updateField("prazoEntrega", e.target.value)}
      />
    </div>

    <div className="grid gap-2">
      <Label>Prazo de transporte (dias úteis)</Label>
      <Input
        type="number"
        min="0"
        value={form.prazoTransporte}
        onChange={(e) => updateField("prazoTransporte", e.target.value)}
      />
    </div>

    <div className="grid gap-2">
      <Label>Tipo de envio</Label>
      <SelectField
        value={form.tipoEnvio}
        onChange={(value) => updateField("tipoEnvio", value)}
        options={tipoEnvioOptions}
        placeholder="Selecione o tipo de envio"
      />
    </div>
  </div>

  <div className="grid gap-2">
    <Label>Observações do pedido</Label>
    <Textarea
      value={form.observacoesPedido}
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

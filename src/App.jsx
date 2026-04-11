import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  CalendarDays,
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Users,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Trash2,
  PencilLine,
  Database,
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const today = new Date("2026-04-11T12:00:00");

const emptyOrder = {
  pedido: "",
  cliente: "",
  item: "",
  qtd: "",
  situacao: "Em Aberto",
  cidade: "",
  estado: "",
  dataPedido: "",
  referencia: "",
  dataFesta: "",
  observacoesPedido: "",
  observacoesInternas: "",
  prazoEntrega: "",
};

const emptyClient = {
  nome: "",
  cep: "",
  endereco: "",
  bairro: "",
  numero: "",
  complemento: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  observacoes: "",
  cpf: ""
};

function cls(...parts) {
  return parts.filter(Boolean).join(" ");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.slice(0, 5) + "-" + digits.slice(5);
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 12 && digits.length <= 13) return digits;
  return null;
}

function buildWhatsAppMessage(clientName, item, pedido, dataFesta) {
  const festa = dataFesta ? formatDate(dataFesta) : "sem data informada";
  return `Olá, ${clientName}! 😊\n\nEstou entrando em contato sobre o pedido #${pedido} - ${item}.\nData da festa: ${festa}.\n\nQualquer dúvida, fico à disposição.`;
}

function getWhatsAppLink(phone, message) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T12:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getFestaAlert(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { label: "Sem data", tone: "slate" };
  if (days < 0) return { label: "Festa passou", tone: "red" };
  if (days <= 3) return { label: "Muito próxima", tone: "red" };
  if (days <= 7) return { label: "Próxima", tone: "amber" };
  return { label: "No prazo", tone: "emerald" };
}

function getPrazoAlert(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { label: "Sem prazo", tone: "slate" };
  if (days < 0) return { label: "Atrasado", tone: "red" };
  if (days <= 3) return { label: "Urgente", tone: "red" };
  if (days <= 7) return { label: "Atenção", tone: "amber" };
  return { label: "Ok", tone: "emerald" };
}

function badgeTone(tone) {
  if (tone === "red") return "bg-red-50 text-red-700 border-red-200";
  if (tone === "amber") return "bg-amber-50 text-amber-700 border-amber-200";
  if (tone === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function Card({ children, className = "" }) {
  return <div className={cls("rounded-3xl border-0 bg-white shadow-sm", className)}>{children}</div>;
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={cls(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={cls(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400",
        className
      )}
      {...props}
    />
  );
}

function Button({ children, variant = "default", className = "", ...props }) {
  const variantClass =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      : "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button
      className={cls(
        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition",
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Badge({ children, tone = "slate" }) {
  return (
    <span className={cls("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", badgeTone(tone))}>
      {children}
    </span>
  );
}

function Label({ children }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SelectField({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </option>
      ))}
    </select>
  );
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ClientForm({ onSave, initialValues, onCancel, saving }) {
  const [form, setForm] = useState(initialValues || emptyClient);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  useEffect(() => {
    setForm(initialValues || emptyClient);
    setCepError("");
  }, [initialValues]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const buscarCep = async () => {
    const cepLimpo = String(form.cep || "").replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setCepError("Digite um CEP válido.");
      return;
    }

    try {
      setCepLoading(true);
      setCepError("");

      const res = await fetch("https://viacep.com.br/ws/" + cepLimpo + "/json/");
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }

      setForm((current) => ({
        ...current,
        cep: formatCep(cepLimpo),
        endereco: data.logradouro || current.endereco,
        bairro: data.bairro || current.bairro,
        cidade: data.localidade || current.cidade,
        estado: data.uf || current.estado,
        complemento: current.complemento || data.complemento || "",
      }));
    } catch {
      setCepError("Erro ao buscar CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, telefone: formatPhone(form.telefone) });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Nome</Label>
          <Input value={form.nome} onChange={(e) => updateField("nome", e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label>Telefone</Label>
          <Input
            value={form.telefone}
            onChange={(e) => updateField("telefone", formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-2">
          <Label>CEP</Label>
          <Input
            value={form.cep}
            onChange={(e) => updateField("cep", formatCep(e.target.value))}
            placeholder="00000-000"
            maxLength={9}
          />
        </div>
        <Button type="button" variant="outline" onClick={buscarCep} disabled={cepLoading}>
          {cepLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buscar CEP
        </Button>
      </div>

      {cepError && <p className="text-sm text-red-600">{cepError}</p>}

      <div className="grid gap-2">
        <Label>Endereço</Label>
        <Input value={form.endereco} onChange={(e) => updateField("endereco", e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Bairro</Label>
          <Input value={form.bairro} onChange={(e) => updateField("bairro", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Número</Label>
          <Input value={form.numero} onChange={(e) => updateField("numero", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Complemento</Label>
          <Input value={form.complemento} onChange={(e) => updateField("complemento", e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>E-mail</Label>
          <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Cidade</Label>
          <Input value={form.cidade} onChange={(e) => updateField("cidade", e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Estado</Label>
          <Input value={form.estado} onChange={(e) => updateField("estado", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Observações</Label>
          <Textarea value={form.observacoes} onChange={(e) => updateField("observacoes", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar cliente
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function OrderForm({ onSave, initialValues, onCancel, clients, saving }) {
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
      pedido: Number(form.pedido),
      qtd: Number(form.qtd || 0),
      prazoEntrega: Number(form.prazoEntrega || 0),
      dataPedido: form.dataPedido || null,
      referencia: form.referencia || null,
      dataFesta: form.dataFesta || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Número do pedido</Label>
          <Input value={form.pedido} onChange={(e) => updateField("pedido", e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label>Cliente</Label>
          <Input
            value={form.cliente}
            onChange={(e) => updateField("cliente", e.target.value)}
            required
            placeholder="Nome do cliente"
          />
          {!!clients.length && (
            <SelectField
              value=""
              onChange={handleClientSelect}
              options={clients.map((c) => c.nome)}
              placeholder="Selecionar cliente cadastrado"
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Item</Label>
          <Input value={form.item} onChange={(e) => updateField("item", e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label>Quantidade</Label>
          <Input type="number" value={form.qtd} onChange={(e) => updateField("qtd", e.target.value)} required />
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

      <div className="grid gap-4 md:grid-cols-4">
        <div className="grid gap-2">
          <Label>Data do pedido</Label>
          <Input type="date" value={form.dataPedido} onChange={(e) => updateField("dataPedido", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Referência</Label>
          <Input type="date" value={form.referencia} onChange={(e) => updateField("referencia", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Data da festa</Label>
          <Input type="date" value={form.dataFesta} onChange={(e) => updateField("dataFesta", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Prazo de entrega</Label>
          <Input type="number" value={form.prazoEntrega} onChange={(e) => updateField("prazoEntrega", e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Observações do pedido</Label>
          <Textarea value={form.observacoesPedido} onChange={(e) => updateField("observacoesPedido", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Observações internas</Label>
          <Textarea
            value={form.observacoesInternas}
            onChange={(e) => updateField("observacoesInternas", e.target.value)}
          />
        </div>
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

export default function App() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [alertFilter, setAlertFilter] = useState("Todos");
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pedidos");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: ordersData, error: ordersError }, { data: clientsData, error: clientsError }] = await Promise.all([
        supabase.from("orders").select("*").order("pedido", { ascending: true }),
        supabase.from("clients").select("*").order("nome", { ascending: true }),
      ]);

      if (ordersError) throw ordersError;
      if (clientsError) throw clientsError;

      setOrders(ordersData || []);
      setClients(clientsData || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados do Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveOrder = async (formData) => {
    setSavingOrder(true);
    setError("");

    try {
      const payload = {
        ...formData,
        dataPedido: formData.dataPedido || null,
        referencia: formData.referencia || null,
        dataFesta: formData.dataFesta || null,
      };

      delete payload.id;
      delete payload.created_at;

      if (editingOrder) {
        const { error } = await supabase.from("orders").update(payload).eq("id", editingOrder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("orders").insert(payload);
        if (error) throw error;
      }

      setOrderOpen(false);
      setEditingOrder(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao salvar pedido.");
    } finally {
      setSavingOrder(false);
    }
  };

  const saveClient = async (formData) => {
    setSavingClient(true);
    setError("");

    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.created_at;

      if (editingClient) {
        const { error } = await supabase.from("clients").update(payload).eq("id", editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert(payload);
        if (error) throw error;
      }

      setClientOpen(false);
      setEditingClient(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao salvar cliente.");
    } finally {
      setSavingClient(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao excluir pedido.");
    }
  };

  const deleteClient = async (id) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao excluir cliente.");
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const text = [order.cliente, order.item, order.cidade, order.estado, String(order.pedido)]
          .join(" ")
          .toLowerCase();
        const festa = getFestaAlert(order.dataFesta).label;
        return (
          text.includes(search.toLowerCase()) &&
          (statusFilter === "Todos" || order.situacao === statusFilter) &&
          (alertFilter === "Todos" || festa === alertFilter)
        );
      }),
    [orders, search, statusFilter, alertFilter]
  );

  const filteredClients = useMemo(
    () =>
      clients.filter((client) => {
        const text = [
          client.nome,
          client.cep,
          client.endereco,
          client.bairro,
          client.numero,
          client.complemento,
          client.cidade,
          client.estado,
          client.telefone,
          client.email,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(clientSearch.toLowerCase());
      }),
    [clients, clientSearch]
  );

  const stats = useMemo(
    () => ({
      total: orders.length,
      emAndamento: orders.filter((o) => o.situacao === "Em Andamento").length,
      emAberto: orders.filter((o) => o.situacao === "Em Aberto").length,
      festasProximas: orders.filter((o) => {
        const d = daysUntil(o.dataFesta);
        return d !== null && d >= 0 && d <= 7;
      }).length,
      totalClientes: clients.length,
    }),
    [orders, clients]
  );

  const proximasFestas = useMemo(
    () =>
      [...orders]
        .filter((o) => o.dataFesta)
        .sort((a, b) => new Date(a.dataFesta) - new Date(b.dataFesta))
        .slice(0, 6),
    [orders]
  );

  const statuses = ["Todos", "Em Aberto", "Em Andamento", "Arte enviada", "Finalizado"];
  const alertas = ["Todos", "Muito próxima", "Próxima", "No prazo", "Festa passou", "Sem data"];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sistema de Pedidos</h1>
            <p className="mt-1 text-slate-600">
              Versão profissional com Supabase, clientes, pedidos, agenda e contato rápido.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={loadData}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => {
                setEditingOrder(null);
                setOrderOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo pedido
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                setEditingClient(null);
                setClientOpen(true);
              }}
            >
              <Users className="mr-2 h-4 w-4" /> Novo cliente
            </Button>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total de pedidos" value={stats.total} subtitle="Todos os pedidos" icon={Package} />
          <StatCard title="Em andamento" value={stats.emAndamento} subtitle="Produção ativa" icon={CheckCircle2} />
          <StatCard title="Em aberto" value={stats.emAberto} subtitle="Aguardando início" icon={CalendarDays} />
          <StatCard title="Festas próximas" value={stats.festasProximas} subtitle="Até 7 dias" icon={AlertTriangle} />
          <StatCard title="Clientes" value={stats.totalClientes} subtitle="Base cadastrada" icon={Database} />
        </div>

        <div className="grid w-full grid-cols-3 rounded-2xl bg-white p-1 shadow-sm md:w-[420px]">
          {[
            ["pedidos", "Pedidos"],
            ["agenda", "Agenda"],
            ["clientes", "Clientes"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cls("rounded-xl px-3 py-2 text-sm font-medium", tab === key ? "bg-slate-900 text-white" : "text-slate-700")}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "pedidos" && (
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900">Lista de pedidos</h2>

                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      className="pl-9"
                      placeholder="Buscar por cliente, item, cidade ou pedido"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <SelectField value={statusFilter} onChange={setStatusFilter} options={statuses} />
                  <SelectField value={alertFilter} onChange={setAlertFilter} options={alertas} />
                </div>

                <div className="mt-4">
                  {loading ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando pedidos...
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredOrders.map((order) => {
                        const festa = getFestaAlert(order.dataFesta);
                        const prazo = getPrazoAlert(order.referencia);
                        const client = clients.find((c) => c.nome?.toLowerCase() === order.cliente?.toLowerCase());
                        const whatsappLink =
                          client?.telefone &&
                          getWhatsAppLink(client.telefone, buildWhatsAppMessage(order.cliente, order.item, order.pedido, order.dataFesta));

                        return (
                          <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <h3 className="text-lg font-semibold text-slate-900">Pedido #{order.pedido}</h3>
                                  <Badge tone="slate">{order.situacao}</Badge>
                                  <Badge tone={prazo.tone}>{prazo.label}</Badge>
                                  <Badge tone={festa.tone}>{festa.label}</Badge>
                                </div>

                                <p className="font-medium text-slate-800">{order.cliente}</p>
                                <p className="text-sm text-slate-600">{order.item}</p>
                                <p className="text-sm text-slate-500">
                                  {order.cidade} · {order.estado} · Qtd: {order.qtd}
                                </p>

                                {(order.observacoesPedido || order.observacoesInternas) && (
                                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                                    {order.observacoesPedido && (
                                      <p>
                                        <span className="font-medium text-slate-800">Obs. pedido:</span> {order.observacoesPedido}
                                      </p>
                                    )}
                                    {order.observacoesInternas && (
                                      <p>
                                        <span className="font-medium text-slate-800">Obs. internas:</span> {order.observacoesInternas}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="grid min-w-[300px] gap-2 text-sm text-slate-600">
                                <div className="flex items-center justify-between gap-3">
                                  <span>Data do pedido</span>
                                  <strong>{formatDate(order.dataPedido)}</strong>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span>Referência</span>
                                  <strong>{formatDate(order.referencia)}</strong>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span>Data da festa</span>
                                  <strong>{formatDate(order.dataFesta)}</strong>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span>Dias até a festa</span>
                                  <strong>{daysUntil(order.dataFesta) ?? "—"}</strong>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                  {whatsappLink && (
                                    <Button
                                      variant="outline"
                                      className="rounded-xl"
                                      onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}
                                    >
                                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => {
                                      setEditingOrder(order);
                                      setOrderOpen(true);
                                    }}
                                  >
                                    <PencilLine className="mr-2 h-4 w-4" /> Editar
                                  </Button>
                                  <Button variant="outline" className="rounded-xl" onClick={() => deleteOrder(order.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {!filteredOrders.length && (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                          Nenhum pedido encontrado.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Próximas festas</h2>
                  <div className="mt-3 space-y-3">
                    {proximasFestas.map((order) => {
                      const alerta = getFestaAlert(order.dataFesta);
                      return (
                        <div key={order.id} className="rounded-2xl border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-900">{order.cliente}</p>
                              <p className="text-sm text-slate-600">{order.item}</p>
                              <p className="mt-1 text-sm text-slate-500">{formatDate(order.dataFesta)}</p>
                            </div>
                            <div className="text-right">
                              <Badge tone={alerta.tone}>{alerta.label}</Badge>
                              <p className="mt-2 text-sm text-slate-500">{daysUntil(order.dataFesta)} dia(s)</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6 text-sm text-slate-600">
                  <h2 className="text-xl font-semibold text-slate-900">Status do sistema</h2>
                  <div className="mt-3 space-y-2">
                    <p>• Banco conectado ao Supabase</p>
                    <p>• Variáveis via Vercel (VITE_SUPABASE_*)</p>
                    <p>• CRUD completo de pedidos e clientes</p>
                    <p>• Botão de WhatsApp com mensagem pronta</p>
                    <p>• Busca de CEP integrada ao ViaCEP</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "agenda" && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">Agenda de prioridade</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="px-3 py-3 font-medium">Pedido</th>
                      <th className="px-3 py-3 font-medium">Cliente</th>
                      <th className="px-3 py-3 font-medium">Item</th>
                      <th className="px-3 py-3 font-medium">Referência</th>
                      <th className="px-3 py-3 font-medium">Data da festa</th>
                      <th className="px-3 py-3 font-medium">Alerta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...orders]
                      .sort((a, b) => {
                        const da = a.dataFesta ? new Date(a.dataFesta).getTime() : Infinity;
                        const db = b.dataFesta ? new Date(b.dataFesta).getTime() : Infinity;
                        return da - db;
                      })
                      .map((order) => {
                        const alerta = getFestaAlert(order.dataFesta);
                        return (
                          <tr key={order.id} className="border-b last:border-0">
                            <td className="px-3 py-3 font-medium text-slate-800">#{order.pedido}</td>
                            <td className="px-3 py-3">{order.cliente}</td>
                            <td className="px-3 py-3">{order.item}</td>
                            <td className="px-3 py-3">{formatDate(order.referencia)}</td>
                            <td className="px-3 py-3">{formatDate(order.dataFesta)}</td>
                            <td className="px-3 py-3">
                              <Badge tone={alerta.tone}>{alerta.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {tab === "clientes" && (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
            <Card>
              <div className="p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Cadastro de clientes</h2>
                  <Button
                    className="rounded-2xl"
                    onClick={() => {
                      setEditingClient(null);
                      setClientOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Novo cliente
                  </Button>
                </div>

                <div className="mt-3">
                  <Input
                    placeholder="Buscar por nome, CEP, endereço, cidade, telefone ou e-mail"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>

                <div className="mt-4 grid gap-4">
                  {filteredClients.map((client) => {
                    const pedidosDoCliente = orders.filter(
                      (order) => order.cliente?.toLowerCase() === client.nome?.toLowerCase()
                    );
                    const whatsappLink = client.telefone ? getWhatsAppLink(client.telefone, `Olá, ${client.nome}! 😊`) : null;

                    return (
                      <div key={client.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-slate-900">{client.nome}</h3>
                            <p className="text-sm text-slate-600">
                              {client.cidade} · {client.estado}
                            </p>
                            {client.cep && <p className="text-sm text-slate-600">CEP: {client.cep}</p>}
                            {client.endereco && (
                              <p className="text-sm text-slate-600">
                                {client.endereco}
                                {client.numero ? `, ${client.numero}` : ""}
                              </p>
                            )}
                            {client.bairro && <p className="text-sm text-slate-600">Bairro: {client.bairro}</p>}
                            {client.complemento && (
                              <p className="text-sm text-slate-600">Complemento: {client.complemento}</p>
                            )}
                            {client.telefone && <p className="text-sm text-slate-600">Telefone: {client.telefone}</p>}
                            {client.email && <p className="text-sm text-slate-600">E-mail: {client.email}</p>}
                            {client.observacoes && <p className="text-sm text-slate-500">{client.observacoes}</p>}
                          </div>

                          <div className="min-w-[220px] space-y-2">
                            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                              <p>
                                <span className="font-medium text-slate-800">Pedidos vinculados:</span> {pedidosDoCliente.length}
                              </p>
                              {pedidosDoCliente.slice(0, 3).map((pedido) => (
                                <p key={pedido.id} className="mt-1">
                                  #{pedido.pedido} · {pedido.item}
                                </p>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {whatsappLink && (
                                <Button
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}
                                >
                                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
                                  setEditingClient(client);
                                  setClientOpen(true);
                                }}
                              >
                                <PencilLine className="mr-2 h-4 w-4" /> Editar
                              </Button>
                              <Button variant="outline" className="rounded-xl" onClick={() => deleteClient(client.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!filteredClients.length && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                      Nenhum cliente encontrado.
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-semibold text-slate-900">{clients.length}</p>
                  <p>Total de clientes cadastrados</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Integração com pedidos</p>
                  <p className="mt-1">Ao cadastrar um pedido, você pode selecionar um cliente e reaproveitar dados básicos.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Pronto para produção</p>
                  <p className="mt-1">Agora a base já está preparada para deploy no Vercel com Supabase real.</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal
        open={orderOpen}
        title={editingOrder ? "Editar pedido" : "Novo pedido"}
        onClose={() => setOrderOpen(false)}
      >
        <OrderForm
          onSave={saveOrder}
          initialValues={editingOrder || emptyOrder}
          onCancel={() => setOrderOpen(false)}
          clients={clients}
          saving={savingOrder}
        />
      </Modal>

      <Modal
        open={clientOpen}
        title={editingClient ? "Editar cliente" : "Novo cliente"}
        onClose={() => setClientOpen(false)}
      >
        <ClientForm
          onSave={saveClient}
          initialValues={editingClient || emptyClient}
          onCancel={() => setClientOpen(false)}
          saving={savingClient}
        />
      </Modal>
    </div>
  );
}

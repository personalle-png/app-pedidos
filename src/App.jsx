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
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
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
  return `Olá, ${clientName}! 😊

Estou entrando em contato sobre o pedido #${pedido} - ${item}.
Data da festa: ${festa}.

Qualquer dúvida, fico à disposição.`;
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
        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
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

function Label({ children }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function ClientForm({ onSave, initialValues, onCancel, saving }) {
  const [form, setForm] = useState(initialValues || emptyClient);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  useEffect(() => {
    setForm(initialValues || emptyClient);
    setCepError("");
  }, [initialValues]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buscarCep = async () => {
    const cepLimpo = String(form.cep || "").replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setCepError("Digite um CEP válido.");
      return;
    }

    try {
      setCepLoading(true);
      setCepError("");

      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
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

    const payload = {
      ...form,
      telefone: formatPhone(form.telefone),
    };

    onSave(payload);
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

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleClientSelect = (name) => {
    const client = clients.find((

import { supabase } from "../../lib/supabase";
import React, { useState, useEffect, useMemo } from "react";

import {
  Box,
  Barcode,
  FileText,
  Package,
  Calculator,
  Save,
  Search,
  Plus,
  Trash2,
} from "lucide-react";

function gerarSKU(nome) {
  if (!nome) return "";

  const base = nome
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((p) => p.substring(0, 3))
    .join("");

  const random = Math.floor(100 + Math.random() * 900);

  return `${base}-${random}`;
}

const emptyProduct = {
  nome: "",
  sku: "",
  codigoBarras: "",
  descricao: "",
  categoria: "",
  marca: "",
  unidade: "UN",
  origem: "0",
  ncm: "95059000",
  cest: "",
  cfopPadrao: "5102",
  cstIcms: "00",
  csosn: "",
  cstPis: "01",
  cstCofins: "01",
  aliquotaIcms: "0.00",
  aliquotaPis: "0.00",
  aliquotaCofins: "0.00",
  precoCusto: "",
  precoVenda: "",
  estoqueAtual: "",
  estoqueMinimo: "",
  pesoLiquido: "",
  pesoBruto: "",
  largura: "",
  altura: "",
  comprimento: "",
  ativo: true,
  observacoes: "",
};

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className={`w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ${className}`}
        {...props}
      />
    </label>
  );
}

function Textarea({ label, className = "", ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className={`w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ${className}`}
        {...props}
      />
    </label>
  );
}

function Button({ children, variant = "default", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium";
  const styles =
    variant === "outline"
      ? "border bg-white"
      : variant === "danger"
      ? "border border-red-200 bg-red-50 text-red-700"
      : "bg-slate-900 text-white";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

function toNumber(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function CadastroProdutosFiscal() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);

  // ✅ AGORA CORRETO (dentro do componente)
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter((p) =>
      p.nome?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const updateField = (field, value) => {
    setForm((current) => {
      const updated = { ...current, [field]: value };

      if (field === "nome" && !current.sku) {
        updated.sku = gerarSKU(value);
      }

      return updated;
    });
  };

  const handleSave = async () => {
    const payload = {
      nome: form.nome,
      sku: form.sku,
      ncm: form.ncm,
      preco_venda: toNumber(form.precoVenda),
    };

    const { error } = await supabase.from("products").upsert([payload]);

    if (!error) {
      alert("Salvo!");
      loadProducts(); // 🔥 atualiza lista
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Button onClick={handleSave}>Salvar</Button>

      <input
        placeholder="Pesquisar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProducts.map((p) => (
        <div key={p.id}>{p.nome}</div>
      ))}
    </div>
  );
}

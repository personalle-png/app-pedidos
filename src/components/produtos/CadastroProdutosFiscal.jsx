import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Search } from "lucide-react";

// ================= UTIL =================
function gerarSKU(nome) {
  if (!nome) return "";

  const base = nome
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map(p => p.substring(0, 3))
    .join("");

  return `${base}-${Math.floor(100 + Math.random() * 900)}`;
}

function toNumber(v) {
  const n = Number(String(v || "0").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

// ================= COMPONENTES =================
function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      <input className="border rounded-lg px-3 py-2" {...props} />
    </label>
  );
}

function Button({ children, ...props }) {
  return (
    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2" {...props}>
      {children}
    </button>
  );
}

// ================= ESTADO =================
const emptyProduct = {
  nome: "",
  sku: "",
  unidade: "UN",
  ncm: "95059000",
  precoVenda: "",
  pesoLiquido: "",
  pesoBruto: "",
  largura: "",
  altura: "",
  comprimento: "",
  estoqueAtual: "",
};

// ================= COMPONENT =================
export default function CadastroProdutosFiscal() {
  const [form, setForm] = useState(emptyProduct);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // ===== LOAD =====
  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ===== FILTRO =====
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter(p =>
      p.nome?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // ===== UPDATE =====
  const updateField = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };

      if (field === "nome" && !prev.sku) {
        updated.sku = gerarSKU(value);
      }

      return updated;
    });
  };

  // ===== SAVE =====
  const handleSave = async () => {
    const payload = {
      nome: form.nome,
      sku: form.sku,
      unidade: form.unidade,
      ncm: form.ncm,
      preco_venda: toNumber(form.precoVenda),
      peso_liquido: toNumber(form.pesoLiquido),
      peso_bruto: toNumber(form.pesoBruto),
      largura: toNumber(form.largura),
      altura: toNumber(form.altura),
      comprimento: toNumber(form.comprimento),
      estoque_atual: toNumber(form.estoqueAtual),
    };

    const { error } = await supabase.from("products").upsert([payload]);

    if (error) {
      alert("Erro ao salvar");
      return;
    }

    alert("Produto salvo!");
    setForm(emptyProduct);
    loadProducts();
  };

  // ===== SELECT =====
  const handleSelect = (p) => {
    setForm({
      nome: p.nome || "",
      sku: p.sku || "",
      unidade: p.unidade || "UN",
      ncm: p.ncm || "95059000",
      precoVenda: p.preco_venda || "",
      pesoLiquido: p.peso_liquido || "",
      pesoBruto: p.peso_bruto || "",
      largura: p.largura || "",
      altura: p.altura || "",
      comprimento: p.comprimento || "",
      estoqueAtual: p.estoque_atual || "",
    });
  };

  // ================= UI =================
  return (
    <div className="p-6 grid grid-cols-2 gap-6">

      {/* FORM */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Cadastro de produtos</h2>
          <Button onClick={handleSave}>
            <Save size={16} /> Salvar
          </Button>
        </div>

        <Input label="Nome" value={form.nome} onChange={e => updateField("nome", e.target.value)} />
        <Input label="SKU" value={form.sku} onChange={e => updateField("sku", e.target.value)} />

        <Input label="Unidade" value={form.unidade} onChange={e => updateField("unidade", e.target.value)} />

        <Input label="NCM" value={form.ncm} onChange={e => updateField("ncm", e.target.value)} />

        <Input label="Preço" value={form.precoVenda} onChange={e => updateField("precoVenda", e.target.value)} />

        <h3 className="font-semibold mt-4">Dimensões</h3>

        <Input label="Peso líquido" value={form.pesoLiquido} onChange={e => updateField("pesoLiquido", e.target.value)} />
        <Input label="Peso bruto" value={form.pesoBruto} onChange={e => updateField("pesoBruto", e.target.value)} />

        <Input label="Largura" value={form.largura} onChange={e => updateField("largura", e.target.value)} />
        <Input label="Altura" value={form.altura} onChange={e => updateField("altura", e.target.value)} />
        <Input label="Comprimento" value={form.comprimento} onChange={e => updateField("comprimento", e.target.value)} />

        <Input label="Estoque" value={form.estoqueAtual} onChange={e => updateField("estoqueAtual", e.target.value)} />
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search size={16} />
          <input
            className="border px-3 py-2 rounded-lg w-full"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelect(p)}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <p className="font-semibold">{p.nome}</p>
            <p className="text-sm text-gray-500">SKU: {p.sku}</p>
            <p className="text-sm">R$ {p.preco_venda}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

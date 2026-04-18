import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Search } from "lucide-react";

// ========================
// UTIL
// ========================
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

function toNumber(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

// ========================
// COMPONENTES UI SIMPLES
// ========================
function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="border rounded-lg px-3 py-2 outline-none focus:border-slate-400"
        {...props}
      />
    </label>
  );
}

function Button({ children, variant = "default", ...props }) {
  const base = "px-4 py-2 rounded-lg text-sm flex items-center gap-2";

  const styles =
    variant === "outline"
      ? "border bg-white"
      : "bg-slate-900 text-white";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}

// ========================
// ESTADO INICIAL
// ========================
const emptyProduct = {
  nome: "",
  sku: "",
  ncm: "95059000",
  precoVenda: "",
};

// ========================
// COMPONENTE PRINCIPAL
// ========================
export default function CadastroProdutosFiscal() {
  const [form, setForm] = useState(emptyProduct);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // ========================
  // LOAD PRODUTOS
  // ========================
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ========================
  // FILTRO
  // ========================
  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.nome?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // ========================
  // UPDATE FORM
  // ========================
  const updateField = (field, value) => {
    setForm((current) => {
      const updated = { ...current, [field]: value };

      if (field === "nome" && !current.sku) {
        updated.sku = gerarSKU(value);
      }

      return updated;
    });
  };

  // ========================
  // SALVAR
  // ========================
  const handleSave = async () => {
    if (!form.nome) {
      alert("Preencha o nome");
      return;
    }

    const payload = {
      nome: form.nome,
      sku: form.sku,
      ncm: form.ncm,
      preco_venda: toNumber(form.precoVenda),
    };

    const { error } = await supabase.from("products").upsert([payload]);

    if (error) {
      console.error(error);
      alert("Erro ao salvar");
      return;
    }

    alert("Salvo com sucesso!");

    setForm(emptyProduct);
    loadProducts();
  };

  // ========================
  // CLICK PRODUTO (editar)
  // ========================
  const handleSelectProduct = (p) => {
    setForm({
      nome: p.nome || "",
      sku: p.sku || "",
      ncm: p.ncm || "95059000",
      precoVenda: p.preco_venda || "",
    });
  };

  // ========================
  // UI
  // ========================
  return (
    <div className="p-6 grid grid-cols-2 gap-6">

      {/* ================= FORM ================= */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Cadastro de produtos</h2>

          <Button onClick={handleSave}>
            <Save size={16} />
            Salvar
          </Button>
        </div>

        <Input
          label="Nome do produto"
          value={form.nome}
          onChange={(e) => updateField("nome", e.target.value)}
        />

        <Input
          label="SKU"
          value={form.sku}
          onChange={(e) => updateField("sku", e.target.value)}
        />

        <Input
          label="NCM"
          value={form.ncm}
          onChange={(e) => updateField("ncm", e.target.value)}
        />

        <Input
          label="Preço de venda"
          value={form.precoVenda}
          onChange={(e) => updateField("precoVenda", e.target.value)}
        />
      </div>

      {/* ================= LISTA ================= */}
      <div className="space-y-4">

        <div className="flex items-center gap-2">
          <Search size={16} />
          <input
            className="border rounded-lg px-3 py-2 w-full"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleSelectProduct(p)}
              className="p-4 border rounded-xl cursor-pointer hover:bg-slate-50"
            >
              <p className="font-semibold">{p.nome}</p>
              <p className="text-sm text-gray-500">SKU: {p.sku}</p>
              <p className="text-sm text-gray-500">NCM: {p.ncm}</p>
              <p className="text-sm text-gray-500">
                R$ {p.preco_venda}
              </p>
            </div>
          ))}

          {!filteredProducts.length && (
            <div className="text-center text-gray-400 mt-6">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

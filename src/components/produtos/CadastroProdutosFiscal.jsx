import React, { useMemo, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

// ================= UTIL =================
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

  return `${base}-${Math.floor(100 + Math.random() * 900)}`;
}

function toNumber(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

// ================= ESTADO =================
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
  aliquotaIcms: "0.00",
  aliquotaPis: "0.00",
  aliquotaCofins: "0.00",
  precoCusto: "",
  precoVenda: "",
  estoqueAtual: "",
  estoqueMinimo: "",
  pesoLiquido: "",
  altura: "",
  largura: "",
};

// ================= COMPONENT =================
export default function CadastroProdutosFiscal() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);

  // LOAD
  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // FILTRO
  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.nome?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // UPDATE
  const updateField = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "nome" && !prev.sku) {
        updated.sku = gerarSKU(value);
      }

      return updated;
    });
  };

  // SAVE
  const handleSave = async () => {
    const payload = {
      nome: form.nome,
      sku: form.sku,
      codigo_barras: form.codigoBarras,
      descricao: form.descricao,
      categoria: form.categoria,
      marca: form.marca,
      unidade: form.unidade,
      origem: form.origem,
      ncm: form.ncm,
      cest: form.cest,
      cfop_padrao: form.cfopPadrao,
      aliquota_icms: toNumber(form.aliquotaIcms),
      aliquota_pis: toNumber(form.aliquotaPis),
      aliquota_cofins: toNumber(form.aliquotaCofins),
      preco_custo: toNumber(form.precoCusto),
      preco_venda: toNumber(form.precoVenda),
      estoque_atual: toNumber(form.estoqueAtual),
      estoque_minimo: toNumber(form.estoqueMinimo),
      peso_liquido: toNumber(form.pesoLiquido),
      altura: toNumber(form.altura),
      largura: toNumber(form.largura),
    };

    await supabase.from("products").upsert([payload], {
      onConflict: "sku",
    });

    loadProducts();
    setForm(emptyProduct);
  };

  const handleNew = () => setForm(emptyProduct);

  const handleSelect = (p) => {
    setForm({
      ...emptyProduct,
      ...p,
      precoVenda: p.preco_venda,
    });
  };

  // ================= UI =================
  return (
    <div className="p-6 grid grid-cols-2 gap-6">

      {/* LISTA */}
      <div className="bg-white border rounded-2xl p-4 space-y-4">
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Nenhum produto cadastrado
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              className="p-4 border rounded-xl cursor-pointer hover:bg-slate-50"
            >
              <p className="font-semibold">{p.nome}</p>
              <p className="text-xs text-gray-500">SKU: {p.sku}</p>
              <p className="text-sm">R$ {p.preco_venda || 0}</p>
            </div>
          ))
        )}
      </div>

      {/* FORM */}
      <div className="bg-white border rounded-2xl p-5 space-y-5">

        <h2 className="font-semibold">Cadastro de produtos</h2>

        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => updateField("nome", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => updateField("sku", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Código de barras"
            value={form.codigoBarras}
            onChange={(e) => updateField("codigoBarras", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="NCM"
            value={form.ncm}
            onChange={(e) => updateField("ncm", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="CFOP"
            value={form.cfopPadrao}
            onChange={(e) => updateField("cfopPadrao", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="ICMS %"
            value={form.aliquotaIcms}
            onChange={(e) => updateField("aliquotaIcms", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="PIS %"
            value={form.aliquotaPis}
            onChange={(e) => updateField("aliquotaPis", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="COFINS %"
            value={form.aliquotaCofins}
            onChange={(e) => updateField("aliquotaCofins", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Preço custo"
            value={form.precoCusto}
            onChange={(e) => updateField("precoCusto", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Preço venda"
            value={form.precoVenda}
            onChange={(e) => updateField("precoVenda", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Estoque atual"
            value={form.estoqueAtual}
            onChange={(e) => updateField("estoqueAtual", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Estoque mínimo"
            value={form.estoqueMinimo}
            onChange={(e) => updateField("estoqueMinimo", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Peso"
            value={form.pesoLiquido}
            onChange={(e) => updateField("pesoLiquido", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Altura"
            value={form.altura}
            onChange={(e) => updateField("altura", e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Largura"
            value={form.largura}
            onChange={(e) => updateField("largura", e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl"
          >
            Salvar
          </button>

          <button
            onClick={handleNew}
            className="border px-4 py-2 rounded-xl"
          >
            Novo
          </button>
        </div>

      </div>
    </div>
  );
}

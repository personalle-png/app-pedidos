import React, { useMemo, useState } from "react";
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

export default function CadastroProdutosFiscal() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState(false);

  // ================= LOAD =================
  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts(data || []);
  };

  // ================= FILTRO =================
  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.nome?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // ================= UPDATE =================
  const updateField = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "nome" && !prev.sku) {
        updated.sku = gerarSKU(value);
      }

      return updated;
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
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

      const { error } = await supabase
        .from("products")
        .upsert([payload], { onConflict: "sku" });

      if (error) throw error;

      setMessage("✅ Produto salvo com sucesso!");
      setForm(emptyProduct);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao salvar produto");
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!form.sku) return;

    if (!confirm("Deseja excluir este produto?")) return;

    await supabase.from("products").delete().eq("sku", form.sku);

    setMessage("🗑️ Produto excluído");
    setForm(emptyProduct);
    setProducts([]);
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

        <button
          onClick={() => {
            loadProducts();
            setSearched(true);
          }}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Pesquisar
        </button>

        {!searched ? (
          <div className="text-center text-gray-400 py-10">
            Clique em pesquisar para carregar os produtos
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Nenhum produto encontrado
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

  {message && (
    <div className="text-sm bg-green-100 text-green-700 p-2 rounded-xl">
      {message}
    </div>
  )}

  <h2 className="font-semibold">Cadastro de produtos</h2>

  {/* NOME */}
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500">Nome do produto</label>
    <input
      className="border rounded-xl px-3 py-2"
      value={form.nome}
      onChange={(e) => updateField("nome", e.target.value)}
    />
  </div>

  {/* SKU + CODIGO */}
  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">SKU</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.sku}
        onChange={(e) => updateField("sku", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Código de barras</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.codigoBarras}
        onChange={(e) => updateField("codigoBarras", e.target.value)}
      />
    </div>
  </div>

  {/* DESCRIÇÃO */}
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500">Descrição</label>
    <textarea
      className="border rounded-xl px-3 py-2"
      value={form.descricao}
      onChange={(e) => updateField("descricao", e.target.value)}
    />
  </div>

  {/* FISCAL */}
  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">NCM</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.ncm}
        onChange={(e) => updateField("ncm", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">CFOP</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.cfopPadrao}
        onChange={(e) => updateField("cfopPadrao", e.target.value)}
      />
    </div>
  </div>

  {/* IMPOSTOS */}
  <div className="grid grid-cols-3 gap-3">
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">ICMS %</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.aliquotaIcms}
        onChange={(e) => updateField("aliquotaIcms", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">PIS %</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.aliquotaPis}
        onChange={(e) => updateField("aliquotaPis", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">COFINS %</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.aliquotaCofins}
        onChange={(e) => updateField("aliquotaCofins", e.target.value)}
      />
    </div>
  </div>

  {/* PREÇOS */}
  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Preço custo</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.precoCusto}
        onChange={(e) => updateField("precoCusto", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Preço venda</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.precoVenda}
        onChange={(e) => updateField("precoVenda", e.target.value)}
      />
    </div>
  </div>

  {/* ESTOQUE */}
  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Estoque atual</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.estoqueAtual}
        onChange={(e) => updateField("estoqueAtual", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Estoque mínimo</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.estoqueMinimo}
        onChange={(e) => updateField("estoqueMinimo", e.target.value)}
      />
    </div>
  </div>

  {/* DIMENSÕES */}
  <div className="grid grid-cols-3 gap-3">
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Peso (kg)</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.pesoLiquido}
        onChange={(e) => updateField("pesoLiquido", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Altura (cm)</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.altura}
        onChange={(e) => updateField("altura", e.target.value)}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">Largura (cm)</label>
      <input
        className="border rounded-xl px-3 py-2"
        value={form.largura}
        onChange={(e) => updateField("largura", e.target.value)}
      />
    </div>
  </div>

  {/* BOTÕES */}
  <div className="flex gap-2 pt-2">
    <button
      onClick={handleSave}
      className="bg-slate-900 text-white px-4 py-2 rounded-xl"
    >
      Salvar
    </button>

    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-4 py-2 rounded-xl"
    >
      Excluir
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

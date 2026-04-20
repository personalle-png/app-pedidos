import React, { useMemo, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
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

export default function CadastroProdutosFiscal() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);

  // ================= LOAD =================
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

  // ================= FILTRO =================
  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return products.filter((product) =>
      [product.nome, product.sku, product.ncm]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [products, search]);

  // ================= UPDATE =================
  const updateField = (field, value) => {
    setForm((current) => {
      const updated = { ...current, [field]: value };

      if (field === "nome" && !current.sku) {
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
        cst_icms: form.cstIcms,
        csosn: form.csosn,
        cst_pis: form.cstPis,
        cst_cofins: form.cstCofins,
        aliquota_icms: toNumber(form.aliquotaIcms),
        aliquota_pis: toNumber(form.aliquotaPis),
        aliquota_cofins: toNumber(form.aliquotaCofins),
        preco_custo: toNumber(form.precoCusto),
        preco_venda: toNumber(form.precoVenda),
        estoque_atual: toNumber(form.estoqueAtual),
        estoque_minimo: toNumber(form.estoqueMinimo),
        peso_liquido: toNumber(form.pesoLiquido),
        peso_bruto: toNumber(form.pesoBruto),
        largura: toNumber(form.largura),
        altura: toNumber(form.altura),
        comprimento: toNumber(form.comprimento),
        ativo: form.ativo,
        observacoes: form.observacoes,
      };

      const { error } = await supabase
        .from("products")
        .upsert([payload], { onConflict: "sku" });

      if (error) throw error;

      alert("Produto salvo com sucesso!");
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar produto");
    }
  };

  const handleNew = () => setForm(emptyProduct);

  const handleSelect = (product) => {
    setForm({
      ...emptyProduct,
      ...product,
      precoVenda: product.preco_venda,
    });
  };

 return (
  <div className="p-6 grid grid-cols-2 gap-6">

    {/* LISTA */}
    <div className="space-y-4">
      <input
        className="w-full border rounded-xl px-3 py-2"
        placeholder="Buscar produto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProducts.map((p) => (
        <div
          key={p.id}
          onClick={() => handleSelect(p)}
          className="p-4 border rounded-xl bg-white cursor-pointer hover:bg-slate-50"
        >
          <p className="font-semibold">{p.nome}</p>
          <p className="text-sm text-gray-500">SKU: {p.sku}</p>
          <p className="text-sm">R$ {p.preco_venda}</p>
        </div>
      ))}
    </div>

   <div className="space-y-6">

  <h2 className="text-lg font-semibold">Cadastro de produtos</h2>

  {/* ================= DADOS GERAIS ================= */}
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-500">Dados gerais</h3>

    <input
      className="w-full border rounded-xl px-3 py-2"
      placeholder="Nome do produto"
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

    <textarea
      className="w-full border rounded-xl px-3 py-2"
      placeholder="Descrição"
      value={form.descricao}
      onChange={(e) => updateField("descricao", e.target.value)}
    />
  </div>

  {/* ================= FISCAL ================= */}
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-500">Fiscal</h3>

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
  </div>

  {/* ================= PREÇO ================= */}
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-500">Preços</h3>

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
  </div>

  {/* ================= ESTOQUE ================= */}
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-500">Estoque</h3>

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
  </div>

  {/* ================= DIMENSÕES ================= */}
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-500">Dimensões</h3>

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
      onClick={handleNew}
      className="border px-4 py-2 rounded-xl"
    >
      Novo
    </button>
  </div>

</div>
);
}

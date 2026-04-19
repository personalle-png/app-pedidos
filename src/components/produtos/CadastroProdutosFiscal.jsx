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
      <div>
        <input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredProducts.map((p) => (
          <div key={p.id} onClick={() => handleSelect(p)}>
            {p.nome}
          </div>
        ))}
      </div>

      {/* FORM */}
      <div>
        <h2>Cadastro de produtos</h2>

        <input
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => updateField("nome", e.target.value)}
        />

        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) => updateField("sku", e.target.value)}
        />

        <input
          placeholder="NCM"
          value={form.ncm}
          onChange={(e) => updateField("ncm", e.target.value)}
        />

        <input
          placeholder="Preço"
          value={form.precoVenda}
          onChange={(e) => updateField("precoVenda", e.target.value)}
        />

        <button onClick={handleSave}>Salvar</button>
        <button onClick={handleNew}>Novo</button>
      </div>

    </div>
  );
}

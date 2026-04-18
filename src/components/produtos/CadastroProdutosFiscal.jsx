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
    .map(p => p.substring(0, 3))
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

const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setProducts(data || []);
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
};

useEffect(() => {
  loadProducts();
}, []);

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
        className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400 ${className}`}
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
        className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400 ${className}`}
        {...props}
      />
    </label>
  );
}

function Select({ label, options, className = "", ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Button({ children, variant = "default", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      : variant === "danger"
      ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      : "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Badge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [product.nome, product.sku, product.ncm, product.unidade]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [products, search]);

  const margem = useMemo(() => {
    const custo = toNumber(form.precoCusto);
    const venda = toNumber(form.precoVenda);
    if (!custo || !venda || venda <= custo) return "0.00";
    return (((venda - custo) / venda) * 100).toFixed(2);
  }, [form.precoCusto, form.precoVenda]);

  const updateField = (field, value) => {
  setForm((current) => {
    const updated = { ...current, [field]: value };

    // gerar SKU automaticamente quando digitar nome
    if (field === "nome" && !current.sku) {
      updated.sku = gerarSKU(value);
    }

    return updated;
  });
};

 const handleSave = async () => {
  try {
    if (!form.nome?.trim()) {
      alert("Preencha o nome do produto.");
      return;
    }

    if (!form.sku) {
      alert("SKU não gerado.");
      return;
    }

    const toNumber = (v) => {
      const n = Number(String(v || "0").replace(",", "."));
      return isNaN(n) ? 0 : n;
    };

    const payload = {
      nome: form.nome,
      sku: form.sku,

      codigo_barras: form.codigoBarras || "",
      descricao: form.descricao || "",
      categoria: form.categoria || "",
      marca: form.marca || "",
      unidade: form.unidade || "UN",
      origem: form.origem || "0",
      ncm: form.ncm || "95059000",
      cest: form.cest || "",
      cfop_padrao: form.cfopPadrao || "",
      cst_icms: form.cstIcms || "",
      csosn: form.csosn || "",
      cst_pis: form.cstPis || "",
      cst_cofins: form.cstCofins || "",

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

      ativo: !!form.ativo,
      observacoes: form.observacoes || "",
    };

    console.log("Payload enviado:", payload);

    const { error } = await supabase
      .from("products")
      .upsert([payload], { onConflict: "sku" });

    if (error) {
      console.error("Erro Supabase:", error);
      alert(error.message);
      return;
    }

    alert("Produto salvo com sucesso!");
  } catch (err) {
    console.error("Erro geral:", err);
    alert("Erro ao salvar produto.");
  }
};

  const handleNew = () => {
    setForm(emptyProduct);
  };

  const handleMockLoad = (product) => {
    setForm((current) => ({
      ...current,
      ...product,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Cadastro de produtos
            </h1>
            <p className="mt-1 text-slate-600">
              Estrutura pronta para controle interno e futura emissão de nota fiscal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" />
              Novo produto
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Salvar produto
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 outline-none focus:border-slate-400"
                  placeholder="Pesquisar por nome, SKU, NCM ou unidade"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleMockLoad(product)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{product.nome}</p>
                        <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                        <p className="text-sm text-slate-500">NCM: {product.ncm}</p>
                      </div>
                      <Badge active={product.ativo} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                      <p>Unidade: {product.unidade}</p>
                      <p>Preço: R$ {product.precoVenda}</p>
                      <p>Estoque: {product.estoqueAtual}</p>
                    </div>
                  </button>
                ))}

                {!filteredProducts.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <div className="p-6 space-y-5">
                <SectionTitle
                  icon={Box}
                  title="Dados principais"
                  subtitle="Informações comerciais e de identificação do produto"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Nome do produto"
                    value={form.nome}
                    onChange={(e) => updateField("nome", e.target.value)}
                  />
                  <Input
                    label="SKU / código interno"
                    value={form.sku}
                    onChange={(e) => updateField("sku", e.target.value)}
                  />
                  <Input
                    label="Categoria"
                    value={form.categoria}
                    onChange={(e) => updateField("categoria", e.target.value)}
                  />
                  <Input
                    label="Marca"
                    value={form.marca}
                    onChange={(e) => updateField("marca", e.target.value)}
                  />
                  <Select
                    label="Unidade comercial"
                    value={form.unidade}
                    onChange={(e) => updateField("unidade", e.target.value)}
                    options={[
                      { value: "UN", label: "UN - Unidade" },
                      { value: "CX", label: "CX - Caixa" },
                      { value: "KIT", label: "KIT - Kit" },
                      { value: "JG", label: "JG - Jogo" },
                    ]}
                  />
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Ativo</span>
                    <button
                      type="button"
                      onClick={() => updateField("ativo", !form.ativo)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm ${
                        form.ativo
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {form.ativo ? "Produto ativo" : "Produto inativo"}
                    </button>
                  </label>
                  <div className="md:col-span-2">
                    <Textarea
                      label="Descrição"
                      rows={4}
                      value={form.descricao}
                      onChange={(e) => updateField("descricao", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-5">
                <SectionTitle
                  icon={Barcode}
                  title="Código e tributação"
                  subtitle="Campos importantes para classificação fiscal e faturamento"
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="Código de barras"
                    value={form.codigoBarras}
                    onChange={(e) => updateField("codigoBarras", e.target.value)}
                  />
                  <Input
                    label="NCM"
                    value={form.ncm}
                    onChange={(e) => updateField("ncm", e.target.value)}
                  />
                  <Input
                    label="CEST"
                    value={form.cest}
                    onChange={(e) => updateField("cest", e.target.value)}
                  />
                  <Select
                    label="Origem da mercadoria"
                    value={form.origem}
                    onChange={(e) => updateField("origem", e.target.value)}
                    options={[
                      { value: "0", label: "0 - Nacional" },
                      { value: "1", label: "1 - Estrangeira importação direta" },
                      { value: "2", label: "2 - Estrangeira adquirida no mercado interno" },
                    ]}
                  />
                  <Input
                    label="CFOP padrão"
                    value={form.cfopPadrao}
                    onChange={(e) => updateField("cfopPadrao", e.target.value)}
                  />
                  <Input
                    label="CST ICMS"
                    value={form.cstIcms}
                    onChange={(e) => updateField("cstIcms", e.target.value)}
                  />
                  <Input
                    label="CSOSN"
                    value={form.csosn}
                    onChange={(e) => updateField("csosn", e.target.value)}
                  />
                  <Input
                    label="CST PIS"
                    value={form.cstPis}
                    onChange={(e) => updateField("cstPis", e.target.value)}
                  />
                  <Input
                    label="CST COFINS"
                    value={form.cstCofins}
                    onChange={(e) => updateField("cstCofins", e.target.value)}
                  />
                  <Input
                    label="Alíquota ICMS (%)"
                    value={form.aliquotaIcms}
                    onChange={(e) => updateField("aliquotaIcms", e.target.value)}
                  />
                  <Input
                    label="Alíquota PIS (%)"
                    value={form.aliquotaPis}
                    onChange={(e) => updateField("aliquotaPis", e.target.value)}
                  />
                  <Input
                    label="Alíquota COFINS (%)"
                    value={form.aliquotaCofins}
                    onChange={(e) => updateField("aliquotaCofins", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-5">
                <SectionTitle
                  icon={Calculator}
                  title="Preço e estoque"
                  subtitle="Informações comerciais para venda e controle interno"
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="Preço de custo"
                    value={form.precoCusto}
                    onChange={(e) => updateField("precoCusto", e.target.value)}
                  />
                  <Input
                    label="Preço de venda"
                    value={form.precoVenda}
                    onChange={(e) => updateField("precoVenda", e.target.value)}
                  />
                  <Input label="Margem estimada (%)" value={margem} readOnly />
                  <Input
                    label="Estoque atual"
                    value={form.estoqueAtual}
                    onChange={(e) => updateField("estoqueAtual", e.target.value)}
                  />
                  <Input
                    label="Estoque mínimo"
                    value={form.estoqueMinimo}
                    onChange={(e) => updateField("estoqueMinimo", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-5">
                <SectionTitle
                  icon={Package}
                  title="Dimensões e peso"
                  subtitle="Dados úteis para frete, logística e nota fiscal"
                />

                <div className="grid gap-4 md:grid-cols-5">
                  <Input
                    label="Peso líquido (kg)"
                    value={form.pesoLiquido}
                    onChange={(e) => updateField("pesoLiquido", e.target.value)}
                  />
                  <Input
                    label="Peso bruto (kg)"
                    value={form.pesoBruto}
                    onChange={(e) => updateField("pesoBruto", e.target.value)}
                  />
                  <Input
                    label="Largura (cm)"
                    value={form.largura}
                    onChange={(e) => updateField("largura", e.target.value)}
                  />
                  <Input
                    label="Altura (cm)"
                    value={form.altura}
                    onChange={(e) => updateField("altura", e.target.value)}
                  />
                  <Input
                    label="Comprimento (cm)"
                    value={form.comprimento}
                    onChange={(e) => updateField("comprimento", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-5">
                <SectionTitle
                  icon={FileText}
                  title="Observações gerais"
                  subtitle="Informações internas e anotações adicionais"
                />

                <Textarea
                  label="Observações"
                  rows={4}
                  value={form.observacoes}
                  onChange={(e) => updateField("observacoes", e.target.value)}
                />

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar produto
                  </Button>
                  <Button variant="outline" onClick={handleNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo cadastro
                  </Button>
                  <Button variant="danger" type="button">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir produto
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

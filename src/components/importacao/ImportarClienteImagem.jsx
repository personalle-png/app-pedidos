import React, { useMemo, useState } from "react";
import { Upload, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

const emptyClient = {
  nome: "",
  telefone: "",
  celular: "",
  email: "",
  profissao: "",
  empresa: "",
  dataNascimento: "",
  observacoes: "",
  cep: "",
  endereco: "",
  numero: "",
  complementoEndereco: "",
  bairro: "",
  cidade: "",
  estado: "",
};

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400 ${className}`}
      {...props}
    />
  );
}

function Label({ children }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function Button({ children, variant = "default", className = "", ...props }) {
  const variantClass =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      : "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function formatDateFromShort(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{2}\/\d{2}$/.test(raw)) {
    const year = new Date().getFullYear();
    const [day, month] = raw.split("/");
    return `${year}-${month}-${day}`;
  }
  return raw;
}

function fakeExtractFromImage() {
  return {
    nome: "Rosana Rodrigues de Oliveira",
    telefone: "",
    celular: "(11) 99493-7899",
    email: "rosanoliveirabr@yahoo.com.br",
    profissao: "",
    empresa: "",
    dataNascimento: formatDateFromShort("03/05"),
    observacoes: "",
    cep: "05628-050",
    endereco: "R Gen Elides de S Queides",
    numero: "28",
    complementoEndereco: "Apto 134",
    bairro: "Jardim Colombo",
    cidade: "São Paulo",
    estado: "São Paulo",
  };
}

export default function ImportarClienteImagem({ onConfirmImport }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState(emptyClient);
  const [processing, setProcessing] = useState(false);
  const [hasExtraction, setHasExtraction] = useState(false);

  const imageName = useMemo(() => imageFile?.name || "Nenhuma imagem selecionada", [imageFile]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleConfirm = async () => {
  try {
    const { error } = await supabase.from("clients").insert([
      {
        nome: form.nome,
        telefone: form.telefone,
        celular: form.celular,
        email: form.email,
        profissao: form.profissao,
        empresa: form.empresa,
        dataNascimento: form.dataNascimento,
        observacoes: form.observacoes,
        cep: form.cep,
        endereco: form.endereco,
        numero: form.numero,
        complementoEndereco: form.complementoEndereco,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
      },
    ]);

    if (error) throw error;

    alert("Cliente importado com sucesso!");

    // limpa tudo depois de salvar
    setForm(emptyClient);
    setImageFile(null);
    setPreviewUrl("");
    setHasExtraction(false);

    // fecha o modal se existir
    if (onConfirmImport) {
      onConfirmImport(form);
    }

  } catch (err) {
    console.error(err);
    alert("Erro ao importar cliente");
  }
};

  const handleReadImage = async () => {
    if (!imageFile) return;

    setProcessing(true);

    try {
      // TODO: substituir por chamada real ao backend/OCR
      await new Promise((resolve) => setTimeout(resolve, 900));
      const extracted = fakeExtractFromImage();
      setForm((current) => ({ ...current, ...extracted }));
      setHasExtraction(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!onConfirmImport) return;
    await onConfirmImport(form);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Importar cliente por imagem</h1>
          <p className="mt-1 text-slate-600">
            Envie um JPG ou PNG, revise os dados lidos e confirme a importação.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Imagem do cadastro</h2>
                <p className="mt-1 text-sm text-slate-500">
                  O sistema lê os dados da imagem e preenche o formulário para revisão.
                </p>
              </div>

              <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-slate-100">
                {previewUrl ? (
                  <img src={previewUrl} alt="Prévia do cadastro" className="max-h-[320px] rounded-2xl object-contain" />
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-slate-400" />
                    <p className="mt-3 font-medium text-slate-700">Clique para selecionar a imagem</p>
                    <p className="mt-1 text-sm text-slate-500">JPG ou PNG</p>
                  </>
                )}
                <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFileChange} />
              </label>

              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Arquivo:</span> {imageName}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleReadImage} disabled={!imageFile || processing}>
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Ler imagem
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl("");
                    setForm(emptyClient);
                    setHasExtraction(false);
                  }}
                >
                  Limpar
                </Button>
              </div>

              {hasExtraction && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Dados lidos. Confira o formulário antes de importar.
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Revisão dos dados</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ajuste qualquer campo antes de confirmar a importação.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label>Nome</Label>
                  <Input value={form.nome} onChange={(e) => updateField("nome", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => updateField("telefone", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Celular</Label>
                  <Input value={form.celular} onChange={(e) => updateField("celular", e.target.value)} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>E-mail</Label>
                  <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Profissão</Label>
                  <Input value={form.profissao} onChange={(e) => updateField("profissao", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Empresa</Label>
                  <Input value={form.empresa} onChange={(e) => updateField("empresa", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Data de nascimento</Label>
                  <Input type="date" value={form.dataNascimento} onChange={(e) => updateField("dataNascimento", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>CEP</Label>
                  <Input value={form.cep} onChange={(e) => updateField("cep", e.target.value)} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={form.endereco} onChange={(e) => updateField("endereco", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Número</Label>
                  <Input value={form.numero} onChange={(e) => updateField("numero", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Complemento do endereço</Label>
                  <Input value={form.complementoEndereco} onChange={(e) => updateField("complementoEndereco", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Bairro</Label>
                  <Input value={form.bairro} onChange={(e) => updateField("bairro", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Cidade</Label>
                  <Input value={form.cidade} onChange={(e) => updateField("cidade", e.target.value)} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>Estado</Label>
                  <Input value={form.estado} onChange={(e) => updateField("estado", e.target.value)} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>Observações</Label>
                  <Textarea rows={4} value={form.observacoes} onChange={(e) => updateField("observacoes", e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" onClick={handleConfirm} disabled={!hasExtraction}>
                  Confirmar importação
                </Button>
                <Button type="button" variant="outline">
                  Salvar como rascunho
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

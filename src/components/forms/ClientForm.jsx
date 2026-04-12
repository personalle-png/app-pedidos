import React, { useEffect, useState } from 'react';
import { emptyClient } from '../../utils/orderHelpers.js';
import { formatCep, formatCpf, formatPhone, isValidCpf } from '../../utils/formatters.js';
import { Button, Input, Label, Textarea } from '../ui/Primitives.jsx';
import { Loader2 } from 'lucide-react';

export default function ClientForm({ onSave, initialValues, onCancel, saving }) {
  const [form, setForm] = useState(initialValues || emptyClient);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [cpfError, setCpfError] = useState('');

  useEffect(() => {
    setForm(initialValues || emptyClient);
    setCepError('');
    setCpfError('');
  }, [initialValues]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const buscarCep = async () => {
    const cepLimpo = String(form.cep || '').replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setCepError('Digite um CEP válido.');
      return;
    }
    try {
      setCepLoading(true);
      setCepError('');
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
        return;
      }
      set((current) => ({
        ...current,
        cep: atCep(cepLimpo),
        endereco: data.logradouro || current.endereco,
        bairro: data.bairro || current.bairro,
        cidade: data.localidade || current.cidade,
        estado: data.uf || current.estado,
        complemento: current.complemento || data.complemento || '',
      }));
    } catch {
      setCepError('Erro ao buscar CEP.');
    } finally {
      setCepLoading(false);
    }
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!isValidCpf(form.cpf)) {
    setCpfError("Digite um CPF válido.");
    return;
  }

  setCpfError("");

  onSave({
    ...form,
    telefone: formatPhone(form.telefone),
    cpf: formatCpf(form.cpf),
    cep: formatCep(form.cep),
  });
};

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">

  {/* Nome */}
  <div className="grid gap-2">
    <Label>Nome</Label>
    <Input
      value={form.nome}
      onChange={(e) => updateField("nome", e.target.value)}
      required
    />
  </div>

  {/* CPF */}
  <div className="grid gap-2">
    <Label>CPF</Label>
    <Input
      value={form.cpf}
      onChange={(e) => {
        updateField("cpf", formatCpf(e.target.value));
        if (cpfError) setCpfError("");
      }}
      placeholder="000.000.000-00"
      maxLength={14}
      required
    />
    {cpfError && <p className="text-sm text-red-600">{cpfError}</p>}
  </div>

  {/* Telefone + Email */}
  <div className="grid gap-4 md:grid-cols-2">
    <div className="grid gap-2">
      <Label>Telefone</Label>
      <Input
        value={form.telefone}
        onChange={(e) => updateField("telefone", formatPhone(e.target.value))}
        placeholder="(00) 00000-0000"
        maxLength={15}
      />
    </div>

    <div className="grid gap-2">
      <Label>Email</Label>
      <Input
        type="email"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
      />
    </div>
  </div>

  {/* CEP + botão */}
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

  {/* Rua */}
  <div className="grid gap-2">
    <Label>Rua</Label>
    <Input
      value={form.endereco}
      onChange={(e) => updateField("endereco", e.target.value)}
    />
  </div>

  {/* Complemento do CEP */}
  <div className="grid gap-2">
    <Label>Complemento do CEP</Label>
    <Input
      value={form.complemento}
      onChange={(e) => updateField("complemento", e.target.value)}
    />
  </div>

  {/* Bairro + Número */}
  <div className="grid gap-4 md:grid-cols-2">
    <div className="grid gap-2">
      <Label>Bairro</Label>
      <Input
        value={form.bairro}
        onChange={(e) => updateField("bairro", e.target.value)}
      />
    </div>

    <div className="grid gap-2">
      <Label>Número</Label>
      <Input
        value={form.numero}
        onChange={(e) => updateField("numero", e.target.value)}
      />
    </div>
  </div>

  {/* Complemento do endereço */}
  <div className="grid gap-2">
    <Label>Complemento do endereço</Label>
    <Input
      value={form.complementoEndereco}
      onChange={(e) => updateField("complementoEndereco", e.target.value)}
      placeholder="Apto, bloco, sala..."
    />
  </div>

  {/* Observações */}
  <div className="grid gap-2">
    <Label>Observações</Label>
    <Textarea
      value={form.observacoes}
      onChange={(e) => updateField("observacoes", e.target.value)}
    />
  </div>

  {/* Botões */}
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

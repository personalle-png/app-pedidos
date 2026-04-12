export const TODAY = new Date('2026-04-11T12:00:00');

export const emptyOrder = {
  pedido: '',
  cliente: '',
  item: '',
  qtd: '',
  situacao: 'Em Aberto',
  cidade: '',
  estado: '',
  dataPedido: '',
  referencia: '',
  dataFesta: '',
  observacoesPedido: '',
  observacoesInternas: '',
  prazoEntrega: '',
  prazoTransporte: "",
  tipoEnvio: "",
  tema: "",
};

export const emptyClient = {
  nome: '',
  cpf: '',
  cep: '',
  endereco: '',
  bairro: '',
  numero: '',
  complemento: '',
  complementoEndereco: '',
  cidade: '',
  estado: '',
  telefone: '',
  email: '',
  observacoes: '',
};

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T12:00:00`);
  return Math.ceil((target.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFestaAlert(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { label: 'Sem data', tone: 'slate' };
  if (days < 0) return { label: 'Festa passou', tone: 'red' };
  if (days <= 3) return { label: 'Muito próxima', tone: 'red' };
  if (days <= 7) return { label: 'Próxima', tone: 'amber' };
  return { label: 'No prazo', tone: 'emerald' };
}

export function getPrazoAlert(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { label: 'Sem prazo', tone: 'slate' };
  if (days < 0) return { label: 'Atrasado', tone: 'red' };
  if (days <= 3) return { label: 'Urgente', tone: 'red' };
  if (days <= 7) return { label: 'Atenção', tone: 'amber' };
  return { label: 'Ok', tone: 'emerald' };
}

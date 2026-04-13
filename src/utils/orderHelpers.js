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

export function calcularDias(data) {
  if (!data) return null;

  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  const alvo = new Date(`${data}T12:00:00`);

  return Math.ceil((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFestaAlert(dataFesta) {
  const dias = calcularDias(dataFesta);

  if (dias === null) {
    return { label: "Sem data", tone: "slate", weight: 6, dias: null, texto: "" };
  }

  if (dias < 0) {
    return { label: "Festa passou", tone: "red", weight: 1, dias, texto: `${dias} dias` };
  }

  if (dias === 0) {
    return { label: "Hoje", tone: "red", weight: 2, dias, texto: "Hoje" };
  }

  if (dias <= 3) {
    return { label: "Muito próxima", tone: "amber", weight: 3, dias, texto: `${dias} dia(s)` };
  }

  if (dias <= 7) {
    return { label: "Próxima", tone: "blue", weight: 4, dias, texto: `${dias} dia(s)` };
  }

  return { label: "No prazo", tone: "emerald", weight: 5, dias, texto: `${dias} dia(s)` };
}

export function getEntregaCombinadaAlert(order) {
  const dias = calcularDias(order?.referencia);

  if (dias === null) {
    return { label: "Sem data", tone: "slate", weight: 6, dias: null, texto: "" };
  }

  if (dias < 0) {
    return { label: "Atrasado", tone: "red", weight: 1, dias, texto: `${dias} dias` };
  }

  if (dias === 0) {
    return { label: "Hoje", tone: "red", weight: 2, dias, texto: "Hoje" };
  }

  if (dias <= 2) {
    return { label: "Muito próximo", tone: "amber", weight: 3, dias, texto: `${dias} dia(s)` };
  }

  if (dias <= 5) {
    return { label: "Próximo", tone: "blue", weight: 4, dias, texto: `${dias} dia(s)` };
  }

  return { label: "No prazo", tone: "emerald", weight: 5, dias, texto: `${dias} dia(s)` };
}

export function getProducaoAlert(prazoEntrega) {
  const dias = calcularDias(prazoEntrega);

  if (dias === null) {
    return { label: "Sem prazo", tone: "slate", weight: 6, dias: null, texto: "" };
  }

  if (dias < 0) {
    return { label: "Produção atrasada", tone: "red", weight: 1, dias, texto: `${dias} dias` };
  }

  if (dias === 0) {
    return { label: "Produzir hoje", tone: "red", weight: 2, dias, texto: "Hoje" };
  }

  if (dias <= 2) {
    return { label: "Urgente", tone: "amber", weight: 3, dias, texto: `${dias} dia(s)` };
  }

  if (dias <= 5) {
    return { label: "Próxima", tone: "blue", weight: 4, dias, texto: `${dias} dia(s)` };
  }

  return { label: "No prazo", tone: "emerald", weight: 5, dias, texto: `${dias} dia(s)` };
}

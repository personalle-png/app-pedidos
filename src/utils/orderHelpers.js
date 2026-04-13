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
  prazoTransporte: '',
  tipoEnvio: '',
  tema: '',
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

// 🔧 Mantive esse helper antigo (caso esteja sendo usado em algum lugar)
export function getPrazoAlert(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { label: 'Sem prazo', tone: 'slate' };
  if (days < 0) return { label: 'Atrasado', tone: 'red' };
  if (days <= 3) return { label: 'Urgente', tone: 'red' };
  if (days <= 7) return { label: 'Atenção', tone: 'amber' };
  return { label: 'Ok', tone: 'emerald' };
}

// 🔥 FUNÇÃO BASE
export function calcularDias(data) {
  if (!data) return null;

  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  const alvo = new Date(`${data}T12:00:00`);

  return Math.ceil((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

// 🎯 FESTA
export function getFestaAlert(dataFesta) {
  const dias = calcularDias(dataFesta);

  if (dias === null) {
    return { label: 'Sem data', tone: 'slate', weight: 6, dias: null, texto: '' };
  }

  if (dias < 0) {
    return { label: 'Festa passou', tone: 'red', weight: 1, dias, texto: `${dias} dias` };
  }

  if (dias === 0) {
    return { label: 'Hoje', tone: 'red', weight: 2, dias, texto: 'Hoje' };
  }

  if (dias <= 3) {
    return { label: 'Muito próxima', tone: 'amber', weight: 3, dias, texto: `${dias} dia(s)` };
  }

  if (dias <= 7) {
    return { label: 'Próxima', tone: 'blue', weight: 4, dias, texto: `${dias} dia(s)` };
  }

  return { label: 'No prazo', tone: 'emerald', weight: 5, dias, texto: `${dias} dia(s)` };
}

// 🚚 ENTREGA COMBINADA
export function getEntregaCombinadaAlert(order) {
  const dias = calcularDias(order?.referencia);

  if (dias === null) {
    return { label: 'Sem data', tone: 'slate', weight: 6, dias: null, texto: '' };
  }

  if (dias < 0) {
    return { label: 'Atrasado', tone: 'red', weight: 1, dias, texto: `${dias} dias` };
  }

  if (dias === 0) {
    return { label: 'Hoje', tone: 'red', weight: 2, dias, texto: 'Hoje' };
  }

  if (dias <= 2) {
    return { label: 'Muito próximo', tone: 'amber', weight: 3, dias, texto: `${dias} dia(s)` };
  }

  if (dias <= 5) {
    return { label: 'Próximo', tone: 'blue', weight: 4, dias, texto: `${dias} dia(s)` };
  }

  return { label: 'No prazo', tone: 'emerald', weight: 5, dias, texto: `${dias} dia(s)` };
}

// 🏭 PRODUÇÃO
export function getProducaoAlert(prazoEntrega) {
  const dias = calcularDias(prazoEntrega);

  if (dias === null) {
    return { label: 'Sem prazo', tone: 'slate', weight: 6, dias: null, texto: '' };
  }

  if (dias < 0) {
    return { label: 'Produção atrasada', tone: 'red', weight: 1, dias, texto: `${dias} dias` };
  }

  if (dias === 0) {
    return { label: 'Produzir hoje', tone: 'red', weight: 2, dias, texto: 'Hoje' };
  }

  if (dias <= 2) {
    return { label: 'Urgente', tone: 'amber', weight: 3, dias, texto: `${dias} dia(s)` };
  }

  if (dias <= 5) {
    return { label: 'Próxima', tone: 'blue', weight: 4, dias, texto: `${dias} dia(s)` };
  }

  return { label: 'No prazo', tone: 'emerald', weight: 5, dias, texto: `${dias} dia(s)` };
}

// 🎨 CORES DOS BADGES
export function badgeTone(tone) {
  if (tone === 'red') return 'bg-red-50 text-red-700 border-red-200';
  if (tone === 'amber') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (tone === 'emerald') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (tone === 'blue') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export function getCardStyleByProducao(producao) {
  if (!producao) return "";

  if (producao.weight === 1) {
    return "bg-red-50 border-red-200";
  }

  if (producao.weight === 2 || producao.weight === 3) {
    return "bg-amber-50 border-amber-200";
  }

  if (producao.weight === 4) {
    return "bg-blue-50 border-blue-200";
  }

  return "bg-white border-slate-200";
}

import React from 'react';
import { Search, Loader2, MessageCircle, PencilLine, Trash2 } from 'lucide-react';
import { Card, Input, SelectField, Button, Badge } from '../ui/Primitives.jsx';
import { formatDate, buildWhatsAppMessage, getWhatsAppLink } from '../../utils/formatters.js';
import {
  daysUntil,
  getFestaAlert,
  getEntregaCombinadaAlert,
  getProducaoAlert,
  getCardStyleByProducao
} from '../../utils/orderHelpers.js';

export default function PedidosTab({
  loading,
  filteredOrders,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  alertFilter,
  setAlertFilter,
  statuses,
  alertas,
  clients,
  setEditingOrder,
  setOrderOpen,
  deleteOrder,
  proximasFestas
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Lista de pedidos</h2>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por cliente, item, cidade ou pedido"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <SelectField value={statusFilter} onChange={setStatusFilter} options={statuses} />
            <SelectField value={alertFilter} onChange={setAlertFilter} options={alertas} />
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando pedidos...
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => {
                  const festa = getFestaAlert(order.dataFesta);
                  const entrega = getEntregaCombinadaAlert(order);
                  const producao = getProducaoAlert(order.prazoEntrega);
                  const cardStyle = getCardStyleByProducao(producao);

                  const client = clients.find(
                    (c) => c.nome?.toLowerCase() === order.cliente?.toLowerCase()
                  );

                  const whatsappLink = client?.telefone
                    ? getWhatsAppLink(
                        client.telefone,
                        buildWhatsAppMessage(
                          order.cliente,
                          order.item,
                          order.pedido,
                          order.dataFesta
                        )
                      )
                    : null;

                  return (
                    <div
                      key={order.id}
                      className={`rounded-3xl border p-4 transition-all ${cardStyle}`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-900">
                                Pedido #{order.pedido}
                              </h3>
                              <Badge tone="slate">{order.situacao}</Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge tone={producao.tone}>
                                Produção: {producao.label}
                                {producao.texto ? ` (${producao.texto})` : ''}
                              </Badge>

                              <Badge tone={entrega.tone}>
                                Entrega: {entrega.label}
                                {entrega.texto ? ` (${entrega.texto})` : ''}
                              </Badge>

                              <Badge tone={festa.tone}>
                                Festa: {festa.label}
                                {festa.texto ? ` (${festa.texto})` : ''}
                              </Badge>
                            </div>
                          </div>

                          <p className="mt-3 font-medium text-slate-900">{order.cliente}</p>
                          <p className="text-base text-slate-700">{order.item}</p>
                          <p className="text-sm text-slate-500">
                            {order.cidade} · {order.estado} · Qtd: {order.qtd}
                          </p>

                          {(order.observacoesPedido || order.observacoesInternas) && (
                            <div className="mt-3 rounded-2xl bg-white/70 p-3 text-sm text-slate-600">
                              {order.observacoesPedido && (
                                <p>
                                  <span className="font-medium text-slate-800">Obs. pedido:</span>{' '}
                                  {order.observacoesPedido}
                                </p>
                              )}

                              {order.observacoesInternas && (
                                <p>
                                  <span className="font-medium text-slate-800">Obs. internas:</span>{' '}
                                  {order.observacoesInternas}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="min-w-[180px] rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Pedido:</span>
                            <strong>{formatDate(order.dataPedido)}</strong>
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-3">
                            <span className="text-slate-500">Entrega:</span>
                            <strong>{formatDate(order.referencia)}</strong>
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-3">
                            <span className="text-slate-500">Produção:</span>
                            <strong>{formatDate(order.prazoEntrega)}</strong>
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-3">
                            <span className="text-slate-500">Festa:</span>
                            <strong>{formatDate(order.dataFesta)}</strong>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-slate-500">Dias festa:</span>
                            <strong>{daysUntil(order.dataFesta) ?? '—'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3">
                        {whatsappLink && (
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setEditingOrder(order);
                            setOrderOpen(true);
                          }}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => deleteOrder(order.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {!filteredOrders.length && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                    Nenhum pedido encontrado.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900">Próximas festas</h2>

            <div className="mt-3 space-y-3">
              {proximasFestas.map((order) => {
                const alerta = getFestaAlert(order.dataFesta);

                return (
                  <div key={order.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{order.cliente}</p>
                        <p className="text-sm text-slate-600">{order.item}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatDate(order.dataFesta)}</p>
                      </div>

                      <div className="text-right">
                        <Badge tone={alerta.tone}>
                          {alerta.label}
                          {alerta.texto ? ` (${alerta.texto})` : ''}
                        </Badge>
                        <p className="mt-2 text-sm text-slate-500">
                          {daysUntil(order.dataFesta)} dia(s)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!proximasFestas.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                  Nenhuma festa próxima.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { Search, Loader2, MessageCircle, PencilLine, Trash2 } from 'lucide-react';
import { Card, Input, SelectField, Button, Badge } from '../ui/Primitives.jsx';
import { formatDate, buildWhatsAppMessage, getWhatsAppLink } from '../../utils/formatters.js';
import {
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
  deleteOrder
}) {
  return (
    <div className="grid gap-6">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Lista de pedidos</h2>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar"
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
                      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <h3 className="font-semibold">
                              Pedido #{order.pedido}
                            </h3>

                            <Badge tone="slate">{order.situacao}</Badge>

                            <Badge tone={producao.tone}>
                              Produção: {producao.label}{' '}
                              {producao.texto && `(${producao.texto})`}
                            </Badge>

                            <Badge tone={entrega.tone}>
                              Entrega: {entrega.label}{' '}
                              {entrega.texto && `(${entrega.texto})`}
                            </Badge>

                            <Badge tone={festa.tone}>
                              Festa: {festa.label}{' '}
                              {festa.texto && `(${festa.texto})`}
                            </Badge>
                          </div>

                          <p className="mt-2 font-medium">{order.cliente}</p>
                          <p className="text-sm text-slate-600">{order.item}</p>
                          <p className="text-sm text-slate-500">
                            {order.cidade} · {order.estado} · Qtd: {order.qtd}
                          </p>
                        </div>

                        <div className="text-sm space-y-1">
                          <p>Pedido: {formatDate(order.dataPedido)}</p>
                          <p>Entrega: {formatDate(order.referencia)}</p>
                          <p>Produção: {formatDate(order.prazoEntrega)}</p>
                          <p>Festa: {formatDate(order.dataFesta)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3">
                        {whatsappLink && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              window.open(whatsappLink, '_blank')
                            }
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                          </Button>
                        )}

                        <Button
                          variant="outline"
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
                  <div className="text-center text-slate-500 p-6">
                    Nenhum pedido encontrado
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

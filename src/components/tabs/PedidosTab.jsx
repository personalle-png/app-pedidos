import React from 'react';
import { Search, Filter, AlertTriangle, Loader2, MessageCircle, PencilLine, Trash2 } from 'lucide-react';
import { Card, Input, SelectField, Button, Badge } from '../ui/Primitives.jsx';
import { formatDate, buildWhatsAppMessage, getWhatsAppLink } from '../../utils/formatters.js';
import { daysUntil, getFestaAlert, getPrazoAlert } from '../../utils/orderHelpers.js';

export default function PedidosTab({ loading, filteredOrders, search, setSearch, statusFilter, setStatusFilter, alertFilter, setAlertFilter, statuses, alertas, clients, setEditingOrder, setOrderOpen, deleteOrder, proximasFestas }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Lista de pedidos</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar por cliente, item, cidade ou pedido" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <SelectField value={statusFilter} onChange={setStatusFilter} options={statuses} />
            <SelectField value={alertFilter} onChange={setAlertFilter} options={alertas} />
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Carregando pedidos...</div>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => {
                  const festa = getFestaAlert(order.dataFesta);
                  const prazo = getPrazoAlert(order.referencia);
                  const client = clients.find((c) => c.nome?.toLowerCase() === order.cliente?.toLowerCase());
                  const whatsappLink = client?.telefone ? getWhatsAppLink(client.telefone, buildWhatsAppMessage(order.cliente, order.item, order.pedido, order.dataFesta)) : null;

                  return (
                    <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">Pedido #{order.pedido}</h3>
                            <Badge tone="slate">{order.situacao}</Badge>
                            <Badge tone={prazo.tone}>{prazo.label}</Badge>
                            <Badge tone={festa.tone}>{festa.label}</Badge>
                          </div>
                          <p className="font-medium text-slate-800">{order.cliente}</p>
                          <p className="text-sm text-slate-600">{order.item}</p>
                          <p className="text-sm text-slate-500">{order.cidade} · {order.estado} · Qtd: {order.qtd}</p>
                          {(order.observacoesPedido || order.observacoesInternas) && (
                            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                              {order.observacoesPedido && <p><span className="font-medium text-slate-800">Obs. pedido:</span> {order.observacoesPedido}</p>}
                              {order.observacoesInternas && <p><span className="font-medium text-slate-800">Obs. internas:</span> {order.observacoesInternas}</p>}
                            </div>
                          )}
                        </div>

                        <div className="grid min-w-[300px] gap-2 text-sm text-slate-600">
                          <div className="flex items-center justify-between gap-3"><span>Data do pedido</span><strong>{formatDate(order.dataPedido)}</strong></div>
                          <div className="flex items-center justify-between gap-3"><span>Referência</span><strong>{formatDate(order.referencia)}</strong></div>
                          <div className="flex items-center justify-between gap-3"><span>Data da festa</span><strong>{formatDate(order.dataFesta)}</strong></div>
                          <div className="flex items-center justify-between gap-3"><span>Dias até a festa</span><strong>{daysUntil(order.dataFesta) ?? '—'}</strong></div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {whatsappLink && <Button variant="outline" className="rounded-xl" onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>}
                            <Button variant="outline" className="rounded-xl" onClick={() => { setEditingOrder(order); setOrderOpen(true); }}><PencilLine className="mr-2 h-4 w-4" /> Editar</Button>
                            <Button variant="outline" className="rounded-xl" onClick={() => deleteOrder(order.id)}><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!filteredOrders.length && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Nenhum pedido encontrado.</div>}
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
                        <Badge tone={alerta.tone}>{alerta.label}</Badge>
                        <p className="mt-2 text-sm text-slate-500">{daysUntil(order.dataFesta)} dia(s)</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-900">Status do sistema</h2>
            <div className="mt-3 space-y-2">
              <p>• Banco conectado ao Supabase</p>
              <p>• Variáveis via Vercel (VITE_SUPABASE_*)</p>
              <p>• CRUD completo de pedidos e clientes</p>
              <p>• Botão de WhatsApp com mensagem pronta</p>
              <p>• Busca de CEP integrada ao ViaCEP</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

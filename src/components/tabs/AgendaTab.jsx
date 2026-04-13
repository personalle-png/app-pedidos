import React, { useMemo } from "react";
import { Badge, Button, Card } from "../ui/Primitives.jsx";
import {
  getFestaAlert,
  getEntregaCombinadaAlert,
  getProducaoAlert,
  getCardStyleByProducao,
} from "../../utils/orderHelpers.js";
import { formatDate } from "../../utils/formatters.js";
import { PencilLine } from "lucide-react";

export default function AgendaTab({ orders, setEditingOrder, setOrderOpen }) {
  const agendaOrdenada = useMemo(() => {
    return [...(orders || [])].sort((a, b) => {
      const pa = getProducaoAlert(a.prazoEntrega).weight;
      const pb = getProducaoAlert(b.prazoEntrega).weight;
      if (pa !== pb) return pa - pb;

      const ea = getEntregaCombinadaAlert(a).weight;
      const eb = getEntregaCombinadaAlert(b).weight;
      if (ea !== eb) return ea - eb;

      const fa = getFestaAlert(a.dataFesta).weight;
      const fb = getFestaAlert(b.dataFesta).weight;
      if (fa !== fb) return fa - fb;

      const da = a.prazoEntrega ? new Date(a.prazoEntrega).getTime() : Infinity;
      const db = b.prazoEntrega ? new Date(b.prazoEntrega).getTime() : Infinity;

      return da - db;
    });
  }, [orders]);

  return (
    <Card>
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Agenda de prioridade</h2>
          <p className="mt-1 text-sm text-slate-500">
            Organizada por produção, entrega combinada e data da festa.
          </p>
        </div>

        <div className="grid gap-4">
          {agendaOrdenada.map((order) => {
            const producao = getProducaoAlert(order.prazoEntrega);
            const entrega = getEntregaCombinadaAlert(order);
            const festa = getFestaAlert(order.dataFesta);
            const cardStyle = getCardStyleByProducao(producao);

            return (
              <div
                key={order.id}
                className={`rounded-3xl border p-4 transition-all ${cardStyle}`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Pedido #{order.pedido}
                      </h3>
                      <Badge tone="slate">{order.situacao}</Badge>
                    </div>

                    <p className="mt-2 font-medium text-slate-900">{order.cliente}</p>
                    <p className="text-slate-700">{order.item}</p>
                    {order.tema && (
                      <p className="text-sm text-slate-500">Tema: {order.tema}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={producao.tone}>
                        Produção: {producao.label}
                        {producao.texto ? ` (${producao.texto})` : ""}
                      </Badge>

                      <Badge tone={entrega.tone}>
                        Entrega: {entrega.label}
                        {entrega.texto ? ` (${entrega.texto})` : ""}
                      </Badge>

                      <Badge tone={festa.tone}>
                        Festa: {festa.label}
                        {festa.texto ? ` (${festa.texto})` : ""}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid min-w-[230px] gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Pedido:</span>
                      <strong>{formatDate(order.dataPedido)}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Produção:</span>
                      <strong>{formatDate(order.prazoEntrega)}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Entrega:</span>
                      <strong>{formatDate(order.referencia)}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Festa:</span>
                      <strong>{formatDate(order.dataFesta)}</strong>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => {
                          setEditingOrder(order);
                          setOrderOpen(true);
                        }}
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Abrir pedido
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!agendaOrdenada.length && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Nenhum pedido para exibir.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

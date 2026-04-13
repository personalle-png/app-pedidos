import React, { useMemo } from "react";
import { Card, Badge, Button } from "../ui/Primitives.jsx";
import {
  getFestaAlert,
  getEntregaCombinadaAlert,
  getProducaoAlert,
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
            Gestão por produção, entrega combinada e data da festa.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="px-3 py-3 font-medium">Pedido</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Item</th>
                <th className="px-3 py-3 font-medium">Situação</th>
                <th className="px-3 py-3 font-medium">Produção</th>
                <th className="px-3 py-3 font-medium">Entrega</th>
                <th className="px-3 py-3 font-medium">Festa</th>
                <th className="px-3 py-3 font-medium">Data pedido</th>
                <th className="px-3 py-3 font-medium">Prazo produção</th>
                <th className="px-3 py-3 font-medium">Data combinada</th>
                <th className="px-3 py-3 font-medium">Data festa</th>
                <th className="px-3 py-3 font-medium">Ação</th>
              </tr>
            </thead>

            <tbody>
              {agendaOrdenada.map((order) => {
                const producao = getProducaoAlert(order.prazoEntrega);
                const entrega = getEntregaCombinadaAlert(order);
                const festa = getFestaAlert(order.dataFesta);

                return (
                  <tr key={order.id} className="border-b last:border-0 align-top">
                    <td className="px-3 py-3 font-medium text-slate-800">
                      #{order.pedido}
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{order.cliente}</div>
                      {order.tema && (
                        <div className="text-xs text-slate-500">Tema: {order.tema}</div>
                      )}
                    </td>

                    <td className="px-3 py-3 text-slate-700">{order.item}</td>

                    <td className="px-3 py-3">
                      <Badge tone="slate">{order.situacao}</Badge>
                    </td>

                    <td className="px-3 py-3">
                      <Badge tone={producao.tone}>
                        {producao.label}
                        {producao.texto ? ` (${producao.texto})` : ""}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">
                      <Badge tone={entrega.tone}>
                        {entrega.label}
                        {entrega.texto ? ` (${entrega.texto})` : ""}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">
                      <Badge tone={festa.tone}>
                        {festa.label}
                        {festa.texto ? ` (${festa.texto})` : ""}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">{formatDate(order.dataPedido)}</td>
                    <td className="px-3 py-3">{formatDate(order.prazoEntrega)}</td>
                    <td className="px-3 py-3">{formatDate(order.referencia)}</td>
                    <td className="px-3 py-3">{formatDate(order.dataFesta)}</td>

                    <td className="px-3 py-3">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          setEditingOrder(order);
                          setOrderOpen(true);
                        }}
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Abrir
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

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

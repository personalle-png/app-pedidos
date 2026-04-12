import React from 'react';
import { Card, Badge } from '../ui/Primitives.jsx';
import { formatDate } from '../../utils/formatters.js';
import { getFestaAlert } from '../../utils/orderHelpers.js';

export default function AgendaTab({ orders }) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Agenda de prioridade</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="px-3 py-3 font-medium">Pedido</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Item</th>
                <th className="px-3 py-3 font-medium">Referência</th>
                <th className="px-3 py-3 font-medium">Data da festa</th>
                <th className="px-3 py-3 font-medium">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {[...orders].sort((a, b) => {
                const da = a.dataFesta ? new Date(a.dataFesta).getTime() : Infinity;
                const db = b.dataFesta ? new Date(b.dataFesta).getTime() : Infinity;
                return da - db;
              }).map((order) => {
                const alerta = getFestaAlert(order.dataFesta);
                return (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-3 py-3 font-medium text-slate-800">#{order.pedido}</td>
                    <td className="px-3 py-3">{order.cliente}</td>
                    <td className="px-3 py-3">{order.item}</td>
                    <td className="px-3 py-3">{formatDate(order.referencia)}</td>
                    <td className="px-3 py-3">{formatDate(order.dataFesta)}</td>
                    <td className="px-3 py-3"><Badge tone={alerta.tone}>{alerta.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

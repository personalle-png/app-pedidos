import React, { useMemo, useState } from "react";
import { Card, Badge, Button } from "../ui/Primitives.jsx";
import {
  getFestaAlert,
  getEntregaCombinadaAlert,
  getProducaoAlert,
} from "../../utils/orderHelpers.js";
import { formatDate } from "../../utils/formatters.js";
import { PencilLine } from "lucide-react";

function getRowStyle(producao, entrega, festa) {
  const worst = Math.min(
    producao?.weight ?? 99,
    entrega?.weight ?? 99,
    festa?.weight ?? 99
  );

  if (worst === 1) return "bg-red-50";
  if (worst === 2 || worst === 3) return "bg-amber-50";
  if (worst === 4) return "bg-blue-50";
  return "";
}

function isAtrasado(producao, entrega, festa) {
  return (
    producao?.label === "Produção atrasada" ||
    entrega?.label === "Atrasado" ||
    festa?.label === "Festa passou"
  );
}

function isUrgente(producao, entrega, festa) {
  return (
    isAtrasado(producao, entrega, festa) ||
    producao?.label === "Produzir hoje" ||
    producao?.label === "Urgente" ||
    entrega?.label === "Hoje" ||
    entrega?.label === "Muito próximo" ||
    festa?.label === "Hoje" ||
    festa?.label === "Muito próxima"
  );
}

function isNoPrazo(producao, entrega, festa) {
  return (
    !isAtrasado(producao, entrega, festa) &&
    !isUrgente(producao, entrega, festa)
  );
}

function CounterCard({ title, value, tone }) {
  const styles = {
    red: "bg-red-50 border-red-200 text-red-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles[tone] || styles.slate}`}>
      <p className="text-sm">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function AgendaTab({ orders, setEditingOrder, setOrderOpen }) {
  const [filtroAgenda, setFiltroAgenda] = useState("Todos");

  const pedidosComStatus = useMemo(() => {
    return (orders || []).map((order) => {
      const producao = getProducaoAlert(order.prazoEntrega);
      const entrega = getEntregaCombinadaAlert(order);
      const festa = getFestaAlert(order.dataFesta);

      return {
        ...order,
        producao,
        entrega,
        festa,
      };
    });
  }, [orders]);

  const contadores = useMemo(() => {
    return {
      total: pedidosComStatus.length,
      atrasados: pedidosComStatus.filter((order) =>
        isAtrasado(order.producao, order.entrega, order.festa)
      ).length,
      urgentes: pedidosComStatus.filter((order) =>
        isUrgente(order.producao, order.entrega, order.festa)
      ).length,
      noPrazo: pedidosComStatus.filter((order) =>
        isNoPrazo(order.producao, order.entrega, order.festa)
      ).length,
    };
  }, [pedidosComStatus]);

  const agendaOrdenada = useMemo(() => {
    return [...pedidosComStatus]
      .filter((order) => {
        if (filtroAgenda === "Atrasados") {
          return isAtrasado(order.producao, order.entrega, order.festa);
        }

        if (filtroAgenda === "Urgentes") {
          return isUrgente(order.producao, order.entrega, order.festa);
        }

        if (filtroAgenda === "No prazo") {
          return isNoPrazo(order.producao, order.entrega, order.festa);
        }

        return true;
      })
      .sort((a, b) => {
        const pa = a.producao.weight;
        const pb = b.producao.weight;
        if (pa !== pb) return pa - pb;

        const ea = a.entrega.weight;
        const eb = b.entrega.weight;
        if (ea !== eb) return ea - eb;

        const fa = a.festa.weight;
        const fb = b.festa.weight;
        if (fa !== fb) return fa - fb;

        const da = a.prazoEntrega ? new Date(a.prazoEntrega).getTime() : Infinity;
        const db = b.prazoEntrega ? new Date(b.prazoEntrega).getTime() : Infinity;

        return da - db;
      });
  }, [pedidosComStatus, filtroAgenda]);

  return (
    <Card>
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Agenda de prioridade</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gestão por produção, entrega combinada e data da festa.
          </p>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <CounterCard title="Total" value={contadores.total} tone="slate" />
          <CounterCard title="Atrasados" value={contadores.atrasados} tone="red" />
          <CounterCard title="Urgentes" value={contadores.urgentes} tone="amber" />
          <CounterCard title="No prazo" value={contadores.noPrazo} tone="emerald" />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {["Todos", "Urgentes", "Atrasados", "No prazo"].map((item) => (
            <button
              key={item}
              onClick={() => setFiltroAgenda(item)}
              className={`rounded-xl px-3 py-2 text-sm font-medium border ${
                filtroAgenda === item
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
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
                const rowStyle = getRowStyle(order.producao, order.entrega, order.festa);

                return (
                  <tr
                    key={order.id}
                    className={`border-b last:border-0 align-top ${rowStyle}`}
                  >
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
                      <Badge tone={order.producao.tone}>
                        {order.producao.label}
                        {order.producao.texto ? ` (${order.producao.texto})` : ""}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">
                      <Badge tone={order.entrega.tone}>
                        {order.entrega.label}
                        {order.entrega.texto ? ` (${order.entrega.texto})` : ""}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">
                      <Badge tone={order.festa.tone}>
                        {order.festa.label}
                        {order.festa.texto ? ` (${order.festa.texto})` : ""}
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

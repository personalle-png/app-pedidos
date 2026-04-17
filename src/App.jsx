import React, { useEffect, useMemo, useState } from 'react';
import { Search, CalendarDays, Package, AlertTriangle, CheckCircle2, Plus, Users, RefreshCcw, Database } from 'lucide-react';
import { supabase } from './lib/supabase.js';
import { Card, Button } from './components/ui/Primitives.jsx';
import Modal from './components/layout/Modal.jsx';
import StatCard from './components/common/StatCard.jsx';
import ClientForm from './components/forms/ClientForm.jsx';
import OrderForm from './components/forms/OrderForm.jsx';
import PedidosTab from './components/tabs/PedidosTab.jsx';
import AgendaTab from './components/tabs/AgendaTab.jsx';
import ClientesTab from './components/tabs/ClientesTab.jsx';
import CadastroProdutosFiscal from "./components/produtos/CadastroProdutosFiscal";
import {
  daysUntil,
  emptyClient,
  emptyOrder,
  getFestaAlert,
  getEntregaCombinadaAlert,
  getProducaoAlert,
} from './utils/orderHelpers.js';
import SettingsForm from "./components/forms/SettingsForm.jsx";
import ProductForm from "./components/forms/ProductForm.jsx";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [alertFilter, setAlertFilter] = useState('Todos');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pedidos');
  const [themes, setThemes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [products, setProducts] = useState([]);
  const [productOpen, setProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const saveProductIfNeeded = async (item) => {
    const nome = String(item || "").trim();
    if (!nome) return;

    const nomePadronizado =
      nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

    const { error } = await supabase
      .from("products")
      .upsert(
        {
          nome: nomePadronizado,
          ativo: true,
        },
        { onConflict: "nome" }
      );

    if (error) throw error;
  };

  const saveProduct = async (formData) => {
    setSavingProduct(true);
    setError("");

    try {
      const payload = {
        nome: String(formData.nome || "").trim(),
        ativo: formData.ativo ?? true,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert(payload);

        if (error) throw error;
      }

      setProductOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao salvar produto.");
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao excluir produto.");
    }
  };

  const saveSettings = async (formData) => {
    setSavingSettings(true);
    setError("");

    try {
      if (settings?.id) {
        const { error } = await supabase
          .from("settings")
          .update({
            diasPadraoProducao: Number(formData.diasPadraoProducao || 0),
          })
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("settings")
          .insert({
            diasPadraoProducao: Number(formData.diasPadraoProducao || 0),
          });

        if (error) throw error;
      }

      setSettingsOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao salvar configurações.");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveThemeIfNeeded = async (tema) => {
    const nome = String(tema || "").trim();
    if (!nome) return;

    const nomePadronizado =
      nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

    const { error } = await supabase
      .from("themes")
      .upsert({ nome: nomePadronizado }, { onConflict: "nome" });

    if (error) throw error;
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        { data: ordersData, error: ordersError },
        { data: clientsData, error: clientsError },
        { data: themesData, error: themesError },
        { data: settingsData, error: settingsError },
        { data: holidaysData, error: holidaysError },
        { data: productsData, error: productsError },
      ] = await Promise.all([
        supabase.from("orders").select("*").order("pedido", { ascending: true }),
        supabase.from("clients").select("*").order("nome", { ascending: true }),
        supabase.from("themes").select("*").order("nome", { ascending: true }),
        supabase.from("settings").select("*").limit(1).single(),
        supabase.from("holidays").select("*"),
        supabase.from("products").select("*").eq("ativo", true).order("nome", { ascending: true }),
      ]);

      if (ordersError) throw ordersError;
      if (clientsError) throw clientsError;
      if (themesError) throw themesError;
      if (settingsError) throw settingsError;
      if (holidaysError) throw holidaysError;
      if (productsError) throw productsError;

      setOrders(ordersData || []);
      setClients(clientsData || []);
      setThemes(themesData || []);
      setSettings(settingsData || null);
      setHolidays(holidaysData || []);
      setProducts(productsData || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados do Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveOrder = async (formData) => {
    setSavingOrder(true);
    setError("");

    try {
      await saveThemeIfNeeded(formData.tema);
      await saveProductIfNeeded(formData.item);

      const payload = {
        cliente: formData.cliente,
        item: formData.item,
        tema: formData.tema || "",
        qtd: Number(formData.qtd || 0),
        situacao: formData.situacao,
        cidade: formData.cidade,
        estado: formData.estado,
        dataPedido: formData.dataPedido || null,
        referencia: formData.referencia || null,
        dataFesta: formData.dataFesta || null,
        observacoesPedido: formData.observacoesPedido || "",
        prazoEntrega: formData.prazoEntrega || null,
        prazoTransporte: Number(formData.prazoTransporte || 0),
        tipoEnvio: formData.tipoEnvio || "",
      };

      if (editingOrder) {
        const { error } = await supabase
          .from("orders")
          .update({
            ...payload,
            pedido: Number(formData.pedido),
          })
          .eq("id", editingOrder.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("orders")
          .insert(payload);

        if (error) throw error;
      }

      setOrderOpen(false);
      setEditingOrder(null);
      await loadData();
    } catch (err) {
      console.error("Erro ao salvar pedido:", err);
      setError(err.message || "Erro ao salvar pedido.");
    } finally {
      setSavingOrder(false);
    }
  };

  const saveClient = async (formData) => {
    setSavingClient(true);
    setError('');

    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.created_at;

      if (editingClient) {
        const { error } = await supabase.from('clients').update(payload).eq('id', editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clients').insert(payload);
        if (error) throw error;
      }

      setClientOpen(false);
      setEditingClient(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao salvar cliente.');
    } finally {
      setSavingClient(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao excluir pedido.');
    }
  };

  const deleteClient = async (id) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao excluir cliente.');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const text = [
          order.cliente,
          order.item,
          order.cidade,
          order.estado,
          String(order.pedido),
        ]
          .join(" ")
          .toLowerCase();

        const festa = getFestaAlert(order.dataFesta).label;

        return (
          text.includes(search.toLowerCase()) &&
          (statusFilter === "Todos" || order.situacao === statusFilter) &&
          (alertFilter === "Todos" || festa === alertFilter)
        );
      })
      .sort((a, b) => {
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
  }, [orders, search, statusFilter, alertFilter]);

  const filteredClients = useMemo(() => clients.filter((client) => {
    const text = [client.nome, client.cpf, client.cep, client.endereco, client.bairro, client.numero, client.complemento, client.complementoEndereco, client.cidade, client.estado, client.telefone, client.email].join(' ').toLowerCase();
    return text.includes(clientSearch.toLowerCase());
  }), [clients, clientSearch]);

  const stats = useMemo(() => ({
    total: orders.length,
    emAndamento: orders.filter((o) => o.situacao === 'Em Andamento').length,
    emAberto: orders.filter((o) => o.situacao === 'Em Aberto').length,
    festasProximas: orders.filter((o) => { const d = daysUntil(o.dataFesta); return d !== null && d >= 0 && d <= 7; }).length,
    totalClientes: clients.length,
  }), [orders, clients]);

  const proximasFestas = useMemo(() => [...orders].filter((o) => o.dataFesta).sort((a, b) => new Date(a.dataFesta) - new Date(b.dataFesta)).slice(0, 6), [orders]);

  const statuses = ['Todos', 'Em Aberto', 'Em Andamento', 'Arte enviada', 'Finalizado'];
  const alertas = ['Todos', 'Muito próxima', 'Próxima', 'No prazo', 'Festa passou', 'Sem data'];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sistema de Pedidos</h1>
            <p className="mt-1 text-slate-600">Versão organizada com Supabase, clientes, pedidos, agenda e contato rápido.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={loadData}><RefreshCcw className="mr-2 h-4 w-4" /> Atualizar</Button>
            <Button className="rounded-2xl" onClick={() => { setEditingOrder(null); setOrderOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo pedido</Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => { setEditingClient(null); setClientOpen(true); }}><Users className="mr-2 h-4 w-4" /> Novo cliente</Button>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        <Card>
          <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Prazo de produção padrão</p>
              <p className="text-2xl font-semibold text-slate-900">
                {settings?.diasPadraoProducao ?? 0} dia(s) útil(eis)
              </p>
            </div>

            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setSettingsOpen(true)}
            >
              Alterar
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total de pedidos" value={stats.total} subtitle="Todos os pedidos" icon={Package} />
          <StatCard title="Em andamento" value={stats.emAndamento} subtitle="Produção ativa" icon={CheckCircle2} />
          <StatCard title="Em aberto" value={stats.emAberto} subtitle="Aguardando início" icon={CalendarDays} />
          <StatCard title="Festas próximas" value={stats.festasProximas} subtitle="Até 7 dias" icon={AlertTriangle} />
          <StatCard title="Clientes" value={stats.totalClientes} subtitle="Base cadastrada" icon={Database} />
        </div>

        <div className="grid w-full grid-cols-3 rounded-2xl bg-white p-1 shadow-sm md:w-[420px]">
          {[['pedidos', 'Pedidos'], ['agenda', 'Agenda'], ['clientes', 'Clientes']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`rounded-xl px-3 py-2 text-sm font-medium ${tab === key ? 'bg-slate-900 text-white' : 'text-slate-700'}`}>{label}</button>
          ))}
        </div>

        {tab === 'pedidos' && <PedidosTab loading={loading} filteredOrders={filteredOrders} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} alertFilter={alertFilter} setAlertFilter={setAlertFilter} statuses={statuses} alertas={alertas} clients={clients} setEditingOrder={setEditingOrder} setOrderOpen={setOrderOpen} deleteOrder={deleteOrder} proximasFestas={proximasFestas} />}
        {tab === 'agenda' && (
  <AgendaTab
    orders={orders}
    setEditingOrder={setEditingOrder}
    setOrderOpen={setOrderOpen}
  />
)}
        {tab === 'clientes' && <ClientesTab clientSearch={clientSearch} setClientSearch={setClientSearch} filteredClients={filteredClients} orders={orders} setEditingClient={setEditingClient} setClientOpen={setClientOpen} deleteClient={deleteClient} clients={clients} />}
      </div>

      <Modal open={orderOpen} title={editingOrder ? 'Editar pedido' : 'Novo pedido'} onClose={() => setOrderOpen(false)}>
        <OrderForm
          onSave={saveOrder}
          initialValues={editingOrder || emptyOrder}
          onCancel={() => setOrderOpen(false)}
          clients={clients}
          themes={themes}
          settings={settings}
          saving={savingOrder}
          holidays={holidays}
          products={products}
        />
      </Modal>

      <Modal
        open={settingsOpen}
        title="Alterar prazo de produção padrão"
        onClose={() => setSettingsOpen(false)}
      >
        <SettingsForm
          settings={settings}
          onSave={saveSettings}
          saving={savingSettings}
          onCancel={() => setSettingsOpen(false)}
        />
      </Modal>

      <Modal open={clientOpen} title={editingClient ? 'Editar cliente' : 'Novo cliente'} onClose={() => setClientOpen(false)}>
        <ClientForm onSave={saveClient} initialValues={editingClient || emptyClient} onCancel={() => setClientOpen(false)} saving={savingClient} />
      </Modal>

      <Modal
        open={productOpen}
        title={editingProduct ? "Editar produto" : "Novo produto"}
        onClose={() => setProductOpen(false)}
      >
        <ProductForm
          onSave={saveProduct}
          initialValues={editingProduct || { nome: "", ativo: true }}
          onCancel={() => setProductOpen(false)}
          saving={savingProduct}
        />
      </Modal>
    </div>
  );
}

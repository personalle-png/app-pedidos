import React, { useState } from "react";
import { MessageCircle, PencilLine, Trash2, Search } from "lucide-react";
import { Card, Input, Button } from "../ui/Primitives.jsx";
import { getWhatsAppLink } from "../../utils/formatters.js";
import ImportarClienteImagem from "../importacao/ImportarClienteImagem.jsx";

export default function ClientesTab({
  clientSearch,
  setClientSearch,
  filteredClients,
  orders,
  setEditingClient,
  setClientOpen,
  deleteClient,
  clients,
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(clientSearch || "");
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const handleSearch = () => {
    setClientSearch(searchInput.trim());
    setSearchSubmitted(true);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setClientSearch("");
    setSearchSubmitted(false);
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <Card>
          <div className="p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Cadastro de clientes
              </h2>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                  📷 Importar cliente
                </Button>

                <Button onClick={() => setClientOpen(true)}>
                  + Novo cliente
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <Input
                placeholder="Buscar por nome, CPF, CEP, endereço, cidade, telefone ou e-mail"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <div className="flex gap-2">
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Pesquisar
                </Button>

                <Button variant="outline" onClick={handleClearSearch}>
                  Limpar
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {!searchSubmitted ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                  Digite algo e clique em pesquisar para mostrar os clientes.
                </div>
              ) : filteredClients.length ? (
                filteredClients.map((client) => {
                  const pedidosDoCliente = orders.filter(
                    (order) => order.cliente?.toLowerCase() === client.nome?.toLowerCase()
                  );

                  const whatsappLink = client.telefone
                    ? getWhatsAppLink(client.telefone, `Olá, ${client.nome}! 😊`)
                    : null;

                  return (
                    <div
                      key={client.id}
                      className="rounded-3xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {client.nome}
                          </h3>

                          <p className="text-sm text-slate-600">
                            {client.cidade} · {client.estado}
                          </p>

                          {client.cpf && (
                            <p className="text-sm text-slate-600">CPF: {client.cpf}</p>
                          )}

                          {client.cep && (
                            <p className="text-sm text-slate-600">CEP: {client.cep}</p>
                          )}

                          {client.endereco && (
                            <p className="text-sm text-slate-600">
                              {client.endereco}
                              {client.numero ? `, ${client.numero}` : ""}
                            </p>
                          )}

                          {client.complementoEndereco && (
                            <p className="text-sm text-slate-600">
                              Complemento do endereço: {client.complementoEndereco}
                            </p>
                          )}

                          {client.bairro && (
                            <p className="text-sm text-slate-600">
                              Bairro: {client.bairro}
                            </p>
                          )}

                          {client.complemento && (
                            <p className="text-sm text-slate-600">
                              Complemento: {client.complemento}
                            </p>
                          )}

                          {client.telefone && (
                            <p className="text-sm text-slate-600">
                              Telefone: {client.telefone}
                            </p>
                          )}

                          {client.email && (
                            <p className="text-sm text-slate-600">
                              E-mail: {client.email}
                            </p>
                          )}

                          {client.observacoes && (
                            <p className="text-sm text-slate-500">
                              {client.observacoes}
                            </p>
                          )}
                        </div>

                        <div className="min-w-[220px] space-y-2">
                          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                            <p>
                              <span className="font-medium text-slate-800">
                                Pedidos vinculados:
                              </span>{" "}
                              {pedidosDoCliente.length}
                            </p>

                            {pedidosDoCliente.slice(0, 3).map((pedido) => (
                              <p key={pedido.id} className="mt-1">
                                #{pedido.pedido} · {pedido.item}
                              </p>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {whatsappLink && (
                              <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() =>
                                  window.open(whatsappLink, "_blank", "noopener,noreferrer")
                                }
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => {
                                setEditingClient(client);
                                setClientOpen(true);
                              }}
                            >
                              <PencilLine className="mr-2 h-4 w-4" />
                              Editar
                            </Button>

                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => deleteClient(client.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                  Nenhum cliente encontrado.
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-2xl font-semibold text-slate-900">
                {clients.length}
              </p>
              <p>Total de clientes cadastrados</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Integração com pedidos</p>
              <p className="mt-1">
                Ao cadastrar um pedido, você pode selecionar um cliente e
                reaproveitar dados básicos.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Pronto para produção</p>
              <p className="mt-1">
                Agora a base já está preparada para deploy no Vercel com Supabase real.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-3xl bg-white">
            <ImportarClienteImagem
              onConfirmImport={(data) => {
                console.log("Cliente importado:", data);
                setImportOpen(false);
              }}
            />

            <div className="flex justify-end p-4">
              <Button variant="outline" onClick={() => setImportOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

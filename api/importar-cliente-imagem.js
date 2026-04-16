import OpenAI from "openai";

function isValidCpf(cpf) {
  const clean = String(cpf || "").replace(/\D/g, "");

  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(clean[i]) * (10 - i);
  }

  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== Number(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(clean[i]) * (11 - i);
  }

  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;

  return check2 === Number(clean[10]);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function buildPrompt(tipo) {
  if (tipo === "elo7") {
    return (
      "Você receberá 2 imagens do mesmo cliente importado do Elo7.\n\n" +

      "PASSO 1:\n" +
      "Leia cuidadosamente a IMAGEM 1.\n" +
      "Procure especificamente pelo campo rotulado como 'CPF do comprador'.\n" +
      "Extraia apenas o número que estiver ao lado desse rótulo.\n" +
      "Não use outros números da tela como CPF.\n" +
      "Se houver dúvida, devolva string vazia em vez de inventar.\n\n" +

      "PASSO 2:\n" +
      "Leia a IMAGEM 2 para complementar os demais dados.\n\n" +

      "REGRAS IMPORTANTES:\n" +
      "- Sempre priorize a IMAGEM 1.\n" +
      "- O CPF deve vir somente do campo 'CPF do comprador'.\n" +
      "- Ignore identificador, CEP, telefone, códigos de pedido e qualquer outro número.\n" +
      "- Extraia somente os campos: nome, cpf, telefone, email, observacoes, cep, endereco, numero, complemento, complementoEndereco, bairro, cidade, estado.\n" +
      "- Não invente dados. Se não souber, devolva string vazia."
    );
  }

  return (
    "Você receberá 1 imagem de cliente importado da Loja Integrada.\n" +
    "Extraia somente os campos: nome, cpf, telefone, email, observacoes, cep, endereco, numero, complemento, complementoEndereco, bairro, cidade, estado.\n" +
    "O CPF deve vir somente do campo explicitamente rotulado como CPF.\n" +
    "Não invente dados. Se não souber, devolva string vazia."
  );
}

function emptyResult() {
  return {
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    observacoes: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    complementoEndereco: "",
    bairro: "",
    cidade: "",
    estado: ""
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { tipo, images } = req.body || {};

    if (!tipo || !Array.isArray(images) || !images.length) {
      return res.status(400).json({ error: "Dados de importação inválidos." });
    }

    const content = [
      {
        type: "input_text",
        text: buildPrompt(tipo),
      },
      ...images.map((image) => ({
        type: "input_image",
        image_url: image,
      })),
    ];

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        nome: { type: "string" },
        cpf: { type: "string" },
        telefone: { type: "string" },
        email: { type: "string" },
        observacoes: { type: "string" },
        cep: { type: "string" },
        endereco: { type: "string" },
        numero: { type: "string" },
        complemento: { type: "string" },
        complementoEndereco: { type: "string" },
        bairro: { type: "string" },
        cidade: { type: "string" },
        estado: { type: "string" }
      },
      required: [
        "nome",
        "cpf",
        "telefone",
        "email",
        "observacoes",
        "cep",
        "endereco",
        "numero",
        "complemento",
        "complementoEndereco",
        "bairro",
        "cidade",
        "estado"
      ]
    };

    const response = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: "user",
          content,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "cliente_importacao",
          strict: true,
          schema,
        },
      },
    });

    const parsed = JSON.parse(response.output_text || JSON.stringify(emptyResult()));

    parsed.cpf = parsed.cpf?.replace(/\D/g, "") || "";

    if (!isValidCpf(parsed.cpf)) {
      parsed.cpf = "";
    }

    return res.status(200).json({
      ...emptyResult(),
      ...parsed
    });
  } catch (error) {
    console.error("ERRO ROTA IMPORTAR CLIENTE:", error);

    return res.status(500).json({
      error: error?.message || "Erro interno na função.",
    });
  }
}

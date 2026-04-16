import OpenAI from "openai";

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
      "Procure por um CPF no formato 000.000.000-00 ou apenas números.\n" +
      "Se encontrar um CPF na IMAGEM 1, extraia e preencha o campo cpf.\n\n" +

      "PASSO 2:\n" +
      "Leia a IMAGEM 2 para complementar os dados restantes.\n\n" +

      "REGRAS IMPORTANTES:\n" +
      "- Sempre priorize os dados da IMAGEM 1.\n" +
      "- Nunca deixe o campo cpf vazio se houver um número com padrão de CPF.\n" +
      "- Se encontrar um número com 11 dígitos, considere como CPF.\n" +
      "- Não invente dados.\n\n" +

      "Extraia somente os campos:\n" +
      "nome, cpf, telefone, email, observacoes, cep, endereco, numero, complemento, complementoEndereco, bairro, cidade, estado.\n\n" +

      "Se não encontrar algum campo, retorne string vazia."
    );
  }

  return (
    "Você receberá 1 imagem de cliente importado da Loja Integrada.\n\n" +
    "Extraia somente os campos:\n" +
    "nome, cpf, telefone, email, observacoes, cep, endereco, numero, complemento, complementoEndereco, bairro, cidade, estado.\n\n" +
    "Se encontrar um número com 11 dígitos, considere como CPF.\n" +
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

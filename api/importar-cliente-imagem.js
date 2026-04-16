import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { image } = req.body || {};

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Imagem não enviada." });
    }

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
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Leia esta ficha de cliente em português do Brasil e extraia somente os campos do schema. " +
                "Não invente dados. Se não conseguir ler um campo, devolva string vazia. " +
                "Sempre devolva cpf vazio. " +
                "Use o celular como telefone principal quando ele existir."
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "cliente_importacao",
          strict: true,
          schema
        }
      }
    });

    const parsed = JSON.parse(response.output_text || "{}");

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("ERRO ROTA IMPORTAR CLIENTE:", error);

    return res.status(500).json({
      error: error?.message || "Erro interno na função."
    });
  }
}

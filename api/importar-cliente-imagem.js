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

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Leia esta ficha de cliente em português do Brasil e devolva somente JSON válido com estes campos: " +
                "nome, cpf, telefone, email, observacoes, cep, endereco, numero, complemento, complementoEndereco, bairro, cidade, estado. " +
                "Não invente dados. Se não souber, devolva string vazia. " +
                "Sempre devolva cpf vazio.",
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    const raw = response.output_text || "";

// remove ```json ... ```
const clean = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

let parsed = {};

try {
  parsed = JSON.parse(clean);
} catch {
  parsed = {};
}

    return res.status(200).json({
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
      estado: "",
      rawText: text,
    });
  } catch (error) {
    console.error("ERRO ROTA IMPORTAR CLIENTE:", error);

    return res.status(500).json({
      error: error?.message || "Erro interno na função.",
    });
  }
}

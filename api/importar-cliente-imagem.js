import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function extractMultipartFile(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(.*)$/);
  if (!boundaryMatch) {
    throw new Error("Boundary do multipart não encontrada.");
  }

  const boundary = `--${boundaryMatch[1]}`;
  const body = buffer.toString("binary");

  const parts = body.split(boundary).filter(
    (part) => part.includes('name="file"') && part.includes("filename=")
  );

  if (!parts.length) {
    throw new Error("Arquivo não encontrado no formulário.");
  }

  const filePart = parts[0];
  const typeMatch = filePart.match(/Content-Type:\s*([^\r\n]+)/i);
  const mimeType = typeMatch?.[1]?.trim() || "image/jpeg";

  const separator = "\r\n\r\n";
  const start = filePart.indexOf(separator);
  if (start === -1) {
    throw new Error("Conteúdo do arquivo inválido.");
  }

  let fileBinary = filePart.slice(start + separator.length);
  fileBinary = fileBinary.replace(/\r\n--$/, "").replace(/\r\n$/, "");

  return {
    mimeType,
    base64: Buffer.from(fileBinary, "binary").toString("base64"),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Envie a imagem como multipart/form-data." });
    }

    const rawBody = await readRequestBody(req);
    const { mimeType, base64 } = extractMultipartFile(rawBody, contentType);

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
        estado: { type: "string" },
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
        "estado",
      ],
    };

    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Leia esta ficha de cliente em português do Brasil e extraia SOMENTE os campos do schema. " +
                "Não invente valores. Se não conseguir ler um campo, devolva string vazia. " +
                "Ignore campos que não entram no banco. " +
                "Não preencha CPF a partir da imagem; sempre devolva cpf vazio. " +
                "Use o telefone celular como telefone principal quando ele existir.",
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64}`,
            },
          ],
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

    const jsonText = response.output_text || "{}";
    const parsed = JSON.parse(jsonText);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Erro na rota importar-cliente-imagem:", error);
    return res.status(500).json({
      error: "Não foi possível analisar a imagem.",
      details: error?.message || "Erro interno.",
    });
  }
}
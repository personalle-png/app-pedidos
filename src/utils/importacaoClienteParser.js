export function limparTextoOCR(texto) {
  return String(texto || "")
    .replace(/\r/g, "")
    .replace(/[|]/g, "I")
    .replace(/[•]/g, ".")
    .replace(/[“”]/g, '"')
    .trim();
}

function extrair(regex, texto) {
  const match = texto.match(regex);
  return match?.[1]?.trim() || "";
}

function extrairLinhaApos(rotuloRegex, texto) {
  const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < linhas.length; i += 1) {
    if (rotuloRegex.test(linhas[i])) {
      const atual = linhas[i].replace(rotuloRegex, "").trim();
      if (atual) return atual;
      if (linhas[i + 1]) return linhas[i + 1].trim();
    }
  }

  return "";
}

function normalizarCep(valor) {
  const digits = String(valor || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) return "";
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function parseClienteFromOCR(rawText) {
  const texto = limparTextoOCR(rawText);

  const nome =
    extrairLinhaApos(/^nome\s*:?\s*/i, texto) ||
    extrair(/nome\s*:?\s*([^\n]+)/i, texto);

  const telefone =
    extrair(/(?:celular|telefone|fone)\s*:?\s*([+\d().\s-]{8,})/i, texto) ||
    extrairLinhaApos(/^(?:celular|telefone|fone)\s*:?\s*/i, texto);

  const email =
    extrair(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i, texto);

  const cep = normalizarCep(
    extrair(/cep\s*:?\s*([\d.\-]{8,10})/i, texto) ||
    extrairLinhaApos(/^cep\s*:?\s*/i, texto)
  );

  const endereco =
    extrair(/endere[cç]o\s*:?\s*([^\n]+)/i, texto) ||
    extrairLinhaApos(/^endere[cç]o\s*:?\s*/i, texto);

  const numero =
    extrair(/(?:n[uú]mero|num)\s*:?\s*([^\n]+)/i, texto) ||
    extrairLinhaApos(/^(?:n[uú]mero|num)\s*:?\s*/i, texto);

  const complementoEndereco =
    extrair(/(?:complemento do endere[cç]o|complemento)\s*:?\s*([^\n]+)/i, texto) ||
    extrairLinhaApos(/^(?:complemento do endere[cç]o|complemento)\s*:?\s*/i, texto);

  const bairro =
    extrair(/bairro\s*:?\s*([^\n]+)/i, texto) ||
    extrairLinhaApos(/^bairro\s*:?\s*/i, texto);

  const cidade =
    extrair(/cidade\s*:?\s*([^\n]+)/i, texto) ||
    extrairLinhaApos(/^cidade\s*:?\s*/i, texto);

  const estado =
    extrair(/estado\s*:?\s*([^\n]+)/i, texto) ||
    extrairLinhaApos(/^estado\s*:?\s*/i, texto);

  const observacoes =
    extrair(/(?:observa[cç][õo]es?|anota[cç][õo]es?)\s*:?\s*([\\s\\S]+)/i, texto);

  return {
    nome,
    cpf: "",
    telefone,
    email,
    observacoes,
    cep,
    endereco,
    numero,
    complemento: "",
    complementoEndereco,
    bairro,
    cidade,
    estado,
    rawText: texto,
  };
}

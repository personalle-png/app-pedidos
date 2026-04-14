export function limparTextoOCR(texto) {
  return String(texto || "")
    .replace(/\r/g, "")
    .replace(/[|]/g, "I")
    .replace(/[“”‘’]/g, "")
    .replace(/[•]/g, ".")
    .replace(/[<>]/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

function normalizarCep(valor) {
  const digits = String(valor || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) return "";
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function limparTelefone(valor) {
  return String(valor || "")
    .replace(/[^\d()+\-\s]/g, "")
    .trim();
}

function limparEmail(valor) {
  return String(valor || "")
    .replace(/\s+/g, "")
    .replace(/[,;]/g, ".")
    .trim()
    .toLowerCase();
}

function limparCampo(valor) {
  return String(valor || "")
    .replace(/^[-:=>\s]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extrairDepoisDoRotulo(texto, rotulo) {
  const linhas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < linhas.length; i += 1) {
    const linha = linhas[i];

    if (rotulo.test(linha)) {
      let semRotulo = limparCampo(linha.replace(rotulo, ""));

      semRotulo = semRotulo
        .replace(/buscar nos correios/i, "")
        .replace(/^[-:=>'"*]+/, "")
        .trim();

      if (
        semRotulo &&
        !/^sim|não$/i.test(semRotulo) &&
        semRotulo.length > 1
      ) {
        return semRotulo;
      }

      if (linhas[i + 1]) {
        return limparCampo(linhas[i + 1]);
      }
    }
  }

  return "";
}

export function parseClienteFromOCR(rawText) {
  const texto = limparTextoOCR(rawText);

  const nome =
  extrairDepoisDoRotulo(texto, /^nome completo\s*/i) ||
  extrairDepoisDoRotulo(texto, /^dados do cliente\s*/i);

  const telefoneResidencial = extrairDepoisDoRotulo(
    texto,
    /^telefone residencial\s*/i
  );

  const telefoneComercial = extrairDepoisDoRotulo(
    texto,
    /^telefone comercial\s*/i
  );

  const celular = extrairDepoisDoRotulo(texto, /^celular\s*/i);

  const email = limparEmail(
  extrairDepoisDoRotulo(texto, /^email\s*/i)
);

  const anotacoes = extrairDepoisDoRotulo(texto, /^anota[cç][õo]es\s*/i);

  const cep = normalizarCep(
  extrairDepoisDoRotulo(texto, /^cep\s*/i)
);

  const endereco = extrairDepoisDoRotulo(texto, /^endere[cç]o\s*/i);

  const numero = extrairDepoisDoRotulo(texto, /^n[uú]mero\s*/i);

  const complemento = extrairDepoisDoRotulo(texto, /^complemento\s*/i);

  const bairro = extrairDepoisDoRotulo(texto, /^bairro\s*/i);

  const cidade = extrairDepoisDoRotulo(texto, /^cidade\s*/i);

  const estado = extrairDepoisDoRotulo(texto, /^estado\s*/i);

  const telefoneFinal =
    limparTelefone(celular) ||
    limparTelefone(telefoneResidencial) ||
    limparTelefone(telefoneComercial);

  return {
    nome: limparCampo(nome),
    cpf: "",
    telefone: telefoneFinal,
    email: limparEmail(email),
    observacoes: limparCampo(anotacoes),
    cep: normalizarCep(cep),
    endereco: limparCampo(endereco),
    numero: limparCampo(numero),
    complemento: "",
    complementoEndereco: limparCampo(complemento),
    bairro: limparCampo(bairro),
    cidade: limparCampo(cidade),
    estado: limparCampo(estado),
    rawText: texto,
  };
}

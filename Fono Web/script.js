
const CLINIC_WHATSAPP_E164 = "5561992929364"; 



const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

const form = document.getElementById("formAgendamento");
const hint = document.getElementById("formHint");
const btnWhats = document.getElementById("btnWhats");
const whatsFloat = document.getElementById("whatsFloat");

const fields = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  especialidade: document.getElementById("especialidade"),
  observacoes: document.getElementById("observacoes"),
};

function setError(fieldName, message = "") {
  const el = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (el) el.textContent = message;
}

function onlyDigits(str) {
  return (str || "").replace(/\D/g, "");
}

function isValidBRPhone(phone) {
  const digits = onlyDigits(phone);
  return digits.length === 10 || digits.length === 11;
}

function buildWhatsMessage() {
  const nome = fields.nome.value.trim();
  const email = fields.email.value.trim();
  const telefone = fields.telefone.value.trim();
  const especialidade = fields.especialidade.value.trim();
  const obs = (fields.observacoes.value || "").trim();

  const parts = [
    "Olá! Gostaria de agendar uma consulta na Clínica Fono+.",
    `Nome: ${nome}`,
    `Telefone: ${telefone}`,
    `E-mail: ${email}`,
    `Especialidade: ${especialidade}`,
  ];

  if (obs) parts.push(`Observações: ${obs}`);

  return parts.join("\n");
}

function openWhatsApp(message) {
  const url = `https://wa.me/${CLINIC_WHATSAPP_E164}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

function validateForm() {
  let ok = true;

  ["nome", "email", "telefone", "especialidade"].forEach((f) => setError(f, ""));

  const nome = fields.nome.value.trim();
  const email = fields.email.value.trim();
  const telefone = fields.telefone.value.trim();
  const especialidade = fields.especialidade.value.trim();

  if (nome.length < 3) {
    setError("nome", "Digite seu nome completo (mín. 3 caracteres).");
    ok = false;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setError("email", "Digite um e-mail válido.");
    ok = false;
  }

  if (!isValidBRPhone(telefone)) {
    setError("telefone", "Digite um telefone com DDD (10 ou 11 dígitos).");
    ok = false;
  }

  if (!especialidade) {
    setError("especialidade", "Selecione uma especialidade.");
    ok = false;
  }

  return ok;
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-scroll]").forEach((el) => {
  el.addEventListener("click", (e) => {
    const href = el.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  });
});

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby5KrK6NxkNfKU58fIFlRDVkJL_kdVDJwiTVIBoodPgwdfggGtwAQjTv4NKEDwPEcO9/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hint.textContent = "";

  if (!validateForm()) {
    hint.textContent = "Revise os campos destacados e tente novamente.";
    return;
  }

  const payload = {
    nome: fields.nome.value.trim(),
    email: fields.email.value.trim(),
    telefone: fields.telefone.value.trim(),
    especialidade: fields.especialidade.value.trim(),
    observacoes: (fields.observacoes.value || "").trim(),
  };

  try {
    // Envia como x-www-form-urlencoded (mais compatível com Apps Script)
    const body = new URLSearchParams(payload);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // evita erro de CORS
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
    });

    // Como no-cors não deixa ler a resposta, assumimos sucesso se não cair no catch
    hint.textContent = "Agendamento enviado! ✅ Ele já aparece na planilha.";
    form.reset();
  } catch (err) {
    hint.textContent = "Falha ao enviar. Verifique a implantação do Web App e tente novamente.";
  }
});

btnWhats.addEventListener("click", () => {
  hint.textContent = "";

  if (!validateForm()) {
    hint.textContent = "Para enviar no WhatsApp, revise os campos obrigatórios.";
    return;
  }

  openWhatsApp(buildWhatsMessage());
});

whatsFloat.addEventListener("click", (e) => {
  e.preventDefault();
  const msg = "Olá! Gostaria de informações sobre atendimento na Clínica Fono+.";
  openWhatsApp(msg);
});
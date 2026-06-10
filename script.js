const PRO_CHECKOUT = "https://lastlink.com/p/C4894FC56/checkout-payment?af=A74E3D5D7";
const BASIC_CHECKOUT = "https://lastlink.com/p/C76C7612B/checkout-payment?af=A74E3D5D7";

const questions = [
  {
    text: "Qual é seu maior problema no Free Fire hoje?",
    options: ["Minha mira passa do alvo", "Minha mira não sobe capa", "Meu jogo trava ou fica pesado", "Meu HUD/sensi parece desorganizado"]
  },
  {
    text: "Na hora do x1, o que mais te atrapalha?",
    options: ["Delay no toque", "Falta de controle na mira", "Sensibilidade ruim", "Travamento/FPS caindo"]
  },
  {
    text: "Você já tentou copiar sensi de outros jogadores?",
    options: ["Sim, mas não ficou bom", "Sim, melhorou pouco", "Nunca testei direito", "Quero uma sensi pronta"]
  },
  {
    text: "O que você quer agora?",
    options: ["Um pack simples pra começar", "Um pack completo com mais vantagens", "Melhorar mira e HUD", "Ter acesso a métodos e bônus"]
  }
];

const state = { current: 0, answers: [] };
const quizStage = document.querySelector("#quiz-stage");
const loadingStage = document.querySelector("#loading-stage");
const resultStage = document.querySelector("#result-stage");
const progress = document.querySelector("#quiz-progress");
const percent = document.querySelector("#quiz-percent");
const step = document.querySelector("#quiz-step");
const loadingText = document.querySelector("#loading-text");

function renderQuestion() {
  const item = questions[state.current];
  const value = Math.round(((state.current + 1) / questions.length) * 100);
  progress.style.width = `${value}%`;
  percent.textContent = `${value}%`;
  step.textContent = `Pergunta ${state.current + 1} de ${questions.length}`;
  quizStage.innerHTML = `
    <span class="question-label">Marque a opção mais próxima da sua realidade</span>
    <h3>${item.text}</h3>
    <div class="quiz-options">
      ${item.options.map((option, index) => `
        <button class="quiz-option" type="button" data-option="${index}">
          <span class="option-letter">${String.fromCharCode(65 + index)}</span>
          <span class="option-text">${option}</span>
        </button>`).join("")}
    </div>`;
  quizStage.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => answer(Number(button.dataset.option)));
  });
}

function answer(index) {
  state.answers[state.current] = questions[state.current].options[index];
  if (state.current < questions.length - 1) {
    state.current += 1;
    renderQuestion();
    quizStage.querySelector(".quiz-option")?.focus({ preventScroll: true });
    return;
  }
  analyze();
}

function analyze() {
  quizStage.hidden = true;
  loadingStage.hidden = false;
  step.textContent = "Análise final";
  percent.textContent = "100%";
  progress.style.width = "100%";
  ["Analisando sua mira...", "Verificando sensibilidade...", "Detectando pontos fracos...", "Preparando recomendação..."].forEach((message, index) => {
    setTimeout(() => loadingText.textContent = message, index * 500);
  });
  setTimeout(() => {
    loadingStage.hidden = true;
    resultStage.hidden = false;
    step.textContent = "Recomendação pronta";
    resultStage.querySelector("button")?.focus({ preventScroll: true });
  }, 2100);
}

const smoothScroll = (selector, block = "center") => {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block });
};

document.querySelectorAll("[data-scroll-quiz]").forEach(button => button.addEventListener("click", () => {
  smoothScroll("#diagnostico", "start");
  setTimeout(() => quizStage.querySelector(".quiz-option")?.focus({ preventScroll: true }), 650);
}));
document.querySelectorAll("[data-scroll-pro]").forEach(button => button.addEventListener("click", () => smoothScroll("#pack-pro", "start")));
document.querySelectorAll("[data-scroll-basic]").forEach(button => button.addEventListener("click", () => {
  document.querySelector("#sticky-offer")?.classList.remove("visible");
  smoothScroll("#pack-basico", "start");
}));
document.querySelectorAll("[data-pro-checkout]").forEach(link => link.href = PRO_CHECKOUT);
document.querySelectorAll("[data-basic-checkout]").forEach(link => link.href = BASIC_CHECKOUT);

document.querySelectorAll(".asset-image").forEach(image => {
  const missing = () => image.classList.add("is-missing");
  image.addEventListener("error", missing);
  if (image.complete && image.naturalWidth === 0) missing();
});
document.querySelectorAll(".logo-image").forEach(image => {
  const missing = () => image.classList.add("is-missing");
  image.addEventListener("error", missing);
  if (image.complete && image.naturalWidth === 0) missing();
});

const gallery = document.querySelector("#gallery-track");
const cards = [...document.querySelectorAll(".gallery-card")];
const dots = document.querySelector("#gallery-dots");
cards.forEach((_, index) => {
  const dot = document.createElement("span");
  if (index === 0) dot.classList.add("active");
  dots.append(dot);
});
const galleryStep = () => cards[0]?.getBoundingClientRect().width + 13 || 0;
document.querySelector("[data-gallery-prev]")?.addEventListener("click", () => gallery.scrollBy({ left: -galleryStep(), behavior: "smooth" }));
document.querySelector("[data-gallery-next]")?.addEventListener("click", () => gallery.scrollBy({ left: galleryStep(), behavior: "smooth" }));
let galleryFrame;
gallery.addEventListener("scroll", () => {
  cancelAnimationFrame(galleryFrame);
  galleryFrame = requestAnimationFrame(() => {
    const active = Math.min(Math.round(gallery.scrollLeft / galleryStep()), cards.length - 1);
    [...dots.children].forEach((dot, index) => dot.classList.toggle("active", index === active));
  });
}, { passive: true });

const header = document.querySelector("#site-header");
const sticky = document.querySelector("#sticky-offer");
const hero = document.querySelector(".hero");
const plans = document.querySelector("#planos");
const updateScrollUI = () => {
  header.classList.toggle("scrolled", scrollY > 18);
  const plansBox = plans.getBoundingClientRect();
  const plansInView = plansBox.top < innerHeight && plansBox.bottom > 0;
  const nearFooter = scrollY + innerHeight > document.documentElement.scrollHeight - 220;
  sticky.classList.toggle("visible", scrollY > hero.offsetHeight * .72 && !plansInView && !nearFooter);
};
addEventListener("scroll", updateScrollUI, { passive: true });
addEventListener("resize", updateScrollUI, { passive: true });
updateScrollUI();

const observer = new IntersectionObserver((entries, currentObserver) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    currentObserver.unobserve(entry.target);
  });
}, { threshold: .1, rootMargin: "0px 0px -25px" });
document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

document.querySelectorAll(".faq-list details").forEach(item => item.addEventListener("toggle", () => {
  if (!item.open) return;
  document.querySelectorAll(".faq-list details").forEach(other => {
    if (other !== item) other.open = false;
  });
}));

renderQuestion();

// Adicione somente compras reais e autorizadas neste array.
// Exemplo: { name: "Nome real", pack: "Pack Pro", city: "Cidade opcional" }
const realPurchases = [];

const genericPopupMessages = [
  "O Pack Pro é o mais escolhido da página.",
  "Jogadores estão comparando Básico vs Pro agora.",
  "Por pouca diferença, o Pro entrega muito mais.",
  "Pack Básico liberado por R$24,87.",
  "Pack Pro completo por R$29,57.",
  "Oferta low ticket ativa agora.",
  "Acesso vitalício disponível nos dois packs.",
  "Pack Pro inclui tudo do Básico + bônus extras."
];

const popup = document.querySelector("#conversion-popup");
const popupLabel = document.querySelector("#popup-label");
const popupTitle = document.querySelector("#popup-title");
const popupText = document.querySelector("#popup-text");
const popupActions = document.querySelector("#popup-actions");
let popupTimer;
let popupAutoCloseTimer;
let popupStage = 0;
let genericMessageIndex = 0;
let lastPopupClosedAt = 0;
let purchaseButtonClicked = false;

document.querySelectorAll("[data-pro-checkout], [data-basic-checkout]").forEach(link => {
  link.addEventListener("click", () => {
    purchaseButtonClicked = true;
    closePopup(false);
  });
});

function getRandomPopupMessage() {
  if (realPurchases.length) {
    const purchase = realPurchases[Math.floor(Math.random() * realPurchases.length)];
    const location = purchase.city ? ` em ${purchase.city}` : "";
    return {
      label: "Compra real confirmada",
      title: `${purchase.name} acabou de adquirir o ${purchase.pack}.`,
      text: `Compra real confirmada${location}.`
    };
  }

  const message = genericPopupMessages[genericMessageIndex % genericPopupMessages.length];
  genericMessageIndex += 1;
  return { label: "Plutão Sensi", title: "Oferta ativa", text: message };
}

function createPopupButton(label, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button ${className}`;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function importantActionIsVisible() {
  return ["#diagnostico", "#planos", ".final-section"].some(selector => {
    const element = document.querySelector(selector);
    if (!element) return false;
    const bounds = element.getBoundingClientRect();
    return bounds.top < innerHeight * 0.82 && bounds.bottom > innerHeight * 0.18;
  });
}

function showConversionPopup(data = getRandomPopupMessage()) {
  if (!popup.hidden || document.hidden || importantActionIsVisible()) {
    scheduleNextPopup(15000);
    return false;
  }

  clearTimeout(popupTimer);
  clearTimeout(popupAutoCloseTimer);
  popup.classList.toggle("retention", Boolean(data.retention));
  popupLabel.textContent = data.label || "Plutão Sensi";
  popupTitle.textContent = data.title;
  popupText.textContent = data.text;
  popupActions.replaceChildren();

  (data.actions || []).forEach(action => {
    popupActions.append(createPopupButton(action.label, action.className, action.handler));
  });

  popup.hidden = false;
  requestAnimationFrame(() => popup.classList.add("show"));
  popupAutoCloseTimer = setTimeout(() => closePopup(), data.duration || 6500);
  return true;
}

function closePopup(scheduleAnother = true) {
  if (popup.hidden) return;
  clearTimeout(popupAutoCloseTimer);
  popup.classList.remove("show");
  lastPopupClosedAt = Date.now();
  setTimeout(() => {
    popup.hidden = true;
    popup.classList.remove("retention");
  }, 300);
  if (scheduleAnother) scheduleNextPopup(popupStage < 2 ? 3000 : randomPopupInterval());
}

function randomPopupInterval() {
  return Math.floor(45000 + Math.random() * 45000);
}

function scheduleNextPopup(delay = randomPopupInterval()) {
  clearTimeout(popupTimer);
  const elapsedSinceClose = Date.now() - lastPopupClosedAt;
  const minimumWait = lastPopupClosedAt ? Math.max(0, 45000 - elapsedSinceClose) : 0;
  popupTimer = setTimeout(runNextPopup, Math.max(delay, minimumWait));
}

function runNextPopup() {
  if (popupStage === 0) {
    const shown = showConversionPopup({
      retention: true,
      duration: 7000,
      label: "Escolha seu pack",
      title: "Tá em dúvida entre Básico e Pro?",
      text: "Se você quer só começar, o Básico já ajuda. Mas se quer o pacote completo, o Pro entrega muito mais por pouca diferença.",
      actions: [
        { label: "Ver Pack Pro", className: "button-primary", handler: () => { closePopup(); smoothScroll("#pack-pro", "start"); } },
        { label: "Ver Pack Básico", className: "button-outline", handler: () => { closePopup(); smoothScroll("#pack-basico", "start"); } }
      ]
    });
    if (shown) popupStage = 1;
    return;
  }

  if (popupStage === 1 && !purchaseButtonClicked) {
    const shown = showConversionPopup({
      retention: true,
      duration: 7000,
      label: "Recomendação",
      title: "Melhor custo-benefício",
      text: "O Pack Pro inclui tudo do Básico + sensis de famosos, HUDs dos pro players, videoaulas, bônus e atualizações futuras.",
      actions: [
        { label: "Quero o Pro", className: "button-primary", handler: () => { purchaseButtonClicked = true; location.href = PRO_CHECKOUT; } },
        { label: "Continuar vendo", className: "button-outline", handler: () => closePopup() }
      ]
    });
    if (shown) popupStage = 2;
    return;
  }

  popupStage = 2;
  showConversionPopup();
}

document.querySelector("[data-popup-close]")?.addEventListener("click", () => closePopup());
addEventListener("scroll", () => {
  if (!popup.hidden && importantActionIsVisible()) closePopup();
}, { passive: true });
scheduleNextPopup(30000);

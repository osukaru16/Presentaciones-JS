
const content = document.querySelector("#slide-content");
const eyebrow = document.querySelector("#eyebrow");
const counter = document.querySelector("#counter");
const progress = document.querySelector("#progress");
const dots = document.querySelector("#dots");

const prevButton = document.querySelector("#prev");
const nextButton = document.querySelector("#next");

let deck = [];
let current = 0;

// Evita que el contenido del JSON se interprete como HTML.
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

// Genera un bloque visual para mostrar código JavaScript.
function codeCard(code, caption) {
  return `
    <div class="code-card">
      <div class="code-head">
        <span class="code-dots"><i></i><i></i><i></i></span>
        <span>JavaScript</span>
      </div>

      <pre><code>${escapeHTML(code || "")}</code></pre>

      ${caption ? `
        <div class="code-caption">
          ${escapeHTML(caption)}
        </div>
      ` : ""}
    </div>
  `;
}

// Genera el recuadro de idea clave.
function takeaway(text) {
  return text ? `
    <div class="takeaway">
      <strong>IDEA CLAVE</strong>
      ${escapeHTML(text)}
    </div>
  ` : "";
}

// Genera una lista de puntos.
function pointsList(items) {
  return items?.length ? `
    <ul class="points">
      ${items.map(item => `
        <li>${escapeHTML(item)}</li>
      `).join("")}
    </ul>
  ` : "";
}

// Construye el contenido de cada diapositiva.
function renderSlide(slide) {

  // Primera diapositiva: portada.
  if (slide.type === "cover") {

    return `
      <div class="cover-kicker">
        ${escapeHTML(slide.eyebrow)}
      </div>

      <h1>${escapeHTML(slide.title)}</h1>

      <p class="cover-subtitle">
        ${escapeHTML(slide.subtitle)}
      </p>

      <div class="chips">
        ${slide.chips.map(chip => `
          <span class="chip">${escapeHTML(chip)}</span>
        `).join("")}
      </div>

      <p class="note">
        ${escapeHTML(slide.note)}
      </p>
    `;
  }

  let html = `<h2>${escapeHTML(slide.title)}</h2>`;

  if (slide.body) {
    html += `
      <p class="lead">
        ${escapeHTML(slide.body)}
      </p>
    `;
  }

  // Diapositivas con analogías y ejemplos de código.
  if (slide.analogy) {

    html += `
      <div class="content-grid">

        <div class="analogy-card">
          <h3>${escapeHTML(slide.analogyTitle)}</h3>

          <p>${escapeHTML(slide.analogy)}</p>
        </div>

        ${codeCard(slide.code, slide.codeCaption)}

      </div>
    `;

  // Diapositivas comparativas.
  } else if (slide.comparison) {

    html += `
      <div class="comparison">

        ${slide.comparison.map(item => `
          <article class="info-card">

            <span class="tag">
              ${escapeHTML(item.kind)}
            </span>

            <h3>${escapeHTML(item.name)}</h3>

            <p>${escapeHTML(item.description)}</p>

            <div class="mini-code">
              ${escapeHTML(item.example)}
            </div>

          </article>
        `).join("")}

      </div>
    `;

  // Diapositivas que muestran las posiciones de un array.
  } else if (slide.arrayItems) {

    html += `
      <div class="array-row">

        ${slide.arrayItems.map(item => `
          <div class="array-cell">

            <div class="array-index">
              índice ${item.index}
            </div>

            <div class="array-value">
              ${escapeHTML(item.value)}
            </div>

          </div>
        `).join("")}

      </div>

      ${codeCard(slide.code, slide.codeCaption)}
    `;

  // Diapositivas de resumen.
  } else if (slide.summary) {

    html += `
      <div class="summary-grid">

        ${slide.summary.map(item => `
          <article class="summary-card">

            <h3>${escapeHTML(item.term)}</h3>

            <p>${escapeHTML(item.description)}</p>

            <small>${escapeHTML(item.visual)}</small>

          </article>
        `).join("")}

      </div>
    `;

  // Diapositiva con preguntas interactivas.
  } else if (slide.questions) {

    html += `
      <div class="quiz">

        ${slide.questions.map((q, index) => `

          <section class="question" data-question="${index}">

            <h3>
              ${index + 1}. ${escapeHTML(q.question)}
            </h3>

            ${q.options.map((option, optionIndex) => `

              <label class="option">

                <input
                  type="radio"
                  name="q${index}"
                  value="${optionIndex}"
                >

                <span>${escapeHTML(option)}</span>

              </label>

            `).join("")}

            <button class="check-answer" type="button">
              Comprobar respuesta
            </button>

            <p class="feedback" aria-live="polite"></p>

          </section>

        `).join("")}

      </div>
    `;

  // Diapositivas generales.
  } else {

    html += pointsList(slide.points);

    if (slide.code) {

      html += `
        <div style="margin-top:22px">
          ${codeCard(slide.code, slide.codeCaption)}
        </div>
      `;
    }

    if (slide.finalMessage) {

      html += `
        <p class="final-message">
          ${escapeHTML(slide.finalMessage)}
        </p>
      `;
    }
  }

  html += takeaway(slide.takeaway);

  return html;
}

// Muestra la diapositiva seleccionada.
function render() {

  const slide = deck[current];

  eyebrow.textContent = slide.eyebrow || "";

  counter.textContent =
    `${String(current + 1).padStart(2, "0")} / ${String(deck.length).padStart(2, "0")}`;

  content.innerHTML = renderSlide(slide);

  // Actualiza la barra de progreso.
  progress.style.width =
    `${((current + 1) / deck.length) * 100}%`;

  // Desactiva los botones cuando corresponde.
  prevButton.disabled = current === 0;

  nextButton.disabled = current === deck.length - 1;

  nextButton.innerHTML =
    current === deck.length - 1
      ? "<span>Finalizado</span> ✓"
      : "<span>Siguiente</span> →";

  // Actualiza los indicadores inferiores.
  [...dots.children].forEach((dot, index) => {

    dot.classList.toggle("active", index === current);

    dot.setAttribute(
      "aria-current",
      index === current ? "step" : "false"
    );

  });

  // Activa los botones del cuestionario.
  content.querySelectorAll(".check-answer").forEach(button => {

    button.addEventListener("click", () => {
      checkAnswer(button);
    });

  });
}

// Comprueba si la respuesta seleccionada es correcta.
function checkAnswer(button) {

  const questionElement = button.closest(".question");

  const questionIndex =
    Number(questionElement.dataset.question);

  const selected =
    questionElement.querySelector("input:checked");

  const feedback =
    questionElement.querySelector(".feedback");

  const question =
    deck[current].questions[questionIndex];

  if (!selected) {

    feedback.textContent =
      "Selecciona una opción antes de comprobar.";

    feedback.className = "feedback incorrect";

    return;
  }

  const correct =
    Number(selected.value) === question.correct;

  feedback.textContent =
    `${correct ? "¡Correcto!" : "No es esa opción."} ${question.explanation}`;

  feedback.className =
    `feedback ${correct ? "correct" : "incorrect"}`;
}

// Cambia a una diapositiva concreta.
function goTo(index) {

  if (index < 0 || index >= deck.length) {
    return;
  }

  current = index;

  render();
}

// Navegación mediante botones.
prevButton.addEventListener("click", () => {
  goTo(current - 1);
});

nextButton.addEventListener("click", () => {
  goTo(current + 1);
});

// Navegación mediante las flechas del teclado.
document.addEventListener("keydown", event => {

  if (event.key === "ArrowRight") {
    goTo(current + 1);
  }

  if (event.key === "ArrowLeft") {
    goTo(current - 1);
  }

});

// Carga los datos desde slides.json.
async function start() {

  try {

    const response = await fetch("./slides.json");

    if (!response.ok) {
      throw new Error("No se ha podido cargar slides.json");
    }

    const data = await response.json();

    deck = data.slides;

    document.querySelector("#course-level").textContent =
      data.course.level;

    document.title =
      `${data.course.title} · Clase interactiva`;

    // Crea un indicador por cada diapositiva.
    deck.forEach((_, index) => {

      const dot = document.createElement("button");

      dot.className = "dot";

      dot.type = "button";

      dot.title = `Ir a la diapositiva ${index + 1}`;

      dot.setAttribute("aria-label", dot.title);

      dot.addEventListener("click", () => {
        goTo(index);
      });

      dots.appendChild(dot);

    });

    render();

  } catch (error) {

    content.innerHTML = `
      <p class="lead">
        No se ha podido cargar el contenido.
        Abre la web mediante un servidor local
        y comprueba que slides.json está en la misma carpeta.
      </p>
    `;

    console.error(error);
  }
}

// Inicia la presentación.
start();

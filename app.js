// URL de tu Google Apps Script (se obtiene en la Etapa 4)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbw0T8DMo-6eR7ztqULTTQaGEvtrr3pbSkUFoYnPZMOyfF7henduWIErG80x9Ivz2V/exec";

const OTRO = "Otro";
const $ = (s, r = document) => r.querySelector(s);
const mezclar = a => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---- Preguntas (tipo: una | varias | escala | texto) ----
const P = [
  { id: "q1", tipo: "una", mez: 1, otro: 1, t: "¿Cuál es su relación con el área de tecnología?",
    o: ["Estudiante", "Docente o instructor", "Desarrollador/a o programador/a", "Analista o diseñador/a", "Líder o gestor/a de proyectos", "Soporte, infraestructura o sistemas", "Autodidacta o aficionado/a"] },
  { id: "q2", tipo: "una", t: "¿Ha participado en proyectos de desarrollo de software?",
    o: ["No he participado", "Sí, en proyectos académicos o de formación", "Sí, en proyectos personales o independientes", "Sí, en proyectos laborales", "Sí, en varios de los anteriores"] },
  { id: "q3", tipo: "varias", max: 3, mez: 1, otro: 1, t: "¿Qué considera más importante para que un proyecto de software se desarrolle correctamente?",
    o: ["Objetivos y alcance claros", "Buena comunicación", "Planificación realista de tiempos", "Roles y responsabilidades definidos", "Seguimiento constante del avance", "Manejo adecuado de los cambios", "Recursos suficientes (tiempo, personas, presupuesto)", "Pruebas y control de calidad", "Herramientas adecuadas"] },
  { id: "q4", tipo: "varias", mez: 1, otro: 1, t: "¿Qué elementos debería tener una herramienta para gestionar proyectos?",
    o: ["Lista de tareas", "Tablero visual (por columnas)", "Calendario o cronograma", "Asignación de responsables", "Estados de avance", "Comentarios o chat", "Documentos o archivos adjuntos", "Notificaciones y recordatorios", "Reportes o indicadores", "Historial de cambios"] },
  { id: "q5", tipo: "varias", mez: 1, otro: 1, t: "¿Cómo considera que debería realizarse el seguimiento de las actividades?",
    o: ["Estados de cada tarea (pendiente, en curso, terminada)", "Porcentaje de avance", "Tablero visual", "Reuniones periódicas", "Reportes automáticos", "Registro de tiempo dedicado", "Bitácora o comentarios de avance"] },
  { id: "q6", tipo: "varias", mez: 1, otro: 1, t: "¿Qué información debería estar disponible para los integrantes de un proyecto?",
    o: ["Objetivos y alcance", "Tareas y responsables", "Fechas límite", "Estado general del avance", "Documentación del proyecto", "Decisiones tomadas", "Riesgos o problemas abiertos", "Comentarios y observaciones"] },
  { id: "q7", tipo: "varias", max: 3, mez: 1, otro: 1, t: "¿Qué dificultades considera más frecuentes durante el desarrollo de proyectos?",
    o: ["Cambios constantes en lo que se debe construir", "Mala estimación de tiempos", "Falta de comunicación", "Responsabilidades poco claras", "Falta de seguimiento", "Documentación insuficiente", "Mal reparto del trabajo", "Falta de herramientas adecuadas", "Poco compromiso del equipo"] },
  { id: "q8", tipo: "escala", t: "¿Qué importancia le daría a la asignación clara de responsabilidades?" },
  { id: "q9", tipo: "varias", max: 4, mez: 1, otro: 1, t: "Además de las funciones, ¿qué características considera indispensables en un gestor de proyectos?",
    o: ["Fácil de usar", "Rápido", "Accesible desde el celular", "Gratuito o de bajo costo", "Trabajo colaborativo", "Seguridad y privacidad de la información", "Personalizable", "Conexión con otras herramientas", "Que funcione sin internet"] },
  { id: "q10", tipo: "texto", t: "Desde su experiencia, ¿qué recomendación daría para desarrollar una herramienta de este tipo?" }
];

const PASOS = [
  ["Su perfil", ["q1", "q2"]],
  ["Proyectos de software", ["q3", "q4", "q5"]],
  ["Información y dificultades", ["q6", "q7", "q8"]],
  ["Características y recomendación", ["q9", "q10"]]
];

// ---- Dibujar preguntas ----
function htmlPregunta(p) {
  const n = p.id.slice(1);
  let hint = "", cuerpo = "";
  if (p.tipo === "una") hint = "Elija una opción.";
  if (p.tipo === "varias") hint = p.max ? `Elija hasta ${p.max}. <b class="cont">(0 de ${p.max})</b>` : "Puede elegir varias.";
  if (p.tipo === "escala") {
    cuerpo = `<div class="escala">${[1, 2, 3, 4, 5].map(i =>
      `<label><input type="radio" name="q8" value="${i}"><span>${i}</span></label>`).join("")}</div>
      <div class="extremos"><span>1 = Nada importante</span><span>5 = Muy importante</span></div>
      <label class="sub">¿Por qué? (opcional)<input type="text" name="q8_porque" maxlength="500"></label>`;
  } else if (p.tipo === "texto") {
    hint = "Opcional. Puede mencionar lo que funcionó, lo que no, o lo que le hubiera gustado tener.";
    cuerpo = `<textarea name="q10" rows="5" maxlength="1500"></textarea>`;
  } else {
    const tipoInput = p.tipo === "una" ? "radio" : "checkbox";
    const ops = (p.mez ? mezclar(p.o) : p.o).concat(p.otro ? [OTRO] : []);
    cuerpo = ops.map(o => `<label class="op"><input type="${tipoInput}" name="${p.id}" value="${o}"><span>${o === OTRO ? "Otro (especifique)" : o}</span></label>`).join("")
      + (p.otro ? `<input type="text" class="otro" maxlength="200" placeholder="Especifique…" aria-label="Especifique otro" hidden>` : "");
  }
  return `<fieldset class="q" id="f-${p.id}" data-id="${p.id}"><legend>${n}. ${p.t}</legend>
    <p class="hint">${hint}</p>${cuerpo}<p class="err" hidden></p></fieldset>`;
}

const pasosEl = $("#pasos");
pasosEl.innerHTML = PASOS.map(([, ids], i) =>
  `<section class="paso" data-i="${i}" hidden>${ids.map(id => htmlPregunta(P.find(p => p.id === id))).join("")}</section>`).join("");

// ---- Valores y validación ----
const marcadas = f => [...f.querySelectorAll("input:checked")].map(i => i.value);

function valor(p) {
  const f = $("#f-" + p.id);
  if (p.tipo === "texto") return $("textarea", f).value.trim();
  const m = marcadas(f);
  if (p.tipo === "escala") return m[0] || "";
  return m.map(v => v === OTRO ? "Otro: " + $(".otro", f).value.trim() : v).join("; ");
}

function error(p) {
  if (p.tipo === "texto") return "";
  const f = $("#f-" + p.id), m = marcadas(f);
  if (!m.length) return p.tipo === "escala" ? "Por favor, elija un valor del 1 al 5." : "Por favor, elija una opción.";
  if (m.includes(OTRO) && !$(".otro", f).value.trim()) return "Por favor, especifique en «Otro».";
  return "";
}

function validarPaso() {
  let primero = null;
  PASOS[paso][1].forEach(id => {
    const p = P.find(x => x.id === id), f = $("#f-" + id), msg = error(p);
    f.classList.toggle("error", !!msg);
    const e = $(".err", f); e.textContent = msg; e.hidden = !msg;
    if (msg && !primero) primero = f;
  });
  if (primero) primero.scrollIntoView({ behavior: "smooth", block: "center" });
  return !primero;
}

// ---- Eventos de las preguntas ----
$("#form").addEventListener("change", e => {
  const f = e.target.closest(".q"); if (!f) return;
  const p = P.find(x => x.id === f.dataset.id);
  const otro = $(".otro", f);
  if (otro) {
    const on = marcadas(f).includes(OTRO);
    otro.hidden = !on;
    if (on && e.target.value === OTRO) otro.focus();
  }
  if (p.max) {
    const n = marcadas(f).length;
    f.querySelectorAll("input[type=checkbox]:not(:checked)").forEach(i => i.disabled = n >= p.max);
    $(".cont", f).textContent = `(${n} de ${p.max})`;
  }
  f.classList.remove("error"); $(".err", f).hidden = true;
});

// ---- Navegación por pasos ----
let paso = 0;
function mostrar(i) {
  paso = i;
  document.querySelectorAll(".paso").forEach(s => s.hidden = +s.dataset.i !== i);
  const ult = i === PASOS.length - 1;
  $("#tituloPaso").textContent = PASOS[i][0];
  $("#textoPaso").textContent = `Paso ${i + 1} de ${PASOS.length}`;
  $("#relleno").style.width = ((i + 1) / PASOS.length * 100) + "%";
  $(".barra").setAttribute("aria-valuenow", Math.round((i + 1) / PASOS.length * 100));
  $("#atras").hidden = i === 0;
  $("#siguiente").hidden = ult;
  $("#enviar").hidden = !ult;
  $("#errorEnvio").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#comenzar").onclick = () => { $("#bienvenida").hidden = true; $("#form").hidden = false; mostrar(0); };
$("#atras").onclick = () => mostrar(paso - 1);
$("#siguiente").onclick = () => { if (validarPaso()) mostrar(paso + 1); };

// ---- Envío a Google Apps Script ----
function gracias() { $("#form").hidden = true; $("#gracias").hidden = false; window.scrollTo(0, 0); }

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  if (paso < PASOS.length - 1) { $("#siguiente").click(); return; } // Enter en pasos intermedios
  if (!validarPaso()) return;

  const datos = {};
  P.forEach(p => datos[p.id] = valor(p));
  datos.q8_porque = $("[name=q8_porque]").value.trim();
  datos.website = $("[name=website]").value; // trampa anti-spam
  if (datos.website) return gracias();       // un bot: fingir éxito sin enviar

  const btn = $("#enviar");
  btn.disabled = true; btn.textContent = "Enviando…";
  try {
    if (APPS_SCRIPT_URL.startsWith("PEGAR")) throw new Error("Falta configurar la URL");
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // evita bloqueos CORS; no podemos leer la respuesta
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(datos)
    });
    gracias();
  } catch (err) {
    $("#errorEnvio").hidden = false;
    btn.disabled = false; btn.textContent = "Enviar respuestas";
  }
});

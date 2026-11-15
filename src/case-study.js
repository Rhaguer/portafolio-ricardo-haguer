import scalePhoto from './balanza-editorial.webp';

const architecture = {
  JARVISHAGUER: ['Comando de voz','Reconocimiento en Raspberry Pi','Magic Packet','Equipo Windows'],
  axoryn: ['Catálogo','Ficha de producto','Persistencia local','Pago simulado'],
  rutanativa: ['Catálogo','Detalle','Resumen de compra','Checkout'],
  'INACAP-Asistente-Local': ['Panel de la extensión','Scripts','Servicio local'],
  'seizurewatch-android-prototype-fixed': ['Captura CameraX','Estimación experimental de pulso','Panel de riesgo'],
  RegistroEstudiantes_IoT4: ['Vistas XAML','Operaciones CRUD','Modelos de estudiantes'],
  RegistroEmpleados01: ['Listado','Formulario de registro o edición','Modelo de empleados'],
  camara: ['Servicios','Comparación de planes','Cotización'],
  CINEMATICA: ['Selección de forma de onda','Procesamiento de audio','Visualización de registros'],

  Balanza_Practica: ['Balanza USB', 'Aplicación Django', 'Registro en SQLite', 'Reporte Excel'],
  AGENTES: ['Solicitud del usuario', 'API FastAPI', 'Orquestación de agentes', 'Registro de actividad'],
  'EPILEPCIA-SMATRWACHT': ['Señales del wearable', 'Preparación de variables', 'Evaluación temporal', 'Comparación con referencia'],
  'limchile-whatsapp-intuitivo': ['Mensaje de texto o audio', 'WhatsApp API', 'Recuperación del catálogo (RAG)', 'Respuesta de beneficios'],
};

const roles = {
  AGENTES: {Python:'Ejecución de agentes y automatizaciones.', FastAPI:'API versionada para el panel local.', OAuth:'Autorización de integraciones.', SQLite:'Registro local de ejecuciones.'},
  JARVISHAGUER: {Python:'Procesamiento de comandos y scripts.', 'Raspberry Pi':'Equipo que ejecuta el asistente.', Vosk:'Reconocimiento local de voz.', 'Wake-on-LAN':'Encendido de equipos mediante Magic Packet.'},
  axoryn: {HTML:'Estructura del catálogo y las fichas.', CSS:'Presentación de los productos.', JavaScript:'Interacciones y simulación del pago.', localStorage:'Persistencia de datos en el navegador.'},
  rutanativa: {HTML:'Estructura de las vistas de compra.', CSS:'Diseño del catálogo y checkout.', JavaScript:'Interacciones del catálogo, compra y panel.', localStorage:'Persistencia en el navegador.'},
  'INACAP-Asistente-Local': {JavaScript:'Scripts e interacciones del panel.', 'Extensión de navegador':'Acceso al panel de asistencia.', Python:'Servicio local complementario.'},
  'seizurewatch-android-prototype-fixed': {Kotlin:'Lógica de la aplicación Android.', 'Jetpack Compose':'Interfaz del prototipo.', CameraX:'Captura de cámara para la estimación experimental.', Android:'Plataforma de ejecución.'},
  RegistroEstudiantes_IoT4: {'C#':'Modelos y operaciones de registro.', '.NET MAUI':'Base de la aplicación móvil.', XAML:'Definición de vistas CRUD.'},
  RegistroEmpleados01: {'C#':'Modelos y operaciones del registro.', '.NET MAUI':'Base de la aplicación móvil.', XAML:'Vistas de creación, edición y listado.'},
  camara: {HTML:'Estructura de servicios, planes y cotización.', CSS:'Diseño visual de las secciones.', JavaScript:'Interacciones del sitio.'},
  CINEMATICA: {JavaScript:'Selección de formas de onda e interacción.', HTML:'Estructura del contenido didáctico.', 'Web Audio':'Procesamiento de audio en el navegador.'},

  Balanza_Practica: {Python:'Procesamiento y automatización del registro.', Django:'Panel web y permisos por rol.', SQLite:'Almacenamiento local de los pesajes.', 'Serial / USB':'Comunicación con la balanza física.'},
  'limchile-whatsapp-intuitivo': {JavaScript:'Lógica del prototipo y manejo de mensajes.', 'Netlify Functions':'Funciones que atienden las solicitudes.', 'WhatsApp API':'Canal de entrada y respuesta.', Groq:'Interpretación de mensajes en el prototipo.'},
  'EPILEPCIA-SMATRWACHT': {TypeScript:'Lógica de la aplicación.', Python:'Procesamiento de señales y experimentos.', 'React Native':'Interfaz móvil.', 'scikit-learn':'Evaluación de modelos.'},
};

export function caseMarkup(project, {esc, label, tags, repositoryLink}) {
  const flow = architecture[project.repo];
  const stack = roles[project.repo];
  const balanza = project.repo === 'Balanza_Practica';
  const tabs = [
    ['Problema', '<p>' + esc(project.problem) + '</p>'],
    ['Arquitectura', '<p>' + esc(project.solution) + '</p>' +
      (flow ? '<ol class="architecture-flow" aria-label="Flujo de arquitectura">' + flow.map(value => '<li>' + esc(value) + '</li>').join('') + '</ol>' : '') +
      (stack ? '<dl class="stack-roles">' + project.tech.filter(value => stack[value]).map(value => '<dt>' + esc(value) + '</dt><dd>' + esc(stack[value]) + '</dd>').join('') + '</dl>' : '')],
    ['Evidencia', '<p>' + esc(project.evidence) + '</p><h3>Alcance</h3><p>' + esc(project.limit) + '</p>'],
  ];
  return `<article class="case-study">
    <header class="replay-heading">
      <p class="eyebrow">${esc(label)} · ${esc(project.status)}</p>
      <h2 id="panel-title" tabindex="-1">${esc(project.title)}</h2>
      <p>${esc(project.summary)}</p>
    </header>
    <div class="replay-layout">
      <figure class="replay-media">
        <img src="${esc(balanza ? scalePhoto : project.image)}" alt="${balanza ? 'Ilustración de una balanza de plataforma conectada a un portátil en una cocina' : ''}" width="640" height="380">
        <figcaption>Ilustración del proyecto</figcaption>
      </figure>
      <aside class="case-stack" aria-label="Tecnologías y enlaces">
        <h3>Tecnologías</h3>${tags(project)}
        <p>Selecciona una tecnología para filtrar el catálogo.</p>
        <div class="case-footer">${repositoryLink(project)}</div>
        <button type="button" class="share-project" data-share-project>Copiar enlace de la ficha</button>
        <p id="share-status" role="status"></p>
      </aside>
      <section class="replay-detail" aria-label="Detalle del proyecto">
        <div class="case-tabs" role="tablist" aria-label="Secciones de la ficha">
          ${tabs.map(([label], index) => `<button type="button" id="case-tab-${index}" role="tab" aria-controls="case-pane-${index}" aria-selected="${index===0}" tabindex="${index===0?0:-1}">${label}</button>`).join('')}
        </div>
        ${tabs.map(([, content], index) => `<div id="case-pane-${index}" role="tabpanel" tabindex="0" aria-labelledby="case-tab-${index}" ${index===0?'':'hidden'}>${content}</div>`).join('')}
      </section>
    </div>
  </article>`;
}

export function createCaseTabs(container) {
  const tabs = [...container.querySelectorAll('[role=tab]')];
  function activate(index, focus = false) {
    for (const [current, tab] of tabs.entries()) {
      tab.setAttribute('aria-selected', current === index);
      tab.tabIndex = current === index ? 0 : -1;
      container.querySelector('#' + tab.getAttribute('aria-controls')).hidden = current !== index;
    }
    if (focus) tabs[index].focus();
  }
  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      const next = {
        ArrowRight:(index + 1) % tabs.length, ArrowLeft:(index + tabs.length - 1) % tabs.length,
        Home:0, End:tabs.length - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      activate(next, true);
    });
  }
}

export async function shareProject(status) {
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = 'Enlace copiado.';
  } catch {
    status.textContent = url;
  }
}

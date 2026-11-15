const stops = [
  {
    repo: 'Balanza_Practica',
    title: 'Balanza de Mermas',
    context: 'Los talleres de Gastronomía necesitaban registrar residuos y retiros con pesajes trazables.',
    contribution: 'Implementé la captura del peso desde la balanza USB, los permisos por rol y la exportación de registros a Excel.',
    label: 'Probar un registro de pesaje',
    steps: [
      ['Capturar peso', 'Balanza USB simulada', 'Peso recibido: 2,45 kg'],
      ['Guardar registro', 'Registro de residuos', '2,45 kg · Taller de Gastronomía · Residuo orgánico'],
      ['Preparar exportación', 'Reporte de residuos', 'Registro listo para incluir en la exportación a Excel.'],
    ],
  },
  {
    repo: 'limchile-whatsapp-intuitivo',
    title: 'Bienestar LIM Chile',
    context: 'Los colaboradores necesitaban consultar convenios y beneficios desde el celular.',
    contribution: 'Desarrollé el prototipo de consulta por WhatsApp que interpreta mensajes de texto o audio y responde con información del catálogo.',
    label: 'Probar una consulta de beneficios',
    steps: [
      ['Consultar beneficio', 'Mensaje de ejemplo', '¿Qué beneficios están disponibles en mi zona?'],
      ['Revisar catálogo', 'Consulta del prototipo', 'Zona Centro · Convenios y beneficios disponibles en el catálogo de ejemplo'],
      ['Ver respuesta', 'Respuesta de ejemplo', 'Estos son los convenios de tu zona. Selecciona una categoría para ver el detalle.'],
    ],
  },
  {
    repo: 'EPILEPCIA-SMATRWACHT',
    title: 'SeizureWatch',
    context: 'El proyecto explora cómo analizar señales de wearables y evaluar un pronóstico experimental de episodios.',
    contribution: 'Trabajé en el procesamiento de señales y en la evaluación temporal frente a una referencia basada en la hora.',
    label: 'Explorar el flujo de investigación',
    steps: [
      ['Cargar muestra', 'Señales sintéticas', 'Ventana de ejemplo · movimiento y pulso'],
      ['Procesar señales', 'Preparación de variables', 'Se resumen las señales y se comprueba su cobertura antes de evaluar.'],
      ['Ver evaluación', 'Resultado experimental', 'Se comparan las alertas retrospectivas con la referencia horaria. El prototipo sigue en investigación.'],
    ],
  },
];

const panel = document.getElementById('panel-content');
export function createTour({show, openProject, openCatalog}) {
  let stopIndex = 0;
  let demoIndex = -1;

  function draw() {
    const stop = stops[stopIndex];
    show(`<p class="eyebrow">RECORRIDO GUIADO · ${stopIndex + 1} DE ${stops.length}</p>
      <h2 id="panel-title">${stop.title}</h2>
      <nav class="tour-stops" aria-label="Paradas del recorrido">
        ${stops.map((item, index) => `<button type="button" data-tour-stop="${index}" ${index === stopIndex ? 'aria-current="step"' : ''}>${item.title}</button>`).join('')}
      </nav>
      <div class="profile-grid tour-story">
        <section><h3>Qué problema resolvía</h3><p>${stop.context}</p></section>
        <section><h3>Mi aporte</h3><p>${stop.contribution}</p></section>
      </div>
      <section class="tour-demo" aria-labelledby="demo-title">
        <div><h3 id="demo-title">${stop.label}</h3><p>Demostración con datos de ejemplo</p></div>
        <div class="tour-demo-screen" role="status"></div>
        <button type="button" data-tour-demo class="tour-demo-button"></button>
      </section>
      <footer class="tour-navigation">
        <button type="button" data-tour-detail>Ver ficha completa</button>
        <button type="button" data-tour-next class="primary">${stopIndex === stops.length - 1 ? 'Explorar los 13 proyectos' : 'Siguiente proyecto →'}</button>
      </footer>`);
    drawDemo();
  }

  function drawDemo() {
    const stop = stops[stopIndex];
    const step = stop.steps[demoIndex];
    const screen = panel.querySelector('.tour-demo-screen');
    screen.innerHTML = step ? `<strong>${step[1]}</strong><p>${step[2]}</p>` : '<p>Inicia la demostración para ver el flujo.</p>';
    panel.querySelector('[data-tour-demo]').textContent = stop.steps[demoIndex + 1]?.[0] ?? 'Reiniciar demostración';
  }

  function select(index) {
    stopIndex = index;
    demoIndex = -1;
    draw();
  }

  panel.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if ('tourStop' in button.dataset) select(Number(button.dataset.tourStop));
    if ('tourDemo' in button.dataset) {
      demoIndex = demoIndex + 1 === stops[stopIndex].steps.length ? -1 : demoIndex + 1;
      drawDemo();
    }
    if ('tourDetail' in button.dataset) openProject(stops[stopIndex].repo);
    if ('tourNext' in button.dataset) {
      if (stopIndex === stops.length - 1) openCatalog();
      else select(stopIndex + 1);
    }
  });

  return { start: () => select(0), resume: draw };
}

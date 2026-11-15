const cases = [
  {
    repo:'limchile-whatsapp-intuitivo', x:0, z:-43, name:'Marcador norte', sign:'BIENESTAR LIM CHILE',
    title:'Bienestar LIM Chile', status:'Plataforma en uso empresarial',
    proof:'Mantenedor de beneficios con segmentación y flujo editorial.',
    summary:'Plataforma de beneficios y campañas que LIM Chile usa para publicar información de bienestar.',
    solution:'Mantenedor con segmentación por zonas y revisión antes de publicación. Desarrollé además una integración para consultar beneficios por WhatsApp y un flujo RAG que recupera información del catálogo para responder.',
    evidence:'La plataforma está en uso empresarial. El repositorio enlazado documenta el prototipo de WhatsApp y sus pruebas locales de búsqueda.',
    limit:'La ficha describe la plataforma en uso y el prototipo de integración. El catálogo del repositorio es demostrativo.',
  },
  {
    repo:'Balanza_Practica', x:-27.2, z:-20, name:'Estación de pesaje', sign:'BALANZA DE MERMAS',
    status:'En uso en Gastronomía de INACAP', proof:'Del pesaje por USB al registro y al reporte Excel.',
  },
  {
    repo:'EPILEPCIA-SMATRWACHT', x:27.1, z:16, name:'Sala de análisis', sign:'SEIZUREWATCH',
    status:'Investigación experimental', proof:'Evaluación temporal con datos de wearables.',
  },
];

export function enrichCatalog(projects) {
  return projects.map(project => {
    const entry = cases.find(item => item.repo === project.repo);
    if (!entry) return project;
    const {title, status, solution, evidence, summary, limit} = entry;
    return {...project, title:title ?? project.title, status, solution:solution ?? project.solution,
      evidence:evidence ?? project.evidence, summary:summary ?? project.summary, limit:limit ?? project.limit};
  });
}

export function featuredProjects(projects) {
  return cases.flatMap(entry => {
    const project=projects.find(item=>item.repo===entry.repo);
    return project ? [{...entry,p:project}] : [];
  });
}

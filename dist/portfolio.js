(() => {
  'use strict';
  const grid = document.getElementById('project-grid');
  const search = document.getElementById('search');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty');
  const dialog = document.getElementById('project-dialog');
  const content = document.getElementById('dialog-content');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let projects = [];
  let category = 'Todos';
  let returnFocus = null;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normal = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const tags = p => `<ul class="tags" aria-label="Tecnologías">${p.tech.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  function render(print = false) {
    const query = normal(search.value.trim());
    const visible = print ? projects : projects.filter(p => (category === 'Todos' || p.category === category) && normal([p.title,p.repo,p.category,p.summary,...p.tech].join(' ')).includes(query));
    grid.innerHTML = visible.map(p => `<article class="project-card"><div class="card-media"><img src="${esc(p.image)}" alt="Ilustración conceptual de ${esc(p.title)}" width="640" height="380" loading="lazy">${p.featured ? '<span class="feature-flag">PROYECTO DESTACADO</span>' : ''}</div><div class="card-body"><p class="card-category">${esc(p.category)}</p><h3>${esc(p.title)}</h3><p class="card-description">${esc(p.summary)}</p>${tags(p)}<div class="card-bottom"><span class="card-status">${esc(p.status)}</span><button class="detail-button" data-project="${esc(p.repo)}" aria-label="Ver ficha de ${esc(p.title)}">Ver proyecto <span aria-hidden="true">↗</span></button></div></div></article>`).join('');
    count.textContent = `${visible.length} de ${projects.length} repositorios públicos${category !== 'Todos' ? ' · ' + category : ''}`;
    empty.hidden = visible.length !== 0;
  }
  function choose(value) {
    category = value;
    filters.forEach(b => { const active = b.dataset.filter === value; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
    render();
  }
  filters.forEach(b => b.addEventListener('click',() => choose(b.dataset.filter)));
  search.addEventListener('input',() => render());
  document.getElementById('reset').addEventListener('click',() => { search.value=''; choose('Todos'); search.focus(); });
  grid.addEventListener('click',event => {
    const button = event.target.closest('[data-project]');
    if (!button) return;
    const p = projects.find(p => p.repo === button.dataset.project);
    if (!p) return;
    returnFocus = button;
    content.innerHTML = `<img class="dialog-image" src="${esc(p.image)}" alt="Ilustración conceptual de ${esc(p.title)}"><div class="dialog-inner"><p class="dialog-caption">Ilustración conceptual · no es una captura de la aplicación</p><p class="card-category">${esc(p.category)} · ${esc(p.status)}</p><h2 id="dialog-title">${esc(p.title)}</h2><p>${esc(p.summary)}</p>${tags(p)}<div class="case-grid"><section><h3>El problema</h3><p>${esc(p.problem)}</p></section><section><h3>La propuesta</h3><p>${esc(p.solution)}</p></section><section><h3>Evidencia en el repositorio</h3><p>${esc(p.evidence)}</p></section><section><h3>Repositorio público</h3><p>${esc(p.repo)}</p></section></div><div class="case-limit"><strong>ESTADO Y ALCANCE</strong>${esc(p.limit)}</div><a class="button primary" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Explorar código en GitHub <span aria-hidden="true">↗</span></a></div>`;
    dialog.showModal();
    document.body.style.overflow='hidden';
  });
  document.getElementById('close-dialog').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close(); } });
  dialog.addEventListener('close',() => { document.body.style.overflow=''; returnFocus?.focus(); });
  document.getElementById('copy-github').addEventListener('click',async () => {
    const status = document.getElementById('copy-status');
    try { await navigator.clipboard.writeText('https://github.com/Rhaguer'); status.textContent='Enlace copiado al portapapeles.'; }
    catch { status.textContent='Enlace del perfil: https://github.com/Rhaguer'; }
  });
  document.getElementById('print-profile').addEventListener('click',() => { if(dialog.open) dialog.close(); window.print(); });
  window.addEventListener('beforeprint',() => render(true));
  window.addEventListener('afterprint',() => render());
  fetch('projects.json').then(r => { if(!r.ok) throw new Error('No se pudo cargar el catálogo'); return r.json(); }).then(data => { projects=data; render(); }).catch(() => {
    count.innerHTML='No fue posible cargar las fichas. <a href="https://github.com/Rhaguer?tab=repositories">Consultar los repositorios en GitHub ↗</a>';
  });
})();

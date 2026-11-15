const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let projects=[],catalogError=false,game=null,returnFocus=null;
const repositoryLink = p => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Ver repositorio en GitHub ↗</a><p class="repo-note">Repositorio privado. GitHub requiere acceso autorizado.</p>`;
const catalog=fetch('./projects.json').then(r=>{if(!r.ok)throw Error('Catálogo no disponible');return r.json()}).then(data=>{projects=data;return data}).catch(()=>{catalogError=true;return []});
const tags=p=>`<div class="tags">${p.tech.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;
function show(html){const panel=$('panel');if(!panel.open)returnFocus=document.activeElement;$('panel-content').innerHTML=html;if(!panel.open)panel.showModal();else $('close').focus();panel.scrollTop=0;game?.pause(true)}
function project(p){if(!p)return;show(`${lastListing ? '<button class="back-projects" data-back-projects type="button">← Volver a proyectos</button>' : ''}<p class="eyebrow">${esc(p.category)} / ${esc(p.status)}</p><h2 id="panel-title">${esc(p.title)}</h2><img class="project-image" src="${esc(p.image)}" alt="Ilustración conceptual de ${esc(p.title)}"><p>Ilustración conceptual; no es una captura de la aplicación.</p><p>${esc(p.summary)}</p>${tags(p)}<div class="profile-grid"><section><h3>El problema</h3><p>${esc(p.problem)}</p></section><section><h3>La propuesta</h3><p>${esc(p.solution)}</p></section><section><h3>Evidencia</h3><p>${esc(p.evidence)}</p></section><section><h3>Estado y alcance</h3><p>${esc(p.limit)}</p></section></div>${repositoryLink(p)}`)}
const categoryLabels = {
  'Desarrollo web': 'Web',
  'Automatización': 'Automatización',
  'IoT y datos': 'IoT y datos',
  'Aplicaciones móviles': 'Móvil',
};
let lastListing;
function listing(category = '', query = '') {
  let activeCategory = category || '';
  const filters = [['', 'Todos'], ...Object.entries(categoryLabels)];
  show(`<h2 id="panel-title">Proyectos</h2>
    <label for="project-search">Buscar por nombre o tecnología</label>
    <input type="search" id="project-search" placeholder="Python, automatización, Django…">
    <div class="catalog-filters" role="group" aria-label="Filtrar proyectos por categoría">
      ${filters.map(([value, label]) => `<button type="button" data-category="${esc(value)}">${esc(label)}</button>`).join('')}
    </div>
    <p id="results" role="status"></p><div id="project-list" class="project-list"></div>`);
  const input = $('project-search');
  const filterButtons = [...$('panel-content').querySelectorAll('[data-category]')];
  input.value = query;
  function render() {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    const data = projects.filter(p => {
      const text = normalize([p.title, p.repo, p.category, p.summary, ...p.tech].join(' '));
      return (!activeCategory || p.category === activeCategory) && terms.every(term => text.includes(term));
    });
    for (const button of filterButtons) button.setAttribute('aria-pressed', button.dataset.category === activeCategory);
    $('results').textContent = `${data.length} de ${projects.length} proyectos documentados`;
    $('project-list').innerHTML = catalogError
      ? '<p>No fue posible cargar las fichas. <a href="./classic.html#proyectos">Abrir el catálogo en Vista Clásica ↗</a></p>'
      : data.map(p => `<article class="project">
        <img src="${esc(p.image)}" alt="" loading="lazy" width="640" height="380">
        <p class="project-kicker">${esc(categoryLabels[p.category])}</p>
        <h3><button type="button" data-project="${esc(p.repo)}">${esc(p.title)} ↗</button></h3>
        <p>${esc(p.summary)}</p>${tags(p)}
      </article>`).join('') || '<p>No hay coincidencias. Prueba con otra tecnología o nombre.</p>';
  }
  function update() {
    lastListing = { category: activeCategory, query: input.value };
    render();
  }
  input.addEventListener('input', update);
  for (const button of filterButtons) button.onclick = () => {
    activeCategory = button.dataset.category;
    update();
  };
  update();
}
catalog.then(() => {
  $('home-projects').innerHTML = projects.filter(p => p.featured).slice(0, 3).map(p =>
    `<button type="button" class="home-card" data-home-project="${esc(p.repo)}">
      <img src="${esc(p.image)}" width="640" height="380" alt="">
      <span><small>${esc(categoryLabels[p.category])}</small><strong>${esc(p.title)}</strong></span>
      <span aria-hidden="true">↗</span>
    </button>`).join('');
});
$('home-projects').addEventListener('click', e => {
  const card = e.target.closest('[data-home-project]');
  if (card) { lastListing = null; project(projects.find(p => p.repo === card.dataset.homeProject)); }
});
function open(kind){if(kind==='profile')show(`<p class="eyebrow">02 / PERFIL PROFESIONAL · SANTIAGO, CHILE</p><h2 id="panel-title">Ricardo Haguer</h2><p>Software, datos y automatización. Conecto aplicaciones, información y dispositivos para resolver problemas concretos.</p><p>Estudiante de Ingeniería en Informática en INACAP Puente Alto. Durante mi práctica profesional en Eknow trabajé en automatización, análisis de datos y seguimiento de riesgos de seguridad de la información.</p><div class="profile-grid"><section><h3>Desarrollo de software</h3><p>Python, Django, JavaScript, TypeScript, C#, .NET MAUI y Kotlin.</p></section><section><h3>Datos e integración</h3><p>SQL, PostgreSQL, SQLite, Power BI, n8n e integración con dispositivos e IoT.</p></section><section><h3>Seguridad como criterio</h3><p>SGSI, Wazuh, CIS Controls, MITRE ATT&CK, permisos, auditoría y trazabilidad.</p></section></div><button class="primary" id="print">Imprimir Perfil / CV</button>`);else if(kind==='skills')show(`<p class="eyebrow">03 / FORMA DE TRABAJAR</p><h2 id="panel-title">Entender. Construir. Verificar.</h2><h3>01 Contexto · Partir del problema</h3><p>Identificar quién usa la solución, qué necesita y qué restricciones tiene.</p><h3>02 Implementación · Conectar las piezas</h3><p>Diseñar interfaces, servicios y datos con responsabilidades claras.</p><h3>03 Evidencia · Mostrar lo comprobable</h3><p>Documentar el código, las pruebas y las limitaciones de cada proyecto.</p>`);else if(kind==='contact')show(`<p class="eyebrow">04 / CONTACTO & GITHUB</p><h2 id="panel-title">Conectemos ideas y tecnología.</h2><p>Interés en oportunidades de desarrollo de software, automatización e integración. Santiago, Chile.</p><div class="contact-buttons"><a href="https://github.com/Rhaguer" target="_blank" rel="noopener noreferrer">GitHub · @Rhaguer ↗</a><button id="copy">Copiar enlace del perfil</button></div><p id="copy-status" role="status"></p>`);else listing(kind==='all'?null:kind)}
$('panel-content').addEventListener('click',async e=>{const b=e.target.closest('[data-project]');if(e.target.closest('[data-back-projects]')&&lastListing)listing(lastListing.category,lastListing.query);if(b)project(projects.find(p=>p.repo===b.dataset.project));if(e.target.id==='print')window.print();if(e.target.id==='copy'){try{await navigator.clipboard.writeText('https://github.com/Rhaguer');$('copy-status').textContent='Enlace copiado al portapapeles.'}catch{$('copy-status').textContent='Enlace del perfil: https://github.com/Rhaguer'}}});
$('close').onclick=()=>$('panel').close();$('panel').addEventListener('close',()=>{game?.pause(false);returnFocus?.isConnected&&returnFocus.focus()});$('panel').addEventListener('click',e=>{if(e.target===$('panel')){const r=$('panel').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('panel').close()}});
document.querySelectorAll('[data-open]').forEach(b => b.onclick = async e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (b.dataset.open === 'all') await catalog;
  open(b.dataset.open);
});
$('enter').onclick=async()=>{const b=$('enter');b.disabled=true;$('loading').textContent='Preparando el campo…';try{const [{createGame}]=await Promise.all([import('./scene.js'),catalog]);game=await createGame({container:$('world'),projects,onOpen:open,onProject:p=>{lastListing=null;project(p)},onFailure:()=>location.assign('./classic.html'),onZone:(label,hint)=>{$('zone-label').textContent=label;$('hint').textContent=hint},onTouchdown:()=>{$('announcement').textContent='TOUCHDOWN';setTimeout(()=>$('announcement').textContent='',1400)}});$('graphics').textContent=game.backend;
 $('map').onclick=()=>{
   const active=game.toggleMap();
   $('map').setAttribute('aria-pressed', active);
   $('map').textContent=active?'Volver al campo':'Mapa';
 };
 $('welcome').hidden=true;$('play-hud').hidden=false;$('world').focus({preventScroll:true});$('interact').onclick=()=>game.action(true);$('snow').disabled=false;$('sound').disabled=false;$('touch-action').onclick=()=>game.action();$('snow').onclick=()=>{const enabled=game.toggleSnow();$('snow').setAttribute('aria-pressed',enabled);$('snow').textContent='Nieve: '+(enabled?'sí':'no')};$('sound').onclick=()=>{const enabled=game.toggleSound();$('sound').setAttribute('aria-pressed',enabled);$('sound').textContent='Sonido: '+(enabled?'sí':'no')};}catch(error){console.error(error);$('loading').textContent='El estadio 3D no está disponible en este navegador. Puedes explorar los proyectos aquí mismo.';b.disabled=false}};

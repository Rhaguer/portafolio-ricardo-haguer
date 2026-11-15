import { createTour } from './tour.js';
import { caseMarkup, createCaseTabs, shareProject } from './case-study.js';

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let projects=[],catalogError=false,game=null,returnFocus=null;
const repositoryLink = p => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Ver repositorio en GitHub ↗</a><p class="repo-note">Repositorio privado. GitHub requiere acceso autorizado.</p>`;
const catalog=fetch('./projects.json').then(r=>{if(!r.ok)throw Error('Catálogo no disponible');return r.json()}).then(data=>{projects=data;return data}).catch(()=>{catalogError=true;return []});
const tags = p => `<div class="tags" aria-label="Tecnologías">${p.tech.map(t => `<button type="button" class="tech-pill" data-tech="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
function show(html) {
  const panel=$('panel');
  panel.classList.remove('replay-panel');
  if(!panel.open)returnFocus=document.activeElement;
  $('panel-content').innerHTML=html;
  if(!panel.open)panel.showModal();
  else ($('panel-title')?.matches('[tabindex]')?$('panel-title'):$('close')).focus({preventScroll:true});
  panel.scrollTop=0;
  game?.pause(true);
}
const projectHash = repo => '#proyecto/' + encodeURIComponent(repo);
function clearProjectLink() {
  if (location.hash.startsWith('#proyecto/')) history.replaceState(null, '', location.pathname + location.search);
}
function project(p, fromTour = false) {
  if (!p) return;
  const back = fromTour
    ? '<button class="back-projects" data-tour-return type="button">← Volver al recorrido</button>'
    : lastListing ? '<button class="back-projects" data-back-projects type="button">← Volver a proyectos</button>' : '';
  history.replaceState(null, '', projectHash(p.repo));
  show(back + caseMarkup(p, {esc, label:categoryLabels[p.category], tags, repositoryLink}));
  $('panel').classList.add('replay-panel');
  createCaseTabs($('panel-content'));
}
async function openSharedProject() {
  const match = location.hash.match(/^#proyecto\/([^/]+)$/);
  if (!match) return;
  await catalog;
  try { project(projects.find(p => p.repo === decodeURIComponent(match[1]))); }
  catch (error) { if (!(error instanceof URIError)) throw error; }
}
window.addEventListener('hashchange', openSharedProject);
openSharedProject();
const categoryLabels = {
  'Desarrollo web': 'Web',
  'Automatización': 'Automatización',
  'IoT y datos': 'IoT y datos',
  'Aplicaciones móviles': 'Móvil',
};
let lastListing;
function listing(category = '', query = '') {
  clearProjectLink();
  let activeCategory = category || '';
  const filters = [['', 'Todos'], ...Object.entries(categoryLabels)];
  show(`<h2 id="panel-title" tabindex="-1">Proyectos</h2>
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
function open(kind){if(kind==='profile')show(`<p class="eyebrow">02 / PERFIL PROFESIONAL · SANTIAGO, CHILE</p><h2 id="panel-title">Ricardo Haguer</h2><p>Software, datos y automatización. Conecto aplicaciones, información y dispositivos para resolver problemas concretos.</p><p>Estudiante de Ingeniería en Informática en INACAP Puente Alto. Durante mi práctica profesional en Eknow trabajé en automatización, análisis de datos y seguimiento de riesgos de seguridad de la información.</p><div class="profile-grid"><section><h3>Desarrollo de software</h3><p>Python, Django, JavaScript, TypeScript, C#, .NET MAUI y Kotlin.</p></section><section><h3>Datos e integración</h3><p>SQL, PostgreSQL, SQLite, Power BI, n8n e integración con dispositivos e IoT.</p></section><section><h3>Seguridad como criterio</h3><p>SGSI, Wazuh, CIS Controls, MITRE ATT&CK, permisos, auditoría y trazabilidad.</p></section></div><button class="primary" id="print">Imprimir Perfil / CV</button>`);else if(kind==='skills')show(`<p class="eyebrow">03 / FORMA DE TRABAJAR</p><h2 id="panel-title">Entender. Construir. Verificar.</h2><h3>01 Contexto · Partir del problema</h3><p>Identificar quién usa la solución, qué necesita y qué restricciones tiene.</p><h3>02 Implementación · Conectar las piezas</h3><p>Diseñar interfaces, servicios y datos con responsabilidades claras.</p><h3>03 Evidencia · Mostrar lo comprobable</h3><p>Documentar el código, las pruebas y las limitaciones de cada proyecto.</p>`);else if(kind==='contact')show(`<section class="contact-card">
    <div class="case-hero contact-hero"><div>
      <p class="eyebrow">${game?.inLocker ? 'CAMARÍN · CONTACTO' : 'CONTACTO'}</p>
      <h2 id="panel-title" tabindex="-1">Conectemos ideas y tecnología.</h2>
      <p>Interés en oportunidades de desarrollo de software, automatización e integración. Santiago, Chile.</p>
    </div></div>
    <div class="contact-buttons">
      <a href="https://github.com/Rhaguer" target="_blank" rel="noopener noreferrer">GitHub · @Rhaguer ↗</a>
      <button id="copy" type="button">Copiar enlace del perfil</button>
    </div>
    <p id="copy-status" role="status"></p>
  </section>`);else listing(kind==='all'?null:kind)}
const tour = createTour({
  show,
  openProject: repo => project(projects.find(p => p.repo === repo), true),
  openCatalog: () => listing(),
});
document.querySelectorAll('[data-tour]').forEach(button => button.addEventListener('click', async () => {
  await catalog;
  tour.start();
}));
$('panel-content').addEventListener('click', event => {
  if (event.target.closest('[data-tour-return]')) { clearProjectLink(); tour.resume(); }
});
$('panel-content').addEventListener('click',async e=>{const b=e.target.closest('[data-project]');if(e.target.closest('[data-back-projects]')&&lastListing)listing(lastListing.category,lastListing.query);if(b)project(projects.find(p=>p.repo===b.dataset.project));if(e.target.id==='print')window.print();if(e.target.id==='copy'){try{await navigator.clipboard.writeText('https://github.com/Rhaguer');$('copy-status').textContent='Enlace copiado al portapapeles.'}catch{$('copy-status').textContent='Enlace del perfil: https://github.com/Rhaguer'}}});
$('close').onclick=()=>$('panel').close();$('panel').addEventListener('close',()=>{clearProjectLink();game?.pause(false);if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus();else if(game)$('world').focus()});$('panel').addEventListener('click',e=>{if(e.target===$('panel')){const r=$('panel').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('panel').close()}});
const menu=$('pause-menu');
let menuAction;
$('game-menu').onclick=()=>{
  game.pause(true);
  menu.showModal();
};
menu.addEventListener('close',()=>{
  if(menuAction){
    const action=menuAction;
    menuAction=null;
    action();
  }
  if(!$('panel').open){
    game.pause(false);
    $('world').focus({preventScroll:true});
  }
});
function afterMenu(action){menuAction=action;menu.close();}
const goToContact=()=>{
  if(!game||game.inLocker){open('contact');return;}
  game.guideToTunnel();
  $('world').focus({preventScroll:true});
};
for(const button of document.querySelectorAll('[data-pause-open]')){
  button.onclick=()=>afterMenu(()=>button.dataset.pauseOpen==='contact'?goToContact():open(button.dataset.pauseOpen));
}
$('pause-tour').onclick=()=>afterMenu(tour.start);
$('leave-room').onclick=()=>{game.leaveLocker();$('world').focus({preventScroll:true});};
$('panel-content').addEventListener('click',event=>{
  const tech=event.target.closest('[data-tech]');
  if(tech)listing('',tech.dataset.tech);
  if(event.target.closest('[data-share-project]'))shareProject($('share-status'));
});
const fieldDestinations=new Map();
function initFieldProjects() {
  const featured=projects.filter(item=>item.featured);
  for(const item of projects)if(featured.length<4&&!featured.includes(item))featured.push(item);
  $('field-cards').innerHTML=featured.slice(0,4).map((item,index)=>`<button type="button" data-field-project="${esc(item.repo)}">
    <img src="${esc(item.image)}" width="64" height="44" alt=""><span><small>${index+1} · ${esc(categoryLabels[item.category])}</small><strong>${esc(item.title)}</strong></span>
  </button>`).join('');
  $('field-markers').innerHTML=featured.slice(0,4).map((item,index)=>`<button type="button" data-field-project="${esc(item.repo)}" hidden><span aria-hidden="true">${index+1}</span>${esc(item.title)}</button>`).join('');
  for(const button of $('field-markers').querySelectorAll('[data-field-project]'))fieldDestinations.set(button.dataset.fieldProject,button);
}
$('play-hud').addEventListener('click',event=>{
  const button=event.target.closest('[data-field-project]');
  if(!button)return;
  $('field-directory').open=false;
  game.openDestination(button.dataset.fieldProject);
});
let statusClock;
function status(message){
  $('game-status').textContent=message;
  clearTimeout(statusClock);
  statusClock=setTimeout(()=>$('game-status').textContent='',2200);
}
document.querySelectorAll('[data-open]').forEach(b => b.onclick = async e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (b.dataset.open === 'all') await catalog;
  if(b.dataset.open==='contact')goToContact();
  else open(b.dataset.open);
});
$('enter').onclick=async()=>{
  const button=$('enter');
  button.disabled=true;
  $('loading').textContent='Preparando el campo…';
  try{
    const [{createGame}]=await Promise.all([import('./scene.js'),catalog]);
    initFieldProjects();
    game=await createGame({
      container:$('world'),projects,onOpen:open,
      onProject:p=>{lastListing=null;project(p);},
      onFailure:()=>location.assign('./classic.html'),
      onStatus:status,
      onDestinations:placements=>{
        for(const {repo,x,y,visible} of placements){
          const button=fieldDestinations.get(repo);
          if(!button)continue;
          button.hidden=!visible;
          if(visible)button.style.transform=`translate3d(${Math.round(x)}px,${Math.round(y)}px,0) translate(-50%,-100%)`;
        }
      },
      onQuality:level=>{
        const labels={light:'ligera',balanced:'equilibrada',high:'alta'};
        $('graphics-state').textContent='Calidad automática · '+labels[level];
      },
      onRoom:inside=>{
        $('leave-room').hidden=!inside;
        $('map').disabled=inside;
        $('map').setAttribute('aria-pressed','false');
        $('map').textContent='Mapa aéreo';
      },
      onZone:(label,hint,action,canPass)=>{
        $('zone-label').textContent=label;
        $('hint').textContent=hint;
        $('interact').textContent=action;
        $('touch-action').textContent=action;
        $('pass-action').hidden=!canPass||action==='Pasar a #87';
      },
      onTouchdown:()=>{
        $('announcement').textContent='TOUCHDOWN';
        setTimeout(()=>$('announcement').textContent='',1400);
      },
    });
    $('graphics-backend').textContent=game.backend;
    $('play-mode').onclick=()=>afterMenu(()=>{
      const active=game.togglePlayMode();
      $('play-mode').setAttribute('aria-pressed',active);
      $('play-mode').textContent=active?'Volver a recorrido libre':'Activar jugada rápida';
    });
    $('camera-center').onclick=()=>afterMenu(()=>game.centerCamera());
    $('map').onclick=()=>afterMenu(()=>{
      const active=game.toggleMap();
      $('map').setAttribute('aria-pressed',active);
      $('map').textContent=active?'Volver al campo':'Mapa aéreo';
    });
    $('welcome').hidden=true;
    $('play-hud').hidden=false;
    $('game-menu').hidden=false;
    if($('panel').open)game.pause(true);
    else $('world').focus({preventScroll:true});
    $('interact').onclick=$('touch-action').onclick=()=>{
      if($('interact').textContent==='Pasar a #87')game.pass();
      else game.action(true);
    };
    $('pass-action').onclick=()=>game.pass();
    $('snow').onclick=()=>{
      const enabled=game.toggleSnow();
      $('snow').setAttribute('aria-pressed',enabled);
      $('snow').textContent='Nieve: '+(enabled?'sí':'no');
    };
    $('sound').onclick=()=>{
      const enabled=game.toggleSound();
      $('sound').setAttribute('aria-pressed',enabled);
      $('sound').textContent='Sonido: '+(enabled?'sí':'no');
    };
  }catch(error){
    console.error(error);
    $('loading').textContent='El estadio 3D no está disponible en este navegador. Puedes explorar los proyectos aquí mismo.';
    button.disabled=false;
  }
};

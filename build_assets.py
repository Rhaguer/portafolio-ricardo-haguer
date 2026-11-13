"""Ilustraciones vectoriales originales y catálogo editorial verificado en GitHub."""
import json, math
from pathlib import Path
from html import escape

ROOT = Path(__file__).parent
OUT = ROOT / 'dist'
ASSETS = OUT / 'assets'
ASSETS.mkdir(exist_ok=True)

projects = [
 dict(repo='Balanza_Practica',title='Balanza de residuos',category='IoT y datos',status='Proyecto de título',tech=['Python','Django','SQLite','Serial / USB'],summary='Del pesaje al registro: gestión de residuos, retiros y reportes desde una aplicación web.',problem='Registrar residuos y retiros con trazabilidad, roles diferenciados y conexión con una balanza.',solution='Aplicación Django con panel operativo, permisos, integración serial y exportación de reportes XLSX.',evidence='El repositorio documenta instalación portable, respaldos, roles y preparación del despliegue.',limit='La conexión física depende del equipo y sus controladores. El despliegue requiere configuración del entorno.',kind='scale',featured=True),
 dict(repo='AGENTES',title='HAGUER Agent Platform',category='Automatización',status='Plataforma local',tech=['Python','FastAPI','OAuth','SQLite'],summary='Orquestación de agentes, integraciones y tareas con permisos, aprobaciones y auditoría.',problem='Coordinar tareas de productividad sin perder control sobre las acciones y los permisos.',solution='API versionada y panel local con agentes, automatizaciones, RBAC y registro de ejecuciones.',evidence='Incluye documentación de arquitectura, scripts de instalación, pruebas y un informe de validación.',limit='Las integraciones reales requieren configurar OAuth y los permisos de cada servicio.',kind='agents',featured=True),
 dict(repo='EPILEPCIA-SMATRWACHT',title='SeizureWatch · investigación',category='IoT y datos',status='Investigación experimental',tech=['TypeScript','Python','React Native','scikit-learn'],summary='Procesamiento de señales de wearables y evaluación temporal de una línea base de pronóstico.',problem='Estudiar señales de movimiento y pulso con un protocolo reproducible y métricas verificables.',solution='Motor TypeScript, ingesta E4 y modelos experimentales con separación cronológica y evaluación portable.',evidence='14 pruebas Python y 21.402 decisiones coincidentes entre Python y TypeScript en el experimento publicado.',limit='El modelo no mejoró la referencia horaria. Sin validación clínica, captura de reloj verificada ni APK funcional comprobada.',kind='watch',featured=True),
 dict(repo='JARVISHAGUER',title='JARVIS · voz y automatización',category='Automatización',status='Prototipo documentado',tech=['Python','Raspberry Pi','Vosk','Wake-on-LAN'],summary='Reconocimiento de voz local para encender un equipo y preparar el espacio de trabajo.',problem='Reducir pasos repetitivos al iniciar una sesión de trabajo sin automatizar credenciales.',solution='Raspberry Pi con Vosk, Magic Packet por Ethernet, servicio systemd y scripts para Windows.',evidence='El código incluye pruebas unitarias, diagnóstico, instalación y documentación del flujo completo.',limit='Las pruebas de micrófono, BIOS y encendido físico siguen siendo manuales.',kind='voice'),
 dict(repo='axoryn',title='Axoryn Auto',category='Desarrollo web',status='Demo de e-commerce',tech=['HTML','CSS','JavaScript','localStorage'],summary='Experiencia de compra de repuestos con catálogo, favoritos, carrito y checkout de demostración.',problem='Organizar un catálogo automotriz y construir una experiencia de compra clara.',solution='Interfaz estática con fichas de producto, persistencia local y simulación de pago.',evidence='Incluye documentación técnica, validación y créditos de las imágenes del catálogo.',limit='Precios, stock y pagos son demostrativos. No procesa cobros ni datos bancarios reales.',kind='auto'),
 dict(repo='rutanativa',title='Ruta Nativa',category='Desarrollo web',status='Proyecto académico en equipo',tech=['HTML','CSS','JavaScript','localStorage'],summary='Tienda conceptual de ciclismo urbano con catálogo, carrito y administración de demostración.',problem='Representar un flujo completo de compra y su gestión en un proyecto académico.',solution='Páginas de catálogo, detalle, resumen, checkout y panel administrativo.',evidence='El repositorio incluye una página de criterios y trazabilidad de la evaluación.',limit='La empresa, los productos y el pago son de demostración. No se efectúan cobros.',kind='bike'),
 dict(repo='limchile-whatsapp-intuitivo',title='Bienestar por WhatsApp',category='Automatización',status='Prototipo de integración',tech=['JavaScript','Netlify Functions','WhatsApp API','Groq'],summary='Consulta de beneficios por texto o audio con respuestas limitadas a un catálogo estructurado.',problem='Facilitar el acceso a información de bienestar sin generar beneficios inexistentes.',solution='Webhook con validación HMAC, transcripción de audio y búsqueda determinística o semántica.',evidence='Incluye pruebas locales del motor de búsqueda y contratos de integración documentados.',limit='El catálogo incluido es demostrativo. Requiere credenciales de Meta y servicios de información reales.',kind='chat'),
 dict(repo='INACAP-Asistente-Local',title='Asistente INACAP',category='Automatización',status='Demo local',tech=['JavaScript','Extensión de navegador','Python'],summary='Asistente de navegación que trabaja con el contenido visible de la página.',problem='Ayudar a encontrar información y opciones presentes en una interfaz institucional.',solution='Scripts y extensión con panel de asistencia y un servicio local complementario.',evidence='El README describe la demo local y el repositorio incorpora extensión y documentación de seguridad.',limit='La integración institucional y su autorización deben comprobarse. No se presenta como producto oficial de INACAP.',kind='assistant'),
 dict(repo='seizurewatch-android-prototype-fixed',title='SeizureWatch · Android',category='Aplicaciones móviles',status='Prototipo nativo',tech=['Kotlin','Jetpack Compose','CameraX','Android'],summary='Exploración de medición de pulso con cámara e interfaz de monitorización en Android.',problem='Explorar la captura y presentación de señales desde una aplicación nativa.',solution='Pantalla CameraX, estimador experimental de pulso, modelos y panel de riesgo separado.',evidence='Incluye configuración Gradle y una guía de compilación.',limit='La pantalla de cámara y el panel de monitorización no están integrados. Sin validación clínica ni compilación verificada.',kind='phone'),
 dict(repo='RegistroEstudiantes_IoT4',title='Registro de estudiantes',category='Aplicaciones móviles',status='Proyecto académico',tech=['C#','.NET MAUI','XAML'],summary='Interfaz móvil con vistas de creación, edición y listado de estudiantes.',problem='Organizar la gestión de registros de estudiantes en una interfaz móvil.',solution='Solución .NET MAUI que separa modelos e interfaz y define vistas de operaciones CRUD.',evidence='Se verificaron las vistas CrearEstudiante, EditarEstudiante y ListarEstudiante en el código público.',limit='La conectividad y ejecución en dispositivos no se han comprobado en esta revisión.',kind='students'),
 dict(repo='RegistroEmpleados01',title='Registro · .NET MAUI',category='Aplicaciones móviles',status='Proyecto académico',tech=['C#','.NET MAUI','XAML'],summary='Solución de práctica con separación entre aplicación móvil y modelos de datos.',problem='Practicar la organización de una aplicación multiplataforma y sus operaciones de registro.',solution='Proyectos de interfaz y modelos con vistas de creación, edición y listado.',evidence='Aunque el repositorio se llama RegistroEmpleados01, sus modelos y vistas publicados corresponden a estudiantes.',limit='No se atribuyen funciones de gestión de empleados que no estén demostradas por el código.',kind='records'),
 dict(repo='camara',title='DOMUZ · seguridad IoT',category='Desarrollo web',status='Sitio demostrativo',tech=['HTML','CSS','JavaScript'],summary='Presentación web de servicios de cámaras, alarmas y seguridad para hogares y negocios.',problem='Comunicar una oferta de servicios de seguridad mediante una página comercial.',solution='Secciones de servicios, planes y cotización con una propuesta visual de hogar conectado.',evidence='Contenido y estructura comprobados en el index.html público.',limit='Es una presentación web; no demuestra un sistema de videovigilancia operativo.',kind='camera'),
 dict(repo='CINEMATICA',title='Cimática · sonido visible',category='Desarrollo web',status='Recurso educativo',tech=['JavaScript','HTML','Web Audio'],summary='Página educativa sobre sonido y vibraciones con generador de ondas y registro de experimentos.',problem='Explicar cómo las frecuencias y las vibraciones se relacionan con patrones visibles.',solution='Contenido didáctico, selección de formas de onda y visualización de registros.',evidence='Se revisó el contenido del sitio publicado en el repositorio.',limit='La página acredita a Lorenzo Haguer Raggi. Se incluye como repositorio público, sin atribuir autoría exclusiva a Ricardo.',kind='waves'),
]

def rect(x,y,w,h,fill,rx=12,stroke='none'):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}"/>'
def text(x,y,s,size=16,color='#19394c',weight=500):
 return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,sans-serif" font-size="{size}" font-weight="{weight}">{escape(s)}</text>'
def line(x1,y1,x2,y2,color='#4e8b8b',width=3):
 return f'<path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
def circle(x,y,r,fill,stroke='none',sw=3):
 return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def chart(x,y,w,h,color='#147f80'):
 points=' '.join(f'{x+i*w/80:.2f},{y+h/2-math.sin(i*.55)*h*.17-math.sin(i*1.9)*h*.06:.2f}' for i in range(81))
 return f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="3"/>'

def art(p):
 k=p['kind']; s=''
 if k=='scale':
  s+=rect(67,161,236,114,'#fff',20)+rect(82,177,206,64,'#17384b',10)+text(110,218,'12.40',37,'#a6e5d5',600)+text(241,218,'kg',17,'#a6e5d5')
  s+=f'<path d="M92 150 L276 150 L253 122 L115 122 Z" fill="#9fb6be"/>'+rect(130,100,108,24,'#e0e9e9')
  s+=rect(361,100,185,184,'#fff',15)+text(382,130,'REGISTRO',13)+line(384,146,519,146,'#e0e9ed',2)
  for i,label in enumerate(['Orgánicos','Retiros','Reportes XLSX']):s+=circle(390,173+i*33,5,'#217c73')+text(405,178+i*33,label,13)
  s+=line(312,215,347,215)+line(336,205,347,215)+line(336,225,347,215)
 elif k=='agents':
  for x,y,label in [(125,109,'API'),(125,261,'TAREAS'),(490,109,'OAUTH'),(490,261,'AUDITORÍA')]:
   s+=line(x,y,310,185,'#9dbbc1',2)+rect(x-60,y-24,120,48,'#fff',12)+text(x-43,y+5,label,13)
  s+=circle(310,185,70,'#18394c')+circle(310,185,53,'none','#4b9394',1)+text(274,180,'AGENTES',15,'#fff',700)+text(284,204,'CONTROL',11,'#9bd5cc')
 elif k=='watch':
  s+=rect(240,35,145,302,'#96aab1',44)+rect(218,96,190,187,'#17384b',37)+rect(230,108,166,162,'#102c3d',28)+text(256,142,'SEÑALES',14,'#b1d5d5')+chart(245,153,135,68,'#80d0c0')+text(250,246,'PULSO + MOVIMIENTO',10,'#b7d4dd')
  s+=rect(57,148,117,60,'#fff')+text(76,174,'ANÁLISIS',12)+text(76,192,'TEMPORAL',12)+rect(451,148,117,60,'#fff')+text(466,174,'REGISTRO',12)+text(466,192,'DE SEÑALES',12)
 elif k=='voice':
  s+=rect(71,110,145,145,'#175d52',15)
  for i in range(5):s+=circle(90+i*23,125,3,'#d5c58e')
  s+=rect(110,148,65,61,'#233e44',5)+rect(84,222,47,20,'#a8c2b8',3)+text(81,278,'RASPBERRY PI',12)
  s+=line(235,183,368,183,'#6f999e',2)+chart(237,147,124,70)+rect(395,106,171,128,'#fff',9)+rect(406,117,149,96,'#18394c',4)+line(480,236,480,261)+line(443,262,517,262)+text(423,289,'WAKE-ON-LAN',12)
 elif k=='auto':
  for x in [194,437]:s+=circle(x,219,62,'#19394b')+circle(x,219,40,'#dee9ed')+circle(x,219,14,'#54828c')
  s+=f'<path d="M100 193 L139 137 L230 128 L305 78 L429 83 L491 148 L545 168 L555 216 L504 216 L477 173 L402 171 L375 217 L256 217 L230 171 L159 173 L137 216 L96 216 Z" fill="#3e7d87"/>'
  s+=f'<path d="M315 94 L417 97 L458 140 L276 140 Z" fill="#b7d5de"/>'+text(92,301,'CATÁLOGO / CARRITO / CHECKOUT DEMO',14)
 elif k=='bike':
  for x in [173,451]:s+=circle(x,227,69,'none','#315b6e',5)
  s+=f'<path d="M173 227 L256 136 L314 227 L173 227 M256 136 L403 136 L314 227 L451 227 L395 111 M246 118 L274 118 M390 110 L420 101" fill="none" stroke="#177c75" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'+circle(314,227,12,'#163b4b')+text(217,329,'CICLISMO URBANO',14)
 elif k=='chat':
  s+=rect(100,78,350,90,'#fff',20)+text(126,112,'¿Hay algún beneficio dental?',19)+text(126,142,'Consulta por texto o audio',13,'#6c828f')
  s+=rect(192,194,337,97,'#176c65',20)+text(216,230,'Busco en el catálogo publicado.',17,'#fff')+text(216,258,'Respuesta desde información existente.',13,'#d3ebe5')
  s+=circle(485,101,28,'#16394c')+f'<path d="M475 102 L483 111 L499 92" stroke="#8ed0bf" stroke-width="4" fill="none"/>'
 elif k=='assistant':
  s+=rect(75,70,466,237,'#fff',15)+rect(75,70,466,35,'#19394c',10)
  for i in range(3):s+=circle(93+i*15,87,4,'#8ba9b6')
  for i in range(4):s+=rect(98,129+i*36,218-i*22,12,'#dce7ec',4)
  s+=rect(349,125,169,158,'#e8f3f0',10)+rect(392,150,82,59,'#2b7674',16)+circle(416,176,6,'#d4eeeb')+circle(449,176,6,'#d4eeeb')+line(421,193,443,193,'#d4eeeb',2)+text(371,242,'ASISTENCIA LOCAL',11)
 elif k=='phone':
  s+=rect(216,48,188,288,'#153749',30)+rect(229,65,162,249,'#fff',20)+rect(270,58,79,12,'#153749',6)+circle(310,159,52,'#d8e9eb')+circle(310,159,35,'#28596c')+circle(310,159,18,'#6fa5aa')+chart(248,226,125,53)+text(263,301,'CAMERA X',12)
 elif k in ['students','records']:
  s+=rect(85,72,453,230,'#fff',15)+rect(85,72,453,44,'#244b61',10)+text(111,100,'REGISTRO DE ESTUDIANTES' if k=='students' else 'INTERFAZ + MODELOS',15,'#fff')
  for i in range(3):
   s+=circle(126,156+i*53,14,'#d8ebe6')+rect(155,145+i*53,158,9,'#cbdde5',4)+rect(155,163+i*53,100,6,'#e1eaee',3)+rect(441,142+i*53,66,25,'#e8f2ee',6)+text(451,159+i*53,'EDITAR',10,'#2a6f67')
 elif k=='camera':
  s+=f'<path d="M85 208 L85 148 L185 78 L287 148 L287 271 L85 271" fill="#d3e2e8"/>'+rect(154,191,59,80,'#fff',3)+rect(114,150,45,32,'#7299a7',4)
  s+=line(424,160,489,237,'#315c70',12)+line(471,240,526,240,'#315c70',10)+f'<path d="M349 109 L433 92 L486 124 L414 184 L361 174 Z" fill="#315c70"/>'+circle(403,144,30,'#17384b')+circle(403,144,17,'#a5cfce')+text(367,290,'HOGAR CONECTADO',13)
 elif k=='waves':
  for j in range(12):
   pts=[]
   for i in range(361):
    a=math.radians(i);r=74+29*math.cos(a*5+j*.18)
    pts.append(f'{310+r*math.cos(a)*1.5:.1f},{188+r*math.sin(a)*1.22:.1f}')
   s+=f'<polyline points="{" ".join(pts)}" fill="none" stroke="#287a7d" stroke-opacity=".38" stroke-width="1"/>'
  s+=text(224,327,'SONIDO · VIBRACIÓN · FORMA',12)
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="380" viewBox="0 0 640 380"><title>{escape(p["title"])} · ilustración conceptual</title><rect width="640" height="380" fill="#eaf0f3"/><path d="M0 330H640 M0 50H640" stroke="#dde7ec"/>{s}</svg>'
 return svg

for p in projects:
 p['image']='assets/'+p['repo'].lower()+'.svg'
 p['url']='https://github.com/Rhaguer/'+p['repo']
 p['source']=p['url']+'/blob/'+('master' if p['repo']=='RegistroEmpleados01' else 'main')+'/README.md'
 (OUT/p['image']).write_text(art(p),encoding='utf-8')
(OUT/'projects.json').write_text(json.dumps(projects,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(projects)} proyectos e ilustraciones generados')

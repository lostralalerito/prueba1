/* ================= ✏️ ZONA EDITABLE: CONFIGURACIÓN ================= */

// 🎵 AQUÍ pones tus canciones (archivos locales):
// 1) Crea una carpeta "musica" junto a este HTML y copia ahí tus audios (mp3, m4a, ogg, wav).
// 2) Escribe la ruta de cada una dentro de lista, separadas por comas, en el orden que quieras:
//      lista: ['musica/cancion1.mp3', 'musica/cancion2.mp3', 'musica/cancion3.mp3']
// 3) El botón ⏭️ salta a otra canción al azar; al terminar una, sigue sola con otra al azar.
// autoplay: true = la música intenta sonar al abrir y, si el navegador lo bloquea, empieza con el primer click/toque en cualquier parte de la página (también con los botones de música). Con false solo suena con los botones de música.
// Consejo: usa nombres sin espacios ni tildes (cancion1.mp3).
// volumen: volumen inicial de 0 a 100 (pruébalo y deja el que suene más normal). También se cambia con el botón de volumen.
// fade: duración del desvanecimiento entre canciones, en milisegundos (2000 = 2 segundos).
// Orden: la primera canción suena al inicio, sin desvanecimiento, y ya no se repite;
//        las demás salen al azar y entran con desvanecimiento suave.
const MUSICA = { lista: ['musica/1_HAPPY_BIRTHDAY.flac', 'musica/2_Sea.mp3'], volumen: 50, fade: 2000, autoplay: true };

// Imagen de fondo (se ve detrás del borde). Deja '' para usar el degradado.
// Usa un data URI (data:image/jpeg;base64,...) o una ruta local (fondo.jpg) si guardas el archivo en tu PC.
// 👉 AQUÍ pones tu imagen. Ejemplo: const IMAGEN_FONDO = 'fondo.jpg';  (el archivo junto a este HTML)
const IMAGEN_FONDO = ''; // ej: 'imagenes/fondo.jpg'

// Ondas del borde de la página
const BORDE = {
  grosor: 24,      // ancho de la franja morada (px)
  onda: 4,         // altura de cada ola (px)
  largoOnda: 70,
  espacio: 12,     // aire entre el borde ondulado y los textos/botones (px)   // distancia entre olas (px)
  esquina: 46      // redondez de las esquinas (px)
};

// Botones 1, 2, 3: pon en "url" el enlace o página a la que irán (null = sin acción por ahora)
const BOTONES = [
  { texto: '1', url: null },
  { texto: '2', url: null },
  { texto: '3', url: null }
];

// Botón NINGUNA: frases que van apareciendo en cada click (sin acción, solo cambia el texto).
// izq / der = imagen del emoji PNG (ruta o data URI). Déjalo '' para no mostrar emoji.
// Tamaño recomendado del PNG: 128 × 128 px, fondo transparente (se muestra a ~1.5em).
const TEXTO_INICIAL = { texto: 'NINGUNA', izq: '', der: '' };
const FRASES = [
  { texto: '¿Por qué no?',        izq: '', der: '' },
  { texto: '¿Me lo odias no?',    izq: '', der: '' },
  { texto: 'Escoge uno ps',       izq: '', der: '' },
  { texto: 'Escoge uno ya?',      izq: '', der: '' },
  { texto: 'Oka',                 izq: '', der: '' },
  { texto: 'Mala',                 izq: '', der: '' },
  { texto: 'Como que ninguno?',                 izq: '', der: '' },
  { texto: 'Cha no escoges uno',                 izq: '', der: '' },
  { texto: 'Me lo odias ps',         izq: '', der: '' }
];
// Ejemplos: { texto:'Oka', der:'emojis/ok.png' }  → emoji solo a la derecha
//           { texto:'Oka', izq:'emojis/ok.png', der:'emojis/ok.png' } → a ambos lados

/* =================================================================== */

const $ = id => document.getElementById(id);

/* ---- Sin seleccionar texto, sin click derecho, sin arrastrar ---- */
['contextmenu','selectstart','dragstart'].forEach(ev => addEventListener(ev, e => {
  if(ev === 'selectstart' && e.target && e.target.id === 'mVolNum') return;  // el número de volumen sí se puede editar
  e.preventDefault();
}));
const stage = $('stage'), path = $('framePath'), bg = $('bg');

/* ---- Imagen de fondo ---- */
function ponerFondo(src){ if(src) bg.style.backgroundImage = `url("${src}")`; }
ponerFondo(IMAGEN_FONDO);


/* ---- Rectángulo con borde ondulado (olas suaves) ---- */
function rectOndulado(x, y, w, h, r, amp, wl){
  r = Math.min(r, w/2, h/2);
  const A = Math.PI*r/2;
  const segs = [
    {l:w-2*r, f:t=>[x+r+t, y, 0,-1]},
    {l:A,     f:t=>{const a=-Math.PI/2+t/r;return[x+w-r+r*Math.cos(a),y+r+r*Math.sin(a),Math.cos(a),Math.sin(a)]}},
    {l:h-2*r, f:t=>[x+w, y+r+t, 1,0]},
    {l:A,     f:t=>{const a=t/r;return[x+w-r+r*Math.cos(a),y+h-r+r*Math.sin(a),Math.cos(a),Math.sin(a)]}},
    {l:w-2*r, f:t=>[x+w-r-t, y+h, 0,1]},
    {l:A,     f:t=>{const a=Math.PI/2+t/r;return[x+r+r*Math.cos(a),y+h-r+r*Math.sin(a),Math.cos(a),Math.sin(a)]}},
    {l:h-2*r, f:t=>[x, y+h-r-t, -1,0]},
    {l:A,     f:t=>{const a=Math.PI+t/r;return[x+r+r*Math.cos(a),y+r+r*Math.sin(a),Math.cos(a),Math.sin(a)]}}
  ];
  const total = segs.reduce((s,g)=>s+g.l,0);
  const k = 2*Math.PI*Math.max(1,Math.round(total/wl))/total; // ondas enteras = sin saltos
  let d = '', s = 0;
  for(const g of segs){
    const n = Math.max(1, Math.ceil(g.l/3));
    for(let i=0;i<n;i++){
      const t = g.l*i/n, p = g.f(t), o = amp*Math.sin(k*(s+t));
      d += (d?'L':'M') + (p[0]+p[2]*o).toFixed(1) + ' ' + (p[1]+p[3]*o).toFixed(1);
    }
    s += g.l;
  }
  return d + 'Z';
}

function dibujarBorde(){
  const w = stage.clientWidth, h = stage.clientHeight;
  const escala = Math.min(1, Math.min(innerWidth,innerHeight)/700 + .45);
  const g = BORDE.grosor*escala, a = BORDE.onda*escala, wl = BORDE.largoOnda*escala, r = BORDE.esquina*escala;
  const fuera = rectOndulado(a, a, w-2*a, h-2*a, r, a, wl);
  const dentro = rectOndulado(a+g, a+g, w-2*(a+g), h-2*(a+g), Math.max(r-g,12), a, wl);
  path.setAttribute('d', fuera + dentro);
  $('frame').setAttribute('viewBox', `0 0 ${w} ${h}`);
  stage.style.setProperty('--inset', (g + 2*a + BORDE.espacio*escala) + 'px');
}
if('ResizeObserver' in window) new ResizeObserver(dibujarBorde).observe(stage); else addEventListener('resize', dibujarBorde);
dibujarBorde();

/* ---- Botones circulares con borde ondulado ---- */
const NS = 'http://www.w3.org/2000/svg';
let d = '';
for(let i=0;i<=360;i+=3){
  const t = i*Math.PI/180, rr = 45 + 2.4*Math.sin(10*t);
  d += (i?'L':'M') + (50+rr*Math.cos(t)).toFixed(2) + ' ' + (50+rr*Math.sin(t)).toFixed(2);
}
d += 'Z';
const cont = $('botones');
BOTONES.forEach(b => {
  const el = document.createElement('button');
  el.className = 'btn onda'; el.type = 'button';
  const svg = document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 100 100'); svg.setAttribute('aria-hidden','true');
  const p = document.createElementNS(NS,'path'); p.setAttribute('d', d);
  svg.appendChild(p); el.appendChild(svg);
  const s = document.createElement('span'); s.textContent = b.texto; el.appendChild(s);
  el.onclick = () => { if(b.url) location.href = b.url; };
  cont.appendChild(el);
});

/* ---- Botón NINGUNA: cambia de frase, sin otra acción ---- */
const nin = $('ninguna');
function mostrar(o){
  nin.textContent = '';
  const img = src => { const i = new Image(); i.src = src; i.alt = ''; return i; };
  if(o.izq) nin.appendChild(img(o.izq));
  const s = document.createElement('span'); s.textContent = o.texto; nin.appendChild(s);
  if(o.der) nin.appendChild(img(o.der));
}
let idx = -1;
mostrar(TEXTO_INICIAL);
nin.onclick = () => {
  // Frase al azar en cada click (evita mostrar la misma dos veces seguidas)
  let n;
  do { n = Math.floor(Math.random()*FRASES.length); } while(FRASES.length > 1 && n === idx);
  idx = n; mostrar(FRASES[idx]);
};

/* ---- Animación de entrada: 🎉 en las esquinas lanzando confeti ---- */
const cv = $('confeti'), cx = cv.getContext('2d');
let ps = [], corriendo = false;
function ajustarCanvas(){
  const r = Math.min(devicePixelRatio || 1, 2);
  cv.width = innerWidth*r; cv.height = innerHeight*r; cx.setTransform(r,0,0,r,0,0);
}
addEventListener('resize', ajustarCanvas); ajustarCanvas();
const COLORES = ['#ff4d6d','#ffd60a','#4cc9f0','#80ed99','#ffffff','#c77dff','#ff9e00'];
function lanzar(){
  const esc = Math.min(1.4, Math.max(.6, innerWidth/800));
  document.querySelectorAll('.fiesta').forEach(e => {
    const r = e.getBoundingClientRect(), dir = e.classList.contains('izq') ? 1 : -1;
    for(let i=0;i<70;i++){
      const a = (8 + Math.random()*65)*Math.PI/180, v = (6 + Math.random()*10)*esc;
      ps.push({x:r.left+r.width/2, y:r.top+r.height/2, vx:Math.cos(a)*v*dir, vy:Math.sin(a)*v,
        w:5+Math.random()*6, h:3+Math.random()*4, r:Math.random()*6.28, vr:(Math.random()-.5)*.4,
        c:COLORES[Math.floor(Math.random()*COLORES.length)], t:0, max:140+Math.random()*80});
    }
  });
  if(!corriendo){ corriendo = true; requestAnimationFrame(paso); }
}
function paso(){
  cx.clearRect(0,0,innerWidth,innerHeight);
  ps = ps.filter(p => p.t < p.max && p.y < innerHeight + 20);
  for(const p of ps){
    p.vx *= .985; p.vy = p.vy*.985 + .22; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.t++;
    cx.save(); cx.globalAlpha = Math.min(1,(p.max-p.t)/30);
    cx.translate(p.x,p.y); cx.rotate(p.r); cx.fillStyle = p.c;
    cx.fillRect(-p.w/2,-p.h/2,p.w,p.h); cx.restore();
  }
  if(ps.length) requestAnimationFrame(paso); else corriendo = false;
}
function fiesta(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.fiesta').forEach(e => { e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); });
  [250,600,1000].forEach(t => setTimeout(lanzar, t));
}
document.querySelector('h1').onclick = fiesta;
// El confeti sale cuando empieza a sonar la canción (si no hay canciones en la lista, sale al abrir)
if(!MUSICA.lista.length) setTimeout(fiesta, 300);

/* ---- Música de fondo ---- */
const audio = new Audio();
let volumen = MUSICA.volumen/100, nivel = 1, fadeTimer = null, saliendo = false, cambiando = false;
function aplicarVol(){ audio.volume = Math.min(1, Math.max(0, volumen*nivel)); }
function fade(hasta, ms, fin){
  clearInterval(fadeTimer);
  const desde = nivel, pasos = Math.max(1, Math.round(ms/50)); let i = 0;
  fadeTimer = setInterval(() => {
    i++; nivel = desde + (hasta - desde)*i/pasos; aplicarVol();
    if(i >= pasos){ clearInterval(fadeTimer); if(fin) fin(); }
  }, 50);
}
aplicarVol();
let lista = [...MUSICA.lista], pista = 0, cargada = false, iniciada = false, bloqueada = false, fallos = 0;
const bPlay = $('mPlay');
function cargar(i){ pista = i; audio.src = lista[i]; cargada = true; }
function reproducir(){
  audio.play().then(() => { iniciada = true; bloqueada = false; }).catch(err => {
    // Si el navegador bloquea el play (pasa al cambiar de canción sin un toque reciente), se reintenta con el próximo toque
    if(err && err.name === 'NotAllowedError') bloqueada = true;
  });
}
// Cambia de canción; si conFade, entra desde silencio subiendo el volumen suavemente
function irA(i, conFade){
  cargar(i); saliendo = false; cambiando = false;
  nivel = conFade ? 0 : 1; aplicarVol();
  reproducir();
  if(conFade) fade(1, MUSICA.fade);
}
// Siguiente al azar: nunca la primera (solo suena al inicio) ni la misma dos veces seguidas; las demás pueden volver a salir después
function elegirSiguiente(){
  const todos = lista.map((_, i) => i);
  let pool = todos.filter(i => i !== 0 && i !== pista);
  if(!pool.length) pool = todos.filter(i => i !== 0);
  if(!pool.length) pool = [0];
  return pool[Math.floor(Math.random()*pool.length)];
}
function alternar(){
  if(!lista.length) return;
  if(!cargada) cargar(0);
  audio.paused ? reproducir() : audio.pause();
}
function siguiente(){
  if(!lista.length) return;
  if(!cargada){ irA(0, false); return; }
  cambiando = true;  // mientras dura el cambio, el desvanecimiento del final de la canción no lo interrumpe
  const ir = () => irA(elegirSiguiente(), true);
  if(audio.paused || nivel === 0) ir(); else fade(0, MUSICA.fade/2, ir);
}
const IC = {
  play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
};
let fiestaHecha = false;
audio.onplay = () => {
  bPlay.innerHTML = IC.pause;
  if(!fiestaHecha){ fiestaHecha = true; fiesta(); }
};
audio.onpause = () => bPlay.innerHTML = IC.play;
audio.onended = siguiente;
audio.onplaying = () => { fallos = 0; };
// Si una canción no carga (ruta o formato incorrecto), salta a otra en vez de quedarse en silencio
audio.onerror = () => {
  if(lista.length < 2 || ++fallos >= lista.length) return;
  irA(elegirSiguiente(), true);
};
// Desvanece el final de cada canción para que la transición sea suave
audio.ontimeupdate = () => {
  const resta = audio.duration - audio.currentTime;
  if(!saliendo && !cambiando && lista.length > 1 && isFinite(resta) && resta > 0 && resta <= MUSICA.fade/1000){
    saliendo = true; fade(0, resta*1000);
  }
};
bPlay.onclick = alternar;
$('mNext').onclick = siguiente;

/* ---- Botón de volumen: se estira y muestra la barra (0 a 100) ---- */
const cajaVol = $('vol'), rango = $('mVolRango');
rango.value = MUSICA.volumen;
const num = $('mVolNum'); num.value = MUSICA.volumen;
// El volumen sube o baja de forma gradual hacia el valor elegido (no da saltos)
let objetivo = volumen, volTimer = null;
function suavizarVol(){
  if(volTimer) return;
  volTimer = setInterval(() => {
    volumen += (objetivo - volumen)*0.2;
    if(Math.abs(objetivo - volumen) < 0.002){ volumen = objetivo; clearInterval(volTimer); volTimer = null; }
    aplicarVol();
  }, 30);
}
rango.oninput = () => { objetivo = rango.value/100; num.value = rango.value; suavizarVol(); };
function fijarVol(v){
  v = Math.min(100, Math.max(0, v));
  rango.value = v; num.value = v; objetivo = v/100; suavizarVol();
}
// Escribir el volumen en el número: solo dígitos, de 0 a 100
num.oninput = () => {
  num.value = num.value.replace(/\D/g, '').slice(0, 3);
  if(num.value !== ''){
    const v = Math.min(100, parseInt(num.value, 10));
    num.value = v; rango.value = v; objetivo = v/100; suavizarVol();
  }
};
num.onkeydown = e => {
  if(e.key === 'Enter'){ num.blur(); return; }
  if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){
    e.preventDefault(); fijarVol((num.value === '' ? +rango.value : parseInt(num.value, 10)) + (e.key === 'ArrowUp' ? 1 : -1)); return;
  }
  if(e.ctrlKey || e.metaKey || e.key.length > 1) return;  // borrar, flechas, tab...
  if(!/\d/.test(e.key)) e.preventDefault();               // bloquea letras y signos
};
num.onfocus = () => { num.placeholder = rango.value; num.value = ''; };
num.onblur = () => { num.value = rango.value; };          // si queda vacío, vuelve al valor actual
$('mVol').onclick = () => cajaVol.classList.toggle('abierto');
addEventListener('pointerdown', e => { if(!e.target.closest('.vol')) cajaVol.classList.remove('abierto'); });

// Autoplay: intenta sonar apenas carga; si el navegador lo bloquea, suena con el primer toque/tecla
function arrancar(e){
  if(!lista.length || (iniciada && !bloqueada) || (!MUSICA.autoplay && !bloqueada)) return;
  if(e && e.target && e.target.closest && e.target.closest('.musica')) return;
  if(!cargada) cargar(0);
  reproducir();
}
arrancar();
['pointerdown','keydown','touchend'].forEach(ev => addEventListener(ev, arrancar));

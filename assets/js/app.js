/* App script atualizado - correções e novos recursos */
const PASSWORD = "18/11";
const SECRET = "AMOR";
const STARS = 5;
const galleryKey = "nc_gallery_v2";
const timelineKey = "nc_timeline_v2";
const letterKey = "nc_letter_v2";
const staticManifestPath = 'assets/media/manifest.json'; // usado para conteúdo compartilhado

/* ----------------- UTIL ----------------- */
function $(id){ return document.getElementById(id); }
function tryPlayAudio(){ try{ $('bg').play().catch(()=>{}); }catch(e){} }

/* ----------------- PASSWORD / NAV ----------------- */
function unlock(){
  const v = $('pwd').value.trim();
  if(v === PASSWORD){
    $('gate').style.display='none';
    $('app').style.display='block';
    tryPlayAudio();
    loadAll();
  } else alert('Senha incorreta.');
}
function openHint(){ alert('Dica: um dia especial — 18/11'); }
function showSection(id){
  document.querySelectorAll('main .card').forEach(s=>s.style.display='none');
  const el = document.getElementById(id); if(el) el.style.display='block';
}

/* ----------------- MOTIVO DO DIA (fix) ----------------- */
const lovePool = [
  'Seu sorriso muda meu dia.',
  'Eu amo como você me entende.',
  'Com você tudo fica mais simples.',
  'Cada minuto com você vale ouro.',
  'Você me inspira a ser melhor.'
];
let _typingCancel = null;
function randomLove(){
  const btn = $('motivoBtn');
  if(_typingCancel){ // cancela animação anterior
    clearTimeout(_typingCancel);
    _typingCancel = null;
  }
  const txt = lovePool[Math.floor(Math.random()*lovePool.length)];
  const el = $('phrase');
  el.textContent = '';
  btn.disabled = true;
  let i=0;
  function typeNext(){
    if(i < txt.length){
      el.textContent += txt[i++];
      _typingCancel = setTimeout(typeNext, 36);
    } else {
      btn.disabled = false;
      _typingCancel = null;
    }
  }
  typeNext();
}

/* ----------------- DARK MODE / AUDIO ----------------- */
function toggleDark(on){ if(on) document.body.classList.add('dark'); else document.body.classList.remove('dark'); }
function toggleAudio(){ const a=$('bg'); if(a.paused) a.play().catch(()=>{}); else a.pause(); }

/* ----------------- GALLERY (localStorage + manifest) ----------------- */
/* Local uploads are stored in localStorage (visible só nesse navegador).
   Static/shared files must be placed in assets/media/ e adicionadas ao manifest.json
   manifest.json deve ser um array de objetos: [{ "name":"foto1.jpg","type":"image/jpeg","path":"assets/media/foto1.jpg" }, ...]
*/
document.getElementById('file').addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files).slice(0,30);
  for(const f of files){
    if(!f.type) continue;
    const data = await toDataURL(f);
    saveMedia({name:f.name,type:f.type,data});
  }
  renderGallery();
  e.target.value='';
});
function toDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
function saveMedia(item){
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]');
  arr.unshift({...item,id:Date.now()});
  localStorage.setItem(galleryKey, JSON.stringify(arr.slice(0,60)));
}

/* Load static manifest if present */
async function loadStaticManifest(){
  try{
    const resp = await fetch(staticManifestPath, {cache:'no-store'});
    if(!resp.ok) return [];
    const list = await resp.json();
    // Normalize: ensure each item has name,type,path
    return list.map(i=>({
      name: i.name,
      type: i.type || (i.path && i.path.endsWith('.mp4') ? 'video/mp4' : 'image/*'),
      path: i.path
    }));
  }catch(e){
    return [];
  }
}

async function renderGallery(){
  const grid = $('grid'); grid.innerHTML='';
  // First: static files from manifest
  const staticList = await loadStaticManifest();
  staticList.forEach((m, idx)=>{
    const div = document.createElement('div'); div.className='item';
    // image or video by path
    if((m.type||'').startsWith('image') || /\.jpe?g|png|gif|webp$/i.test(m.path)){
      const img = document.createElement('img'); img.src = m.path; div.appendChild(img);
    } else {
      const v = document.createElement('video'); v.src = m.path; v.controls=true; div.appendChild(v);
    }
    // actions
    const actions = makeThumbActionsStatic(m.path, m.name);
    div.appendChild(actions);
    grid.appendChild(div);
  });

  // Then: local uploads (data URLs)
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]');
  arr.forEach((m, idx)=>{
    const div = document.createElement('div'); div.className='item';
    if(m.type.startsWith('image/')){
      const img = document.createElement('img'); img.src=m.data; div.appendChild(img);
    } else {
      const vid = document.createElement('video'); vid.src=m.data; vid.muted=true; vid.loop=true; vid.autoplay=true; div.appendChild(vid);
    }
    const actions = makeThumbActionsLocal(idx);
    div.appendChild(actions);
    grid.appendChild(div);
  });
}

/* Create actions (download/delete) for local items */
function makeThumbActionsLocal(index){
  const box = document.createElement('div');
  box.className='thumb-actions';
  const dl = document.createElement('button'); dl.textContent='Baixar'; dl.className='icon-btn';
  dl.onclick = (e)=>{ e.stopPropagation(); downloadLocal(index); };
  const del = document.createElement('button'); del.textContent='Excluir'; del.className='icon-btn';
  del.onclick = (e)=>{ e.stopPropagation(); deleteLocal(index); };
  box.appendChild(dl); box.appendChild(del);
  return box;
}
/* For static items (files in assets/media) provide download link to path */
function makeThumbActionsStatic(path,name){
  const box = document.createElement('div'); box.className='thumb-actions';
  const dl = document.createElement('a'); dl.textContent='Baixar'; dl.className='icon-btn'; dl.href = path; dl.download = name || '';
  box.appendChild(dl);
  return box;
}
function downloadLocal(idx){
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]'); const item = arr[idx]; if(!item) return;
  const a = document.createElement('a'); a.href = item.data; a.download = item.name || 'media'; a.click();
}
function deleteLocal(idx){
  if(!confirm('Remover esta mídia local?')) return;
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]'); arr.splice(idx,1); localStorage.setItem(galleryKey, JSON.stringify(arr)); renderGallery();
}
function clearGallery(){ if(confirm('Limpar galeria local?')){ localStorage.removeItem(galleryKey); renderGallery(); } }
function loadGallery(){ renderGallery(); }

/* Export gallery local as ZIP (client-side) */
async function exportGalleryZip(){
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]');
  if(!arr.length) return alert('Nenhuma mídia local para exportar.');
  // create simple zip via JSZip if available — fallback: open each in new tab to save
  // Simpler: download each file one by one for now
  arr.forEach((it, i)=>{
    const a=document.createElement('a'); a.href = it.data; a.download = it.name||('media-'+i); a.click();
  });
  alert('Foram iniciados downloads das mídias locais. Para compartilhar a galeria permanentemente, envie os arquivos para assets/media/ e atualize assets/media/manifest.json');
}

/* ----------------- TIMELINE ----------------- */
function loadTimeline(){
  const arr = JSON.parse(localStorage.getItem(timelineKey) || '[]'); const list = $('timelineList'); list.innerHTML='';
  arr.forEach(ev=>{ const el=document.createElement('div'); el.className='event'; el.innerHTML = `<strong>${ev.title}</strong><div class="muted">${ev.date||''}</div><p>${ev.note||''}</p>`; list.appendChild(el); });
}
function addEvent(){ const t = $('evtext').value.trim(); if(!t) return alert('Escreva algo.'); const arr = JSON.parse(localStorage.getItem(timelineKey) || '[]'); arr.unshift({title:t,date:new Date().toLocaleDateString(),note:''}); localStorage.setItem(timelineKey, JSON.stringify(arr.slice(0,30))); $('evtext').value=''; loadTimeline(); }

/* ----------------- LETTER ----------------- */
function saveLetter(){ const t = $('letterInput').value; localStorage.setItem(letterKey,t); renderLetter(); alert('Carta salva localmente.'); }
function renderLetter(){ const t = localStorage.getItem(letterKey) || 'Escreva sua carta...'; $('letterContent').textContent = t; }
function revealLetter(){ const t = localStorage.getItem(letterKey) || 'Escreva sua carta...'; alert(t); }
function clearLetter(){ localStorage.removeItem(letterKey); renderLetter(); }

/* ----------------- HIGHLIGHTS (substitui o céu das memórias) ----------------- */
/* Mostra até 5 memórias da timeline com imagem, se houver.
   Recomendo: quando você adicionar memórias na timeline, coloque uma foto em assets/media e adicione no manifest com mesmo nome de título (opcional).
*/
async function renderHighlights(){
  const wrap = $('highlightsWrap'); wrap.innerHTML='';
  const arr = JSON.parse(localStorage.getItem(timelineKey) || '[]');
  const staticList = await loadStaticManifest();
  for(let i=0;i<Math.min(5, arr.length); i++){
    const mem = arr[i];
    const card = document.createElement('div'); card.className='item';
    // try to find static image by name in manifest
    const match = staticList.find(s => s.name && s.name.includes(mem.title.split(' ')[0]));
    if(match){
      const img = document.createElement('img'); img.src = match.path; card.appendChild(img);
    } else {
      const placeholder = document.createElement('div'); placeholder.style.padding='12px'; placeholder.textContent = mem.title; card.appendChild(placeholder);
    }
    const caption = document.createElement('div'); caption.style.padding='8px'; caption.innerHTML = `<strong>${mem.title}</strong><div class="muted">${mem.date||''}</div>`;
    card.appendChild(caption);
    wrap.appendChild(card);
  }
}

/* ----------------- HANGMAN (Jogo da Forca com 10 palavras) ----------------- */
const HANGMAN_WORDS = [
  'AMOR','VIAGEM','BEIJO','SAUDADE','SORRISO',
  'CORAÇÃO','NOITE','ABRAÇO','PARAISO','SONHO'
];
let hangmanState = { word:'', revealed:[], guesses:[], errors:0, maxErrors:6 };

function pickWord(){
  return HANGMAN_WORDS[Math.floor(Math.random()*HANGMAN_WORDS.length)];
}
function startHangman(){
  hangmanState.word = pickWord();
  hangmanState.revealed = Array(hangmanState.word.length).fill(false);
  hangmanState.guesses = [];
  hangmanState.errors = 0;
  $('maxErrors').textContent = hangmanState.maxErrors;
  renderHangman();
  renderAlphabet();
}
function renderHangman(){
  const disp = $('wordDisplay'); disp.textContent = '';
  for(let i=0;i<hangmanState.word.length;i++){
    disp.textContent += (hangmanState.revealed[i] ? hangmanState.word[i] : '_') + ' ';
  }
  $('errors').textContent = hangmanState.errors;
  if(hangmanState.revealed.every(Boolean)){
    $('hangmanMsg').textContent = 'Você ganhou! ❤️';
    confetti();
  } else if(hangmanState.errors >= hangmanState.maxErrors){
    $('hangmanMsg').textContent = 'Você perdeu — palavra: ' + hangmanState.word;
  } else {
    $('hangmanMsg').textContent = '';
  }
}
function renderAlphabet(){
  const container = $('letters'); container.innerHTML='';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letters.forEach(l=>{
    const b = document.createElement('button'); b.textContent = l; b.className='icon-btn';
    b.style.margin='3px';
    b.onclick = ()=> guessLetter(l, b);
    if(hangmanState.guesses.includes(l)) b.disabled = true;
    container.appendChild(b);
  });
}
function guessLetter(letter, buttonEl){
  if(hangmanState.guesses.includes(letter)) return;
  hangmanState.guesses.push(letter);
  buttonEl.disabled = true;
  if(hangmanState.word.includes(letter)){
    for(let i=0;i<hangmanState.word.length;i++){
      if(hangmanState.word[i] === letter) hangmanState.revealed[i] = true;
    }
  } else {
    hangmanState.errors++;
  }
  renderHangman();
}

/* ----------------- Confetti (reused) ----------------- */
function confetti(){
  for(let i=0;i<40;i++){
    const el = document.createElement('div'); el.style.position='fixed'; el.style.left = Math.random()*100 + '%'; el.style.top='-10px';
    el.style.width='8px'; el.style.height='12px'; el.style.background = ['#f6b3d6','#b8a3ff','#7bdff6'][Math.floor(Math.random()*3)];
    el.style.transition = 'all 1400ms linear'; document.body.appendChild(el);
    setTimeout(()=>{ el.style.top = (60+Math.random()*40)+'%'; el.style.opacity='0'; },20);
    setTimeout(()=>el.remove(),1500);
  }
}

/* ----------------- Modal actions (for gallery) ----------------- */
let currentIdx = null;
function openModal(idx){ // not used now; kept for compatibility
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]');
  const item = arr[idx]; if(!item) return;
  currentIdx = idx;
  const body = $('modal-body'); body.innerHTML='';
  if(item.type.startsWith('image/')){ const img = document.createElement('img'); img.src = item.data; img.style.width='100%'; body.appendChild(img); }
  else { const v = document.createElement('video'); v.src = item.data; v.controls = true; v.style.width='100%'; body.appendChild(v); }
  $('modal').classList.add('show');
}
function closeModal(e){ $('modal').classList.remove('show'); }
function downloadModal(){ const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]'); const item = arr[currentIdx]; if(!item) return; const a = document.createElement('a'); a.href = item.data; a.download = item.name || 'media'; a.click(); }

/* ----------------- LOAD ALL ----------------- */
function loadAll(){ renderGallery(); loadTimeline(); renderLetter(); renderHighlights(); }
window.addEventListener('DOMContentLoaded', ()=>{ /* nothing until unlock */ });

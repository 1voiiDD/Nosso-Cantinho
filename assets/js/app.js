/* App script for Nosso Cantinho */
const PASSWORD = "18/11";
const SECRET = "AMOR";
const STARS = 5;
const galleryKey = "nc_gallery_v2";
const timelineKey = "nc_timeline_v2";
const letterKey = "nc_letter_v2";

function unlock(){
  const v = document.getElementById('pwd').value.trim();
  if(v === PASSWORD){
    document.getElementById('gate').style.display='none';
    document.getElementById('app').style.display='block';
    try{ document.getElementById('bg').play().catch(()=>{}); }catch(e){}
    loadAll();
  } else alert('Senha incorreta.');
}
function openHint(){ alert('Dica: um dia especial — 18/11'); }

function showSection(id){
  document.querySelectorAll('main section.card').forEach(s=>s.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display='block';
}

// Love phrases
const lovePool = [
  'Seu sorriso muda meu dia.',
  'Eu amo como você me entende.',
  'Com você tudo fica mais simples.',
  'Cada minuto com você vale ouro.',
  'Você me inspira a ser melhor.'
];
function randomLove(){
  const txt = lovePool[Math.floor(Math.random()*lovePool.length)];
  const el = document.getElementById('phrase'); el.textContent = '';
  let i=0; function type(){ if(i<txt.length){ el.textContent += txt[i++]; setTimeout(type,38);} }
  type();
}

/* Dark mode */
function toggleDark(on){
  if(on) document.body.classList.add('dark');
  else document.body.classList.remove('dark');
}

/* AUDIO CONTROL */
function toggleAudio(){ const a=document.getElementById('bg'); if(a.paused) a.play().catch(()=>{}); else a.pause(); }

/* GALLERY */
document.getElementById('file').addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files).slice(0,25);
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
  localStorage.setItem(galleryKey, JSON.stringify(arr.slice(0,40)));
}
function loadGallery(){ renderGallery(); }
function renderGallery(){
  const grid = document.getElementById('grid'); grid.innerHTML='';
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]');
  arr.forEach((m,idx)=>{
    const div = document.createElement('div'); div.className='item'; div.dataset.idx=idx;
    if(m.type.startsWith('image/')){ const img=document.createElement('img'); img.src=m.data; div.appendChild(img); }
    else { const vid=document.createElement('video'); vid.src=m.data; vid.muted=true; vid.loop=true; vid.autoplay=true; div.appendChild(vid); }
    div.onclick = ()=>openModal(idx);
    grid.appendChild(div);
  });
}

/* Modal */
let currentIdx = null;
function openModal(idx){
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]');
  const item = arr[idx]; if(!item) return;
  currentIdx = idx;
  const body = document.getElementById('modal-body'); body.innerHTML='';
  if(item.type.startsWith('image/')){ const img=document.createElement('img'); img.src=item.data; img.style.width='100%'; body.appendChild(img); }
  else { const v=document.createElement('video'); v.src=item.data; v.controls=true; v.style.width='100%'; body.appendChild(v); }
  document.getElementById('modal').classList.add('show');
}
function closeModal(e){ document.getElementById('modal').classList.remove('show'); }
function downloadModal(){
  const arr = JSON.parse(localStorage.getItem(galleryKey) || '[]'); const item = arr[currentIdx]; if(!item) return;
  const a = document.createElement('a'); a.href = item.data; a.download = item.name || 'media'; a.click();
}
function clearGallery(){ if(confirm('Limpar galeria local?')){ localStorage.removeItem(galleryKey); renderGallery(); } }

/* TIMELINE */
function loadTimeline(){
  const arr = JSON.parse(localStorage.getItem(timelineKey) || '[]'); const list = document.getElementById('timelineList'); list.innerHTML='';
  arr.forEach(ev=>{ const el = document.createElement('div'); el.className='event'; el.innerHTML = `<strong>${ev.title}</strong><div class="muted">${ev.date||''}</div><p>${ev.note||''}</p>`; list.appendChild(el); });
}
function addEvent(){ const t = document.getElementById('evtext').value.trim(); if(!t) return alert('Escreva algo.'); const arr = JSON.parse(localStorage.getItem(timelineKey) || '[]'); arr.unshift({title:t,date:new Date().toLocaleDateString(),note:''}); localStorage.setItem(timelineKey, JSON.stringify(arr.slice(0,30))); document.getElementById('evtext').value=''; loadTimeline(); }

/* LETTER */
function saveLetter(){ const t = document.getElementById('letterInput').value; localStorage.setItem(letterKey,t); renderLetter(); alert('Carta salva localmente.'); }
function renderLetter(){ const t = localStorage.getItem(letterKey) || 'Escreva sua carta...'; document.getElementById('letterContent').textContent = t; }
function revealLetter(){ const t = localStorage.getItem(letterKey) || 'Escreva sua carta...'; alert(t); }
function clearLetter(){ localStorage.removeItem(letterKey); renderLetter(); }

/* STARS */
function renderStars(){
  const wrap = document.getElementById('starsWrap'); wrap.innerHTML='';
  const arr = JSON.parse(localStorage.getItem(timelineKey) || '[]');
  for(let i=0;i<STARS;i++){
    const s = document.createElement('div'); s.className='star';
    s.style.left = (10 + Math.random()*80)+'%'; s.style.top = (8 + Math.random()*76)+'%';
    const mem = arr[i] || {title:'Nossa memória '+(i+1), note:'Um momento especial.'};
    s.title = mem.title;
    s.onclick = ()=>alert(mem.title + '\n\n' + (mem.note||'') + '\n' + (mem.date||''));
    wrap.appendChild(s);
  }
}

/* GAME */
function checkGuess(){
  const v = document.getElementById('guess').value.trim().toUpperCase();
  const r = document.getElementById('result');
  if(!v) return;
  if(v === SECRET){ r.textContent = 'Acertou!'; celebrate(); } else r.textContent = 'Tente novamente...';
}
function celebrate(){
  confetti();
  const dlg = document.createElement('div'); dlg.className='modal-card'; dlg.innerHTML = '<h2>Você acertou ❤️</h2><p>Eu te amo hoje, amanhã e sempre. Obrigado por ser meu lar.</p><div class="row"><button class="primary" onclick="(function(e){document.body.removeChild(e)})">Fechar</button></div>';
  const overlay = document.createElement('div'); overlay.className='modal show'; overlay.style.alignItems='center'; overlay.appendChild(dlg); document.body.appendChild(overlay);
  setTimeout(()=>overlay.remove(), 5000);
}

/* Simple confetti */
function confetti(){
  for(let i=0;i<60;i++){
    const el = document.createElement('div'); el.style.position='fixed'; el.style.left = Math.random()*100 + '%'; el.style.top='-10px';
    el.style.width='8px'; el.style.height='12px'; el.style.background = ['#f6b3d6','#b8a3ff','#7bdff6'][Math.floor(Math.random()*3)];
    el.style.transition = 'all 1400ms linear'; document.body.appendChild(el);
    setTimeout(()=>{ el.style.top = (60+Math.random()*40)+'%'; el.style.opacity='0'; },20);
    setTimeout(()=>el.remove(),1500);
  }
}

/* Helpers */
function loadAll(){ renderGallery(); loadTimeline(); renderLetter(); renderStars(); }
window.addEventListener('DOMContentLoaded', ()=>{ /* nothing until unlock */ });

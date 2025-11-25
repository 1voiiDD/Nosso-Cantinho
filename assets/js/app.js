/* --------------------------------------------------
   APP.JS — VERSÃO FINAL COMPATÍVEL COM O SEU HTML
-------------------------------------------------- */

const PASSWORD = "18/11";
function $(id){ return document.getElementById(id); }

/* ----------- SHOW SECTION ----------- */
function showSection(id){
  document.querySelectorAll("main .card").forEach(sec => {
    sec.style.display = "none";
  });
  $(id).style.display = "block";
}

/* ----------- PASSWORD ----------- */
function unlock(){
  const v = $('pwd').value.trim();
  if(v === PASSWORD){
    $('gate').style.display='none';
    $('app').style.display='block';
    tryPlayAudio();
    loadAll();
  } else alert("Senha errada, meu amorzinho.");
}

/* ----------- AUDIO ----------- */
function tryPlayAudio(){
  try { $('bg').play().catch(()=>{}); } catch(e){}
}
function toggleAudio(){
  const a=$('bg');
  if(a.paused) a.play().catch(()=>{}); else a.pause();
}

/* ----------- DARK MODE ----------- */
function toggleDark(on){
  if(on) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

/* ----------- MOTIVO DO DIA ----------- */
const lovePool = [
  "Seu sorriso muda meu dia.",
  "Eu amo como você me entende.",
  "Meu amor por você é impossível ser demonstrado por palavras.",
  "Cada conversa com você me deixa mais vivo.",
  "Você me faz feliz como ninguém antes fez."
];

let _typingCancel = null;
function randomLove(){
  const btn = $('motivoBtn');
  if(_typingCancel){
    clearTimeout(_typingCancel);
    _typingCancel = null;
  }
  const txt = lovePool[Math.floor(Math.random()*lovePool.length)];
  const el = $('phrase');
  el.textContent = "";
  btn.disabled = true;
  let i=0;
  function type(){
    if(i < txt.length){
      el.textContent += txt[i++];
      _typingCancel = setTimeout(type, 35);
    } else {
      btn.disabled = false;
      _typingCancel = null;
    }
  }
  type();
}

/* ----------- GALERIA (MANIFEST APENAS) ----------- */
const staticManifestPath = "assets/media/manifest.json";

async function loadStaticManifest(){
  try{
    const r = await fetch(staticManifestPath, {cache:'no-store'});
    if(!r.ok) return [];
    return r.json();
  } catch(e){
    return [];
  }
}

async function renderGallery(){
  const grid = $('grid');
  grid.innerHTML = "";

  const list = await loadStaticManifest();
  list.forEach(item=>{
    const box = document.createElement("div");
    box.className = "item";

    if(item.type.startsWith("image")){
      const img = document.createElement("img");
      img.src = item.path;
      box.appendChild(img);
    } else {
      const vid = document.createElement("video");
      vid.src = item.path;
      vid.controls = true;
      box.appendChild(vid);
    }

    const dl = document.createElement("a");
    dl.textContent = "Baixar";
    dl.className = "icon-btn";
    dl.href = item.path;
    dl.download = item.name;

    const actions = document.createElement("div");
    actions.className = "thumb-actions";
    actions.appendChild(dl);

    box.appendChild(actions);
    grid.appendChild(box);
  });
}

/* ----------- CARTA ----------- */
function revealLetter(){
  const content = document.getElementById("letterContent").innerHTML;
  alert(content.replace(/<[^>]+>/g, ""));
}

/* ----------- TIMELINE FIXA (sem JS) ----------- */
function loadTimeline(){
  // Nada — timeline totalmente fixa no HTML
}

/* ----------- MEMÓRIAS EM DESTAQUE ----------- */
async function renderHighlights(){
  const wrap = $('highlightsWrap');
  wrap.innerHTML = `
    <div class="item">
      <div class="highlight-img" style="background-image:url('assets/media/mem1.jpg')"></div>
      <div class="highlight-text">
        <strong>Primeira conversa</strong>
        <div class="muted">18/11/2025</div>
      </div>
    </div>
  `;
}

/* ----------- FORCA ----------- */
const HANGMAN_WORDS = [
  "AMOR","VIAGEM","BEIJO","SAUDADE","SORRISO",
  "CORACAO","NOITE","ABRACO","PARAISO","SONHO"
];

let hangmanState = {
  word:"",
  revealed:[],
  guesses:[],
  errors:0,
  maxErrors:6
};

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
  const disp = $('wordDisplay');
  disp.textContent = hangmanState.revealed.map((r,i)=> r ? hangmanState.word[i] : "_").join(" ");

  $('errors').textContent = hangmanState.errors;

  if(hangmanState.revealed.every(v=>v)){
    $('hangmanMsg').textContent = "Você ganhou! ❤️";
    confetti();
  } else if(hangmanState.errors >= hangmanState.maxErrors){
    $('hangmanMsg').textContent = "Você perdeu... palavra: " + hangmanState.word;
  } else {
    $('hangmanMsg').textContent = "";
  }
}

function renderAlphabet(){
  const cont = $('letters');
  cont.innerHTML = "";

  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l=>{
    const b = document.createElement("button");
    b.textContent = l;
    b.className = "icon-btn";
    b.onclick = ()=> guessLetter(l,b);

    cont.appendChild(b);
  });
}

function guessLetter(letter, btn){
  if(hangmanState.guesses.includes(letter)) return;

  hangmanState.guesses.push(letter);
  btn.disabled = true;

  if(hangmanState.word.includes(letter)){
    hangmanState.word.split("").forEach((ch,i)=>{
      if(ch === letter) hangmanState.revealed[i] = true;
    });
  } else {
    hangmanState.errors++;
  }

  renderHangman();
}

/* ----------- CONFETTI ----------- */
function confetti(){
  for(let i=0;i<40;i++){
    const el=document.createElement("div");
    el.style.position="fixed";
    el.style.left=Math.random()*100+"%";
    el.style.top="-10px";
    el.style.width="8px";
    el.style.height="12px";
    el.style.background=["#f6b3d6","#b8a3ff","#7bdff6"][Math.floor(Math.random()*3)];
    el.style.transition="all 1400ms linear";
    document.body.appendChild(el);

    setTimeout(()=>{ el.style.top = (60+Math.random()*40)+"%"; el.style.opacity="0"; },20);
    setTimeout(()=> el.remove(),1500);
  }
}

/* ----------- LOAD ALL ----------- */
function loadAll(){
  renderGallery();
  loadTimeline();
  renderHighlights();
}


function checkPass(){
  if(document.getElementById('pass').value === "18/11"){
    document.getElementById('password-screen').style.display='none';
    document.getElementById('main').style.display='block';
  }
}

document.getElementById('upload').addEventListener('change', function(e){
  const gal = document.getElementById('gallery');
  [...e.target.files].forEach(f=>{
    if(f.type.startsWith('image/')){
      const url = URL.createObjectURL(f);
      const img = document.createElement('img'); img.src=url;
      gal.appendChild(img);
    } else if(f.type.startsWith('video/')){
      const url = URL.createObjectURL(f);
      const vid = document.createElement('video'); vid.src=url; vid.controls=true;
      gal.appendChild(vid);
    }
  });
});

function saveLetter(){
  localStorage.setItem('letter', document.getElementById('letter').value);
}

window.onload = ()=>{
  const saved = localStorage.getItem('letter');
  if(saved) document.getElementById('letter').value = saved;
}

function addMemory(){
  const mem = prompt("Digite a memória:");
  if(!mem) return;
  const li = document.createElement('li'); li.textContent = mem;
  document.getElementById('mem-list').appendChild(li);
}

function playGame(){
  const val = document.getElementById('guess').value.toUpperCase();
  if(val === "AMOR"){
    document.getElementById('game-result').textContent = "Você acertou! Nosso amor é infinito.";
  } else {
    document.getElementById('game-result').textContent = "Tente novamente!";
  }
}

/* script.js - lógica do quiz e integração com /api/gerar-pix */
const quizData = [
  { q: "1. Se 2 + 3 = 5 e 4 + 5 = 9, qual é 6 + 7?", opts:["11","13","12"], correct:1 },
  { q: "2. Complete: 3,6,12,24,...", opts:["48","36","42"], correct:0 },
  { q: "3. Sinônimo de \"rápido\"?", opts:["Lento","Veloz","Moroso"], correct:1 },
  { q: "4. TODOS A são B; alguns B são C. Conclusão segura?", opts:["Alguns A podem ser C","Nenhum A é C","Todos C são A"], correct:0 },
  { q: "5. Quantos minutos em 3 horas e meia?", opts:["150","210","180"], correct:1 },
  { q: "6. \"GATO\" : \"MIA\" :: \"CACHORRO\" : ?", opts:["Ruge","Late","Canta"], correct:1 },
  { q: "7. Metade de 1/3 é:", opts:["1/6","1/3","1/9"], correct:0 },
  { q: "8. A=1,B=2,C=3. Soma de \"CAB\"?", opts:["6","5","7"], correct:0 },
  { q: "9. Sequência figura: círculo, quadrado, triângulo, ...", opts:["triângulo","quadrado","círculo"], correct:0 },
  { q: "10. Se 5x = 35 então x = ?", opts:["6","7","5"], correct:1 },
  { q: "11. Palavra que não pertence: Azul, Rua, Verde?", opts:["Azul","Rua","Verde"], correct:1 },
  { q: "12. Trem a 60 km/h; 2,5 horas percorre?", opts:["150 km","120 km","100 km"], correct:0 },
  { q: "13. Pássaro : vôo :: peixe : ?", opts:["Nadar","Escalar","Correr"], correct:0 },
  { q: "14. Próximo: 1,4,9,16,...", opts:["25","20","24"], correct:0 },
  { q: "15. Maria > João > Ana. Quem é o mais alto?", opts:["Maria","Ana","João"], correct:0 },
  { q: "16. Qual não pertence: 2,3,5,7,11,13,14?", opts:["14","11","13"], correct:0 },
  { q: "17. Se hoje é segunda, daqui a 4 dias será?", opts:["Sexta","Sábado","Domingo"], correct:1 },
  { q: "18. Antônimo de \"aceitar\"?", opts:["Permitir","Recusar","Concordar"], correct:1 },
  { q: "19. 3 carros consomem 36 L em 6 h. 1 carro em 2 h consome?", opts:["4 litros","6 litros","8 litros"], correct:0 },
  { q: "20. Soma dos dígitos de 987?", opts:["23","24","25"], correct:1 },
  { q: "21. Complete: \"Não conte com o ovo no ___\"", opts:["cesto","colo","prato"], correct:1 },
  { q: "22. Próximo: 10,9,7,4,0,...", opts:["-3","-5","1"], correct:1 },
  { q: "23. Probabilidade de ter duas meninas (mesmo sexo) em 2 filhos?", opts:["25%","50%","75%"], correct:1 },
  { q: "24. \"AR\" : \"VAPOR\" :: \"GELO\" : ?", opts:["Água","Fogo","Terra"], correct:0 },
  { q: "25. Qual é 7²?", opts:["42","48","49"], correct:2 },
  { q: "26. Palavra original de \"ÇAMÃA\" (letras embaralhadas)?", opts:["Maçã","Camãa","Amacã"], correct:0 },
  { q: "27. Falta: 14,11,8,5,...", opts:["2","3","4"], correct:0 },
  { q: "28. \"LIVRO\" sem 1ª e última letra fica:", opts:["IVR","IVO","LVR"], correct:0 },
  { q: "29. Qual é primo?", opts:["21","23","27"], correct:1 },
  { q: "30. Pares mais próximos em significado?", opts:["Claro / Escuro","Feliz / Contente","Quente / Frio"], correct:1 },
  { q: "31. A > B e B > C. A > C?", opts:["Sim","Não","Às vezes"], correct:0 },
  { q: "32. Resultado de 15 ÷ 3 + 2 × 4 ?", opts:["11","13","9"], correct:1 }
];

const TOTAL = quizData.length;
const MAX_SCORE = 110;

/* Elements */
const carousel = document.getElementById('carousel');
const progressText = document.getElementById('progressText');
const submitBtn = document.getElementById('submitBtn');
const topAlert = document.getElementById('topAlert');
const donationArea = document.getElementById('donationArea');
const openGatewayBtn = document.getElementById('openGatewayBtn');
const donationLoader = document.getElementById('donationLoader');
const pixContainer = document.getElementById('pixContainer');
const pixQrCode = document.getElementById('pixQrCode');
const pixStatus = document.getElementById('pixStatus');
const pixCodeInput = document.getElementById('pixCode');
const copyBtn = document.getElementById('copyBtn');
const copyMsg = document.getElementById('copyMsg');
const resultArea = document.getElementById('resultArea');
const resultValueEl = document.getElementById('resultValue');
const resultCommentEl = document.getElementById('resultComment');
const shareRow = document.getElementById('shareRow');
const shareWhats = document.getElementById('shareWhats');
const shareFace = document.getElementById('shareFace');
const shareX = document.getElementById('shareX');

let current = 0;
let answers = new Array(TOTAL).fill(null);

/* Build slides */
function buildSlides(){
  carousel.innerHTML = '';
  quizData.forEach((it, idx) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    if(idx === 0) slide.classList.add('active');
    slide.setAttribute('data-index', idx);
    slide.innerHTML = `
      <div>
        <div class="q-title">${it.q}</div>
        <div class="options" role="list">
          ${it.opts.map((o,i)=>`<div class="opt" role="button" tabindex="0" data-idx="${i}">${o}</div>`).join('')}
        </div>
      </div>
    `;
    carousel.appendChild(slide);
  });
}
buildSlides();

/* Update progress */
function updateProgress(){
  const answered = answers.filter(a=> a !== null).length;
  progressText.textContent = `Respondidas: ${answered} / ${TOTAL}`;
  if(answered === TOTAL && current === TOTAL-1){
    submitBtn.style.display = 'inline-block';
    submitBtn.setAttribute('aria-hidden','false');
  }
}

/* Show top alert */
function showTopAlert(msg='Por favor, responda todas as perguntas antes de enviar!'){
  topAlert.textContent = msg;
  topAlert.classList.add('show');
  submitBtn.style.animation = 'shake 420ms';
  setTimeout(()=> submitBtn.style.animation = '', 420);
  setTimeout(()=> topAlert.classList.remove('show'), 3000);
}

/* Show index (slide) */
function showIndex(newIndex){
  const slides = Array.from(document.querySelectorAll('.slide'));
  slides.forEach((s,i)=>{
    s.classList.remove('active','prev');
    if(i < newIndex) s.classList.add('prev');
    if(i === newIndex) s.classList.add('active');
  });
  current = newIndex;
  updateProgress();
}

/* Option click handling with glow + auto-advance */
carousel.addEventListener('click', (e)=>{
  const opt = e.target.closest('.opt');
  if(!opt) return;
  const slide = opt.closest('.slide');
  const qIndex = Number(slide.dataset.index);
  const optIndex = Number(opt.dataset.idx);

  // glow color
  const colors = ['rgba(0,191,255,0.9)','rgba(255,0,200,0.9)','rgba(0,255,150,0.85)','rgba(255,200,0,0.9)','rgba(255,110,0,0.9)'];
  const cor = colors[Math.floor(Math.random()*colors.length)];
  opt.style.boxShadow = `0 0 18px 6px ${cor}`;
  opt.classList.add('active');

  setTimeout(()=>{ opt.style.boxShadow = 'none'; opt.classList.remove('active'); }, 360);

  // record
  answers[qIndex] = optIndex;
  updateProgress();

  // advance
  if(qIndex < TOTAL-1){
    setTimeout(()=> showIndex(qIndex+1), 300);
  } else {
    setTimeout(()=> {
      submitBtn.style.display = 'inline-block';
      submitBtn.setAttribute('aria-hidden','false');
    }, 260);
  }
});

/* keyboard accessibility */
carousel.addEventListener('keydown', (e)=>{
  const opt = e.target.closest('.opt');
  if(!opt) return;
  if(e.key === 'Enter' || e.key === ' '){
    e.preventDefault();
    opt.click();
  }
});

/* Submit -> show donation area */
submitBtn.addEventListener('click', ()=>{
  const answered = answers.filter(a=> a !== null).length;
  if(answered < TOTAL){
    showTopAlert();
    return;
  }
  carousel.style.display = 'none';
  document.querySelector('.controls').style.display = 'none';
  donationArea.style.display = 'block';
  donationArea.setAttribute('aria-hidden','false');
  submitBtn.disabled = true;
});

/* openGatewayBtn: abre link público do gateway (user will pay there) */
openGatewayBtn.addEventListener('click', ()=>{
  // Substitua o link abaixo pelo seu link de checkout (Mercado Pago / Efi) gerado no painel.
  const genericLink = 'https://mpago.la/SEU_LINK'; // <-- troque por seu link real
  window.open(genericLink, '_blank');
});

/* If you want to call the server to generate QR (dynamic PIX), use this function */
async function requestPixFromServer(){
  donationLoader.style.display = 'block';
  try {
    const res = await fetch('/api/gerar-pix', { method: 'POST' });
    const data = await res.json();
    donationLoader.style.display = 'none';
    if(data.error){
      alert('Erro ao gerar PIX: ' + data.error);
      return;
    }
    // data expected: {qr_code_image: 'data:image/png;base64,...' or url, pix_copiaecola: '...'}
    pixQrCode.src = data.qr_code_image;
    pixCodeInput.value = data.pix_copiaecola;
    pixStatus.textContent = 'Escaneie o QR Code ou copie a linha abaixo para pagar via PIX';
    pixContainer.style.display = 'block';
    pixContainer.setAttribute('aria-hidden','false');

    // OPTIONAL: polling / webhook real to wait for confirmation; here we simulate
    setTimeout(()=> {
      pixStatus.textContent = 'Pagamento confirmado! 🎉';
      setTimeout(()=> {
        pixContainer.style.display = 'none';
        donationArea.style.display = 'none';
        showResult();
      }, 1200);
    }, 5000);

  } catch (e) {
    donationLoader.style.display = 'none';
    alert('Erro ao solicitar PIX (ver console).');
    console.error(e);
  }
}

/* copy pix line */
copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(pixCodeInput.value);
    copyMsg.style.display = 'block';
    setTimeout(()=> copyMsg.style.display = 'none', 2000);
  } catch(e){
    pixCodeInput.select();
    document.execCommand('copy');
    copyMsg.style.display = 'block';
    setTimeout(()=> copyMsg.style.display = 'none', 2000);
  }
});

/* show result calculation */
function showResult(){
  const correctCount = answers.reduce((acc,val,idx)=> acc + ((val === quizData[idx].correct) ? 1 : 0), 0);
  const percent = (correctCount / TOTAL) * 100;
  const resultValue = Math.round((percent / 100) * MAX_SCORE);
  resultValueEl.textContent = resultValue;

  let comment = '';
  if(percent >= 80) comment = 'Excelente capacidade de raciocínio!';
  else if(percent >= 50) comment = 'Bom desempenho!';
  else comment = 'Continue praticando seu raciocínio lógico!';
  resultCommentEl.textContent = comment;

  resultArea.style.display = 'block';
  shareRow.style.display = 'flex';

  const siteLink = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Meu resultado no teste foi ${resultValue} — faça o seu também: ${siteLink}`);

  shareWhats.onclick = () => window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  shareFace.onclick = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${siteLink}&quote=${encodeURIComponent('Meu resultado no teste foi '+resultValue)}`, '_blank','width=640,height=480');
  shareX.onclick = () => window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank','width=640,height=480');

  submitBtn.disabled = false;
  submitBtn.style.display = 'none';
  document.querySelector('.controls').style.display = 'flex';
}

/* init */
updateProgress();

/* small shake keyframes added dynamically */
const style = document.createElement('style');
style.innerHTML = `@keyframes shake{0%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-4px)}100%{transform:translateX(0)}}`;
document.head.appendChild(style);

/* make options tabbable after DOM loaded */
document.addEventListener('DOMContentLoaded', ()=> {
  const opts = document.querySelectorAll('.opt');
  opts.forEach(o => o.setAttribute('tabindex','0'));
});
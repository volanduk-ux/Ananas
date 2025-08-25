(()=> {
  const RANKS=["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
  const SUITS=["s","h","d","c"];
  const sym={s:"♠",h:"♥",d:"♦",c:"♣"};
  const col={s:"black",c:"black",h:"red",d:"red"};
  const R2V={}; RANKS.forEach((r,i)=>R2V[r]=i+2);

  // пул выбранных карт
  let pool=[];
  let phase='start5'; // потом 'pine3'

  const picker=document.getElementById('picker');
  const pickerDeck=document.getElementById('pickerDeck');
  const poolEl=document.getElementById('pool');
  const phaseLabel=document.getElementById('phaseLabel');
  const drawCounter=document.getElementById('drawCounter');

  // построение пустых слотов
  document.querySelectorAll('.slots').forEach(el=>{
    const n=+el.dataset.n;
    for(let i=0;i<n;i++){
      const s=document.createElement('div');
      s.className='slot';
      el.appendChild(s);
    }
  });

  function renderPool(){
    poolEl.innerHTML='';
    pool.forEach((code,idx)=>{
      const div=document.createElement('div');
      div.className='pool-card';
      div.innerHTML=`<span>${code[0]}${sym[code[1]]}</span><span class="rm">✕</span>`;
      div.querySelector('.rm').addEventListener('click',()=>{ pool.splice(idx,1); renderPool(); updatePhaseText(); });
      poolEl.appendChild(div);
    });
    updatePhaseText();
  }

  function updatePhaseText(){
    if(phase==='start5'){
      phaseLabel.textContent='Старт: выберите 5 карт';
      drawCounter.textContent=`${pool.length}/5`;
    }else{
      phaseLabel.textContent='Раунд Pineapple: выберите 3 карты (1 сброс)';
      drawCounter.textContent=`${pool.length}/3`;
    }
  }

  function openPicker(){
    buildPickerDeck();
    picker.classList.add('show');
    picker.setAttribute('aria-hidden','false');
  }
  function closePicker(){
    picker.classList.remove('show');
    picker.setAttribute('aria-hidden','true');
  }

  function buildPickerDeck(){
    pickerDeck.innerHTML='';
    const used=new Set(allCards().concat(pool));
    RANKS.forEach(r=>SUITS.forEach(s=>{
      const code=r+s;
      const b=document.createElement('button');
      b.type='button'; b.className='cb '+col[s];
      b.innerHTML=`<span>${r}</span><span class="suit">${sym[s]}</span>`;
      if(used.has(code)) b.classList.add('disabled');
      b.addEventListener('click',()=>selectToPool(code));
      pickerDeck.appendChild(b);
    }));
  }

  function selectToPool(code){
    const limit=(phase==='start5')?5:3;
    if(pool.length>=limit) return;
    pool.push(code);
    renderPool();
    buildPickerDeck();
    if(pool.length===limit) closePicker();
  }

  document.getElementById('openPicker').addEventListener('click',openPicker);
  document.querySelectorAll('[data-close="picker"]').forEach(el=>el.addEventListener('click',closePicker));
  document.getElementById('clearPool').addEventListener('click',()=>{pool=[];renderPool();});

  /* ====== вспомогательные ====== */
  function allCards(){
    const arr=[]; document.querySelectorAll('.slot').forEach(s=>{ if(s.dataset.card) arr.push(s.dataset.card); });
    return arr;
  }
  function resetAll(){
    document.querySelectorAll('.slot').forEach(s=>{s.dataset.card='';s.textContent='';});
    pool=[]; renderPool();
    phase='start5'; updatePhaseText();
  }
  function demo(){
    resetAll();
    const seq={
      p2_top:['Js','Jc','2d'],
      p2_mid:['Qs','Qh','Qd','7s','7h'],
      p2_bot:['8s','7s','6s','5s','4s']
    };
    Object.entries(seq).forEach(([g,cards])=>{
      const slots=document.querySelector(`.slots[data-g="${g}"]`).querySelectorAll('.slot');
      cards.forEach((code,i)=>{ slots[i].dataset.card=code; slots[i].textContent=code[0]+sym[code[1]]; });
    });
  }

  document.getElementById('reset').addEventListener('click',resetAll);
  document.getElementById('demo').addEventListener('click',demo);

  renderPool();
  updatePhaseText();
})();

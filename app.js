(()=> {
  /* ====== базовые константы ====== */
  const RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
  const SUITS = ["s","h","d","c"];
  const sym = {s:"♠",h:"♥",d:"♦",c:"♣"};
  const col={s:"black",c:"black",h:"red",d:"red"};
  const R2V = {}; RANKS.forEach((r,i)=>R2V[r]=i+2);

  // Royalties (американские)
  const RB = {straight:2,flush:4,full_house:6,four_kind:10,straight_flush:15,royal_flush:25};
  const RM = {three_kind:2,straight:4,flush:8,full_house:12,four_kind:20,straight_flush:30,royal_flush:50};
  const TP = {6:1,7:2,8:3,9:4,10:5,11:6,12:7,13:8,14:9};
  const TT = {2:10,3:11,4:12,5:13,6:14,7:15,8:16,9:17,10:18,11:19,12:20,13:21,14:22};

  /* ====== UI и состояние ====== */
  const dealCardEl = document.getElementById('dealCard');
  const picker = document.getElementById('picker');
  const pickerDeck = document.getElementById('pickerDeck');
  let currentDeal = ''; // текущая карта в центре

  /* ====== построение слотов ====== */
  document.querySelectorAll('.slots').forEach(el=>{
    const n = +el.dataset.n;
    for (let i=0;i<n;i++){
      const s = document.createElement('div');
      s.className = 'slot';
      s.addEventListener('click', ()=> onSlotTap(s));
      el.appendChild(s);
    }
  });

  /* ====== построение колоды для пикера ====== */
  function buildPickerDeck(){
    pickerDeck.innerHTML = '';
    RANKS.forEach(r => SUITS.forEach(s=>{
      const code = r+s;
      const b = document.createElement('button');
      b.type='button';
      b.className='cb '+col[s];
      b.dataset.card=code;
      b.innerHTML = `<span>${r}</span><span class="suit">${sym[s]}</span>`;
      b.addEventListener('click', ()=> selectDealCard(code));
      pickerDeck.appendChild(b);
    }));
    // блокируем уже использованные карты
    const used = new Set(allCards());
    if (currentDeal) used.add(currentDeal);
    used.forEach(c=>{
      const btn = pickerDeck.querySelector(`.cb[data-card="${c}"]`);
      if (btn) btn.classList.add('disabled');
    });
  }

  function selectDealCard(code){
    currentDeal = code;
    renderDealCard();
    closePicker();
  }

  function renderDealCard(){
    if (!currentDeal){
      dealCardEl.textContent = '';
      dealCardEl.classList.add('empty');
    } else {
      dealCardEl.textContent = currentDeal[0] + sym[currentDeal[1]];
      dealCardEl.classList.remove('empty');
    }
  }

  /* ====== модалка ====== */
  function openPicker(){
    buildPickerDeck();
    picker.classList.add('show');
    picker.setAttribute('aria-hidden','false');
  }
  function closePicker(){
    picker.classList.remove('show');
    picker.setAttribute('aria-hidden','true');
  }

  document.getElementById('openPicker').addEventListener('click', openPicker);
  document.getElementById('dealCard').addEventListener('click', openPicker);
  document.querySelectorAll('[data-close="picker"]').forEach(el=>{
    el.addEventListener('click', closePicker);
  });

  document.getElementById('clearDeal').addEventListener('click', ()=>{
    currentDeal = '';
    renderDealCard();
  });

  /* ====== установка карты в слот ====== */
  function onSlotTap(slot){
    if (!currentDeal) return;
    if (slot.dataset.card) return; // занято
    const used = new Set(allCards());
    if (used.has(currentDeal)) return;
    slot.dataset.card = currentDeal;
    slot.textContent = currentDeal[0] + sym[currentDeal[1]];
    currentDeal = '';
    renderDealCard();
  }

  /* ====== сервисные ====== */
  function allCards(){
    const arr=[];
    document.querySelectorAll('.slot').forEach(s=>{ if(s.dataset.card) arr.push(s.dataset.card); });
    return arr;
  }
  function resetAll(){
    document.querySelectorAll('.slot').forEach(s=>{ s.dataset.card=''; s.textContent=''; });
    currentDeal=''; renderDealCard();
    document.getElementById('result').hidden = true;
  }
  function demo(){
    resetAll();
    const seq = {
      p2_top:['Js','Jc','2d'], p2_mid:['Qs','Qh','Qd','7s','7h'], p2_bot:['8s','7s','6s','5s','4s'],
      p1_top:['Ah','Kh','Qh'], p1_mid:['As','Kd','Qd','Jd','Td'], p1_bot:['9s','9h','9d','2c','2d']
    };
    Object.entries(seq).forEach(([g,cards])=>{
      const cont = document.querySelector(`.slots[data-g="${g}"]`);
      const slots = cont.querySelectorAll('.slot');
      cards.forEach((code,idx)=>{
        slots[idx].dataset.card = code;
        slots[idx].textContent = code[0] + sym[code[1]];
      });
    });
  }

  /* ====== расчёт (сокращённо, тот же код что раньше) ====== */
  // ... здесь оставь твой блок p5/p3/royalties/calc без изменений ...

  /* ====== кнопки ====== */
  document.getElementById('reset').addEventListener('click', resetAll);
  document.getElementById('demo').addEventListener('click', demo);
  document.getElementById('calc').addEventListener('click', calc);

  // init
  renderDealCard();
})();

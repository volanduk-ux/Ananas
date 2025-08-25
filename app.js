(()=> {
  /* ====== базовые константы ====== */
  const RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
  const SUITS = ["s","h","d","c"];
  const sym = {s:"♠",h:"♥",d:"♦",c:"♣"}, col={s:"black",c:"black",h:"red",d:"red"};
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

  // текущая карта в центре (строка вида 'As')
  let currentDeal = '';

  // построить слоты и поведение
  document.querySelectorAll('.slots').forEach(el=>{
    const n = +el.dataset.n;
    for (let i=0;i<n;i++){
      const s = document.createElement('div');
      s.className = 'slot';
      s.addEventListener('click', ()=> onSlotTap(s));
      el.appendChild(s);
    }
  });

  // построить колоду в пикере (13x4)
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
    // деактивировать уже использованные карты и текущую центральную
    const used = new Set(allCards());
    if (currentDeal) used.add(currentDeal);
    used.forEach(c=>{
      const btn = pickerDeck.querySelector(`.cb[data-card="${c}"]`);
      if (btn) btn.classList.add('disabled');
    });
  }

  /* ====== управление модалкой пикера ====== */
  document.getElementById('openPicker').addEventListener('click', ()=>{
    buildPickerDeck();
    picker.classList.add('show');
    picker.setAttribute('aria-hidden','false');
  });
  document.querySelectorAll('[data-close="picker"]').forEach(el=>{
    el.addEventListener('click', ()=>{
      picker.classList.remove('show');
      picker.setAttribute('aria-hidden','true');
    });
  });

  function selectDealCard(code){
    currentDeal = code;
    renderDealCard();
    // закрыть модалку
    picker.classList.remove('show');
    picker.setAttribute('aria-hidden','true');
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

  document.getElementById('clearDeal').addEventListener('click', ()=>{
    currentDeal = '';
    renderDealCard();
  });

  /* ====== размещение карты по тапу на слот ====== */
  function onSlotTap(slot){
    if (!currentDeal) return; // нечего ставить
    if (slot.dataset.card) return; // занято
    // проверим дубль
    const used = new Set(allCards());
    if (used.has(currentDeal)) return;

    // ставим в слот
    slot.dataset.card = currentDeal;
    slot.textContent = currentDeal[0] + sym[currentDeal[1]];
    // очищаем центр
    currentDeal = '';
    renderDealCard();
  }

  /* ====== вспомогательные ====== */
  function allCards(){
    const arr=[];
    document.querySelectorAll('.slot').forEach(s=>{ if(s.dataset.card) arr.push(s.dataset.card); });
    return arr;
  }
  function resetAll(){
    document.querySelectorAll('.slot').forEach(s=>{ s.dataset.card=''; s.textContent=''; });
    currentDeal='';
    renderDealCard();
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

  /* ====== подсчёт ====== */
  const cmp=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const A=a[i]??-1e9,B=b[i]??-1e9;if(A>B)return 1;if(A<B)return -1}return 0};

  function p5(cs){
    const vals = cs.map(c=>R2V[c[0]]).sort((a,b)=>b-a);
    const suits = cs.map(c=>c[1]);
    const cnt={}; vals.forEach(v=>cnt[v]=(cnt[v]||0)+1);
    const by = Object.entries(cnt).map(([v,f])=>({v:+v,f})).sort((a,b)=>(b.f-a.f)||(b.v-a.v));
    const flush = new Set(suits).size===1;
    const u = [...new Set(vals)].sort((a,b)=>b-a);
    let straight=false, high=vals[0];
    if (u.length>=5 && u[0]-u[4]===4){straight=true;high=u[0];}
    else { const S=new Set(vals); if([14,5,4,3,2].every(x=>S.has(x))){straight=true;high=5;} }
    if (straight && flush){ if (high===14) return {rank:[8,14], key:'royal_flush'}; return {rank:[8,high], key:'straight_flush'}; }
    if (by[0].f===4){ const four=by[0].v; const k=Math.max(...vals.filter(x=>x!==four)); return {rank:[7,four,k], key:'four_kind'}; }
    if (by[0].f===3 && by[1] && by[1].f===2){ return {rank:[6,by[0].v,by[1].v], key:'full_house'}; }
    if (flush) return {rank:[5,...vals], key:'flush'};
    if (straight) return {rank:[4,high], key:'straight'};
    if (by[0].f===3){ const t=by[0].v; const ks=vals.filter(x=>x!==t).sort((a,b)=>b-a); return {rank:[3,t,...ks], key:'three_kind'}; }
    if (by[0].f===2 && by[1] && by[1].f===2){
      const ph=Math.max(by[0].v,by[1].v), pl=Math.min(by[0].v,by[1].v);
      const k=Math.max(...vals.filter(x=>x!==ph && x!==pl));
      return {rank:[2,ph,pl,k], key:'two_pair'};
    }
    if (by[0].f===2){ const p=by[0].v; const ks=vals.filter(x=>x!==p).sort((a,b)=>b-a); return {rank:[1,p,...ks], key:'pair'}; }
    return {rank:[0,...vals], key:'high'};
  }
  function p3(cs){
    const vals = cs.map(c=>R2V[c[0]]).sort((a,b)=>b-a);
    const cnt={}; vals.forEach(v=>cnt[v]=(cnt[v]||0)+1);
    const by = Object.entries(cnt).map(([v,f])=>({v:+v,f})).sort((a,b)=>(b.f-a.f)||(b.v-a.v));
    if (by[0].f===3) return {rank:[2,by[0].v]};
    if (by[0].f===2){ const pair=by[0].v; const k=Math.max(...vals.filter(x=>x!==pair)); return {rank:[1,pair,k]}; }
    return {rank:[0,...vals]};
  }

  const royT = cs => { const r=p3(cs).rank; if(r[0]===2) return TT[r[1]]||0; if(r[0]===1) return TP[r[1]]||0; return 0; };
  const royM = cs => { const h=p5(cs); let k=h.key; if(k==='straight_flush' && h.rank[1]===14) k='royal_flush'; return RM[k]||0; };
  const royB = cs => { const h=p5(cs); let k=h.key; if(k==='straight_flush' && h.rank[1]===14) k='royal_flush'; return RB[k]||0; };
  const foul = (top,mid,bot) => cmp(p5(bot).rank, p5(mid).rank) < 0;

  const collect = g => Array.from(document.querySelector(`.slots[data-g="${g}"]`).querySelectorAll('.slot')).map(s=>s.dataset.card).filter(Boolean);

  function calc(){
    const unit = parseFloat(document.getElementById('unit').value||'50');
    const p1={top:collect('p1_top'), mid:collect('p1_mid'), bot:collect('p1_bot')};
    const p2={top:collect('p2_top'), mid:collect('p2_mid'), bot:collect('p2_bot')};
    const ok = (p)=>p.top.length===3&&p.mid.length===5&&p.bot.length===5;
    if (!ok(p1) || !ok(p2)){ alert('У каждого игрока должны быть 3/5/5 карт.'); return; }
    const all=[...p1.top,...p1.mid,...p1.bot,...p2.top,...p2.mid,...p2.bot];
    if (new Set(all).size!==all.length){ alert('Дубли карт.'); return; }

    const f1=foul(p1.top,p1.mid,p1.bot), f2=foul(p2.top,p2.mid,p2.bot);
    let rt1=0,rm1=0,rb1=0,rt2=0,rm2=0,rb2=0;
    if(!f1){ rt1=royT(p1.top); rm1=royM(p1.mid); rb1=royB(p1.bot); }
    if(!f2){ rt2=royT(p2.top); rm2=royM(p2.mid); rb2=royB(p2.bot); }

    let pts1=0, pts2=0, note='', topRes='—', midRes='—', botRes='—';
    if (f1||f2){
      if (f1 && !f2){ pts1=-6; pts2=+6+(rt2+rm2+rb2); note='Мы сожгли руку.'; }
      else if (f2 && !f1){ pts1=+6+(rt1+rm1+rb1); pts2=-6; note='Оппонент сжёг руку.'; }
      else { note='Оба сожгли, линии не считаются.'; }
    } else {
      const t1=p3(p1.top).rank, t2=p3(p2.top).rank;
      const m1=p5(p1.mid).rank, m2=p5(p2.mid).rank;
      const b1=p5(p1.bot).rank, b2=p5(p2.bot).rank;
      const ct=cmp(t1,t2), cm=cmp(m1,m2), cb=cmp(b1,b2);
      const w1=(ct>0)+(cm>0)+(cb>0), w2=(ct<0)+(cm<0)+(cb<0);
      topRes=ct>0?'Мы':(ct<0?'Опп.':'Пуш');
      midRes=cm>0?'Мы':(cm<0?'Опп.':'Пуш');
      botRes=cb>0?'Мы':(cb<0?'Опп.':'Пуш');
      const s1=(w1===3)?3:0, s2=(w2===3)?3:0;
      if (s1&&!s2) note='Наш scoop (+3).';
      if (s2&&!s1) note='Scoop оппонента (+3).';
      pts1=(w1-w2)+(s1-s2)+((rt1+rm1+rb1)-(rt2+rm2+rb2));
      pts2=-pts1;
    }

    document.getElementById('result').hidden=false;
    document.getElementById('lines').innerHTML = `
      <tr><td>Верх</td><td>${topRes}</td><td>${rt1}</td><td>${rt2}</td></tr>
      <tr><td>Середина</td><td>${midRes}</td><td>${rm1}</td><td>${rm2}</td></tr>
      <tr><td>Низ</td><td>${botRes}</td><td>${rb1}</td><td>${rb2}</td></tr>`;
    document.getElementById('sum').innerHTML = `
      <table class="result">
        <tr><th></th><th>Очки</th><th>Рубли</th></tr>
        <tr><td>Мы</td><td>${pts1}</td><td>${Math.round(pts1*unit)}</td></tr>
        <tr><td>Оппонент</td><td>${pts2}</td><td>${Math.round(pts2*unit)}</td></tr>
      </table>`;
    document.getElementById('notes').textContent = note;
  }

  /* ====== события ====== */
  document.getElementById('reset').addEventListener('click', resetAll);
  document.getElementById('demo').addEventListener('click', demo);
  document.getElementById('calc').addEventListener('click', calc);

  // открыть пикер tap по самой карте
  document.getElementById('dealCard').addEventListener('click', ()=>{
    document.getElementById('openPicker').click();
  });

  /* ====== инициализация ====== */
  function initDeckInPicker(){
    // однажды отрисуем, далее будем пере‑рисовывать перед показом
    buildPickerDeck();
  }

  /* --- вспом: сборка колоды для пикера --- */
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
    picker.classList.remove('show');
    picker.setAttribute('aria-hidden','true');
  }
  function renderDealCard(){
    const deal = document.getElementById('dealCard');
    if (!currentDeal){ deal.textContent=''; deal.classList.add('empty'); }
    else { deal.textContent = currentDeal[0] + sym[currentDeal[1]]; deal.classList.remove('empty'); }
  }

  // модалка закрытие
  document.querySelectorAll('[data-close="picker"]').forEach(el=>{
    el.addEventListener('click', ()=>{
      picker.classList.remove('show');
      picker.setAttribute('aria-hidden','true');
    });
  });
  document.getElementById('openPicker').addEventListener('click', ()=>{
    buildPickerDeck();
    picker.classList.add('show');
    picker.setAttribute('aria-hidden','false');
  });

  // старт
  renderDealCard();
  initDeckInPicker();
})();

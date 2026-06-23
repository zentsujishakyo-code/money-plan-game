/* ============================================================
   マネープランゲーム  動作プログラム（game.js）
   ※ここはプログラムの本体です。ふつうの調整は config.js でできます。
   ============================================================ */

const ICONS = {
  shoe:"👟", food:"🍴", festival:"🏮", gift:"🎁", bulb:"💡", park:"🎡",
  cake:"🎂", book:"📖", heart:"🕊️", phone:"📱", home:"🏠", bus:"🚌",
  up:"⤴️", water:"🚰"
};

const GAME = {
  salary: 0,
  selections: {},   // expenseKey -> option index
  balance: 0,
  deck: [],
  idx: 0,

  /* ---- 画面きりかえ ---- */
  show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('s-'+id).classList.add('active');
    window.scrollTo(0,0);
  },

  start(where){
    this.salary = CONFIG.SALARY;
    this.selections = {};
    document.getElementById('sumSalary').textContent = yen(this.salary);
    if(where==='intro'){ this.show('intro'); }
    else { this.buildPlan(); this.show('plan'); }
  },

  goPlan(){ this.buildPlan(); this.show('plan'); },

  /* ---- プラン選択 ---- */
  buildPlan(){
    const host = document.getElementById('expList');
    host.innerHTML = '';
    CONFIG.EXPENSES.forEach(exp => {
      const box = document.createElement('div');
      box.className = 'exp';
      const name = exp.ruby ? rubyWrap(exp.name, exp.ruby) : exp.name;
      box.innerHTML = '<h3>'+name+'</h3>';
      const grid = document.createElement('div');
      grid.className = 'opts';
      exp.options.forEach((o,i) => {
        const b = document.createElement('button');
        b.className = 'opt';
        b.innerHTML = '<span class="tag">'+o.label+'</span>'
          + '<span class="nm">'+(o.textRuby||o.text)+'</span>'
          + '<span class="pr">'+o.cost.toLocaleString('ja-JP')+'</span>';
        b.onclick = () => {
          this.selections[exp.key] = i;
          grid.querySelectorAll('.opt').forEach(x=>x.classList.remove('sel'));
          b.classList.add('sel');
          this.updatePlan();
        };
        grid.appendChild(b);
      });
      box.appendChild(grid);
      host.appendChild(box);
    });
    this.updatePlan();
  },

  updatePlan(){
    const total = this.planTotal();
    const done = Object.keys(this.selections).length === CONFIG.EXPENSES.length;
    const totalEl = document.getElementById('sumTotal');
    const freeEl = document.getElementById('sumFree');
    const hint = document.getElementById('planHint');
    const next = document.getElementById('planNext');
    if(!done){
      totalEl.textContent = '—'; freeEl.textContent = '—';
      freeEl.classList.remove('neg');
      const left = CONFIG.EXPENSES.length - Object.keys(this.selections).length;
      hint.textContent = left===CONFIG.EXPENSES.length ? 'ぜんぶ えらぶと けいさんされるよ' : 'あと '+left+' つ えらんでね';
      next.style.display = 'none';
      return;
    }
    const free = this.salary - total;
    totalEl.textContent = yen(total);
    freeEl.textContent = yen(free);
    freeEl.classList.toggle('neg', free<0);
    hint.textContent = free<0 ? 'お給料より おおく つかう プランだよ' : 'のこったお金が ゲームの スタート金がくだよ';
    next.style.display = 'block';
  },

  planTotal(){
    let t=0;
    CONFIG.EXPENSES.forEach(exp=>{
      const i=this.selections[exp.key];
      if(i!==undefined) t+=exp.options[i].cost;
    });
    return t;
  },

  /* ---- ゲーム開始 ---- */
  startGame(){
    this.balance = this.salary - this.planTotal();
    this.deck = this.buildDeck();
    this.idx = 0;
    this.refreshHud();
    this.show('game');
    this.cardBack();
  },

  buildDeck(){
    const pays = CONFIG.CARDS.filter(c=>c.type==='pay');
    const others = shuffle(CONFIG.CARDS.filter(c=>c.type!=='pay'));
    if(!CONFIG.SPREAD_PAYDAY){
      return shuffle(CONFIG.CARDS.slice());
    }
    // 支払日カードを全体にばらけさせる
    const total = others.length + pays.length;
    const slots = pays.length;
    const deck = others.slice();
    const shuffledPays = shuffle(pays.slice());
    for(let s=0; s<slots; s++){
      const lo = Math.floor(total*s/slots);
      const hi = Math.floor(total*(s+1)/slots);
      const pos = lo + Math.floor(Math.random()*Math.max(1,(hi-lo)));
      deck.splice(Math.min(pos, deck.length), 0, shuffledPays[s]);
    }
    return deck;
  },

  refreshHud(){
    const bal = document.getElementById('gBal');
    bal.textContent = yen(this.balance);
    bal.classList.toggle('neg', this.balance<0);
    document.getElementById('gRem').textContent = (this.deck.length - this.idx)+'まい';
  },

  cardBack(){
    const stage = document.getElementById('gStage');
    if(this.idx >= this.deck.length){ this.finish(); return; }
    stage.innerHTML = '';
    const back = document.createElement('div');
    back.className = 'cardback';
    back.innerHTML = '<span class="qm">？</span>';
    back.onclick = () => this.reveal();
    stage.appendChild(back);
    const p = document.createElement('div');
    p.className = 'progress';
    p.textContent = 'カードを タップして めくろう（'+(this.idx+1)+' / '+this.deck.length+'）';
    stage.appendChild(p);
  },

  reveal(){
    const card = this.deck[this.idx];
    const stage = document.getElementById('gStage');
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'gamecard';

    const headClass = (card.type==='yellow'||card.type==='fukubiki') ? 'gc-yellow'
                    : (card.type==='red') ? 'gc-red' : 'gc-green';
    const ic = ICONS[card.icon] || '💴';
    wrap.innerHTML = '<div class="gc-head '+headClass+'">'
      + '<div class="ic">'+ic+'</div>'
      + '<h2>'+(card.titleRuby||card.title)+'</h2>'
      + (card.subtitle?'<div class="sub">'+(card.subtitleRuby||card.subtitle)+'</div>':'')
      + '</div>';
    const body = document.createElement('div');
    body.className = 'gc-body';
    wrap.appendChild(body);
    stage.appendChild(wrap);

    if(card.type==='green') this.renderGreen(card, body);
    else if(card.type==='pay') this.renderPay(card, body);
    else if(card.type==='fukubiki') this.renderFukubiki(card, body);
    else if(card.type==='yellow') this.renderYellow(card, body);
    else if(card.type==='red') this.renderRed(card, body);
  },

  renderGreen(card, body){
    card.options.forEach(o => {
      const b = document.createElement('button');
      b.className = 'choice '+o.label;
      b.innerHTML = '<span class="ci"><span class="badge">'+o.label+'</span>'
        + '<span>'+(o.textRuby||o.text)+'</span></span>'
        + '<span class="amt">'+o.cost.toLocaleString('ja-JP')+'えん</span>';
      b.onclick = () => {
        body.querySelectorAll('.choice').forEach(x=>x.disabled=true);
        b.classList.add('picked');
        this.pay(o.cost);
        this.afterAction(body, (o.textRuby||o.text)+'を えらんで '+o.cost.toLocaleString('ja-JP')+'えん 払ったよ');
      };
      body.appendChild(b);
    });
  },

  renderPay(card, body){
    const i = this.selections[card.expenseKey];
    const exp = CONFIG.EXPENSES.find(e=>e.key===card.expenseKey);
    const opt = exp.options[i];
    const box = document.createElement('div');
    box.className = 'bigbox box-info';
    box.innerHTML = '<div class="k">あなたは「'+(opt.textRuby||opt.text)+'」を えらんだね</div>'
      + '<div class="v">'+opt.cost.toLocaleString('ja-JP')+'えん 払うよ</div>';
    body.appendChild(box);
    const b = document.createElement('button');
    b.className='btn btn-primary'; b.style.marginTop='12px';
    b.textContent = opt.cost.toLocaleString('ja-JP')+'えん 払う';
    b.onclick = () => { b.disabled=true; this.pay(opt.cost); this.afterAction(body, '固定費を 払ったよ'); };
    body.appendChild(b);
  },

  renderFukubiki(card, body){
    const b = document.createElement('button');
    b.className='btn btn-primary';
    b.textContent='🎁 くじを 引く';
    b.onclick = () => {
      b.disabled=true;
      const win = Math.random() < CONFIG.FUKUBIKI_WIN_RATE;
      const amt = win ? card.win : card.lose;
      if(win && amt) this.gain(amt);
      const box = document.createElement('div');
      box.className = 'bigbox '+(win?'box-ok':'box-warn');
      box.style.marginTop='12px';
      box.innerHTML = win
        ? '<div class="k">あたり！</div><div class="v">'+amt.toLocaleString('ja-JP')+'えん もらえたよ</div>'
        : '<div class="k">はずれ…</div><div class="v">0えん</div>';
      body.appendChild(box);
      this.afterAction(body, '');
    };
    body.appendChild(b);
  },

  renderYellow(card, body){
    const box = document.createElement('div');
    box.className='bigbox box-ok';
    box.innerHTML = '<div class="k">'+(card.gainLabel||'もらえる')+'</div>'
      + '<div class="v">'+card.gain.toLocaleString('ja-JP')+'えん もらう</div>';
    body.appendChild(box);
    const b = document.createElement('button');
    b.className='btn btn-primary'; b.style.marginTop='12px';
    b.textContent='もらう';
    b.onclick = () => { b.disabled=true; this.gain(card.gain); this.afterAction(body, ''); };
    body.appendChild(b);
  },

  renderRed(card, body){
    const box = document.createElement('div');
    box.className='bigbox box-warn';
    box.innerHTML = '<div class="k">'+(card.costLabel||'')+'</div>'
      + '<div class="v">'+card.cost.toLocaleString('ja-JP')+'えん 払う</div>';
    body.appendChild(box);
    const b = document.createElement('button');
    b.className='btn btn-primary'; b.style.marginTop='12px';
    b.textContent = card.cost.toLocaleString('ja-JP')+'えん 払う';
    b.onclick = () => { b.disabled=true; this.pay(card.cost); this.afterAction(body, ''); };
    body.appendChild(b);
  },

  afterAction(body, msg){
    if(msg){
      const m = document.createElement('div');
      m.className='resultmsg'; m.style.color='var(--muted)';
      m.textContent = msg;
      body.appendChild(m);
    }
    const next = document.createElement('button');
    next.className='btn btn-primary'; next.style.marginTop='12px';
    next.textContent = (this.idx+1 >= this.deck.length) ? 'けっかを みる' : 'つぎの カードへ';
    next.onclick = () => { this.idx++; this.refreshHud(); this.cardBack(); };
    body.appendChild(next);
  },

  pay(n){ this.balance -= n; this.refreshHud(); },
  gain(n){ this.balance += n; this.refreshHud(); },

  /* ---- 結論 ---- */
  finish(){ this.show('game'); this.endScreen(); },

  endScreen(){
    const plus = this.balance >= 0;
    const e = CONFIG.ENDING;
    const m = plus ? e.plus : e.minus;
    const balEl = document.getElementById('endBal');
    balEl.textContent = yen(this.balance);
    balEl.classList.toggle('neg', this.balance<0);
    const big = document.getElementById('endBig');
    big.textContent = plus ? 'プラスで おわったね' : 'マイナスで おわったね';
    big.className = 'big '+(plus?'plus':'minus');
    document.getElementById('endHead').textContent = m.heading;
    document.getElementById('endBody').textContent = m.body;
    document.getElementById('endCommon').textContent = e.common;
    this.show('end');
  },

  restart(){
    this.selections = {};
    this.balance = 0;
    this.idx = 0;
    this.show('menu');
  }
};

/* ---- 小さな道具 ---- */
function yen(n){ return n.toLocaleString('ja-JP') + 'えん'; }
function rubyWrap(base, reading){ return '<ruby>'+base+'<rt>'+reading+'</rt></ruby>'; }
function shuffle(a){
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

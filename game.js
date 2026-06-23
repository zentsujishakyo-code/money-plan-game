/* ============================================================
   マネープランゲーム  動作プログラム（game.js）v2
   ※ふつうの調整は config.js でできます。
   ============================================================ */

const ICONS = {
  shoe:"👟", food:"🍴", festival:"🏮", gift:"🎁", bulb:"💡", park:"🎡",
  cake:"🎂", book:"📖", heart:"🩺", phone:"📱", home:"🏠", bus:"🚌",
  up:"⤴️", water:"🚰"
};

const GAME = {
  salary: 0,
  selections: {},     // expenseKey -> option index
  flags: {},          // shikaku / hoken など
  balance: 0,
  deck: [],
  idx: 0,
  diff: null,

  show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('s-'+id).classList.add('active');
    window.scrollTo(0,0);
  },

  start(where){
    this.salary = CONFIG.SALARY;
    this.selections = {};
    this.flags = {};
    this.diff = CONFIG.DIFFICULTY_SETS[CONFIG.DIFFICULTY] || CONFIG.DIFFICULTY_SETS.normal;
    document.getElementById('sumSalary').textContent = yen(this.salary);
    if(where==='intro'){ this.show('intro'); }
    else { this.buildPlan(); this.show('plan'); }
  },

  goPlan(){ this.buildPlan(); this.show('plan'); },

  setDiff(key){
    CONFIG.DIFFICULTY = key;
    ['easy','normal','hard'].forEach(k=>{
      const b = document.getElementById('diff-'+k);
      if(b) b.classList.toggle('on', k===key);
    });
  },

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
      totalEl.textContent='—'; freeEl.textContent='—'; freeEl.classList.remove('neg');
      const left = CONFIG.EXPENSES.length - Object.keys(this.selections).length;
      hint.textContent = left===CONFIG.EXPENSES.length ? 'ぜんぶ えらぶと けいさんされるよ' : 'あと '+left+' つ えらんでね';
      next.style.display='none'; return;
    }
    const free = this.salary - total;
    totalEl.textContent = yen(total);
    freeEl.textContent = yen(free);
    freeEl.classList.toggle('neg', free<0);
    hint.textContent = free<0 ? 'お給料より おおく つかう プランだよ' : 'のこったお金が ゲームの スタート金がくだよ';
    next.style.display='block';
  },

  planTotal(){
    let t=0;
    CONFIG.EXPENSES.forEach(exp=>{ const i=this.selections[exp.key]; if(i!==undefined) t+=exp.options[i].cost; });
    return t;
  },

  /* ワークシート1で何を選んだか（label で判定するため） */
  expenseLabel(key){
    const exp = CONFIG.EXPENSES.find(e=>e.key===key);
    const i = this.selections[key];
    return exp.options[i].label;
  },

  /* ---- ゲーム開始 ---- */
  startGame(){
    this.balance = this.salary - this.planTotal();
    this.flags = {};
    this.deck = this.buildDeck();
    this.idx = 0;
    this.refreshHud();
    this.show('game');
    this.cardBack();
  },

  /* 山札を作る：CARDSからDRAW_COUNT枚を抽選し、支払日5枚をばらけて差し込む */
  buildDeck(){
    const drawCount = this.diff.drawCount || CONFIG.DRAW_COUNT;
    const hiCap = (this.diff.hiCap !== undefined) ? this.diff.hiCap : 2;

    // もらえるカード(yellow/fukubiki)
    let lucky = shuffle(CONFIG.CARDS.filter(c=>c.type==='yellow'||c.type==='fukubiki'));
    // 払う・選ぶカードを「高額(2万円以上)」と「ふつう」に分ける
    let rest = CONFIG.CARDS.filter(c=>c.type==='green'||c.type==='red');
    let hi = shuffle(rest.filter(c=>this.cardMaxCost(c) >= 20000));
    let lo = shuffle(rest.filter(c=>this.cardMaxCost(c) < 20000));

    const luckyTarget = Math.max(0, Math.min(lucky.length, Math.round(lucky.length/2) + (this.diff.luckyBoost||0)));
    const chosenLucky = lucky.slice(0, luckyTarget);
    const restNeed = Math.max(0, drawCount - chosenLucky.length);
    const hiPick = hi.slice(0, hiCap);                                  // 高額はhiCap枚まで
    const loPick = lo.slice(0, Math.max(0, restNeed - hiPick.length));  // 残りはふつうカードで埋める

    let chosen = shuffle(chosenLucky.concat(hiPick).concat(loPick));

    // 支払日カードを必ず入れて、全体にばらけさせる
    const pays = shuffle(CONFIG.PAYDAY_CARDS.slice());
    if(!CONFIG.SPREAD_PAYDAY){
      return shuffle(chosen.concat(pays));
    }
    const deck = chosen.slice();
    const slots = pays.length;
    const total = deck.length + pays.length;
    for(let s=0; s<slots; s++){
      const lo2 = Math.floor(total*s/slots);
      const hi2 = Math.floor(total*(s+1)/slots);
      const pos = lo2 + Math.floor(Math.random()*Math.max(1,(hi2-lo2)));
      deck.splice(Math.min(pos, deck.length), 0, pays[s]);
    }
    return deck;
  },

  /* カードの最大コスト（高額判定用） */
  cardMaxCost(c){
    if(c.type==='green') return Math.max(...c.options.map(o=>o.cost));
    if(c.type==='red') return c.cost;
    return 0;
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
      + '<h2>'+card.title+'</h2>'
      + (card.subtitle?'<div class="sub">'+card.subtitle+'</div>':'')
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
      // onlyIfFlag：条件を満たさない人にはこの選択肢を出さない
      if(o.onlyIfFlag && !this.flags[o.onlyIfFlag]) return;
      const b = document.createElement('button');
      b.className = 'choice '+o.label;
      b.innerHTML = '<span class="ci"><span class="badge">'+o.label+'</span>'
        + '<span>'+o.text+'</span></span>'
        + '<span class="amt">'+o.cost.toLocaleString('ja-JP')+'えん</span>';
      b.onclick = () => {
        body.querySelectorAll('.choice').forEach(x=>x.disabled=true);
        b.classList.add('picked');
        // 宝くじ：買うと当たりで5,000円
        let extraMsg = '';
        if(o.lottery){
          this.pay(o.cost);
          const win = Math.random() < 0.5;
          if(win){ this.gain(5000); extraMsg = 'じゃんけんに 勝って 5,000えん もらえた！'; }
          else { extraMsg = 'ざんねん、はずれ…'; }
        } else {
          this.pay(o.cost);
        }
        if(o.setsFlag){ this.flags[o.setsFlag] = true; }
        if(o.note){ extraMsg = (extraMsg?extraMsg+' ':'') + o.note; }
        const base = o.cost>0 ? (o.text+'を えらんで '+o.cost.toLocaleString('ja-JP')+'えん 払ったよ') : (o.text+'を えらんだよ（0えん）');
        this.afterAction(body, extraMsg ? base+'／'+extraMsg : base, this.fxForPay(o.cost));
      };
      body.appendChild(b);
    });
  },

  renderPay(card, body){
    const exp = CONFIG.EXPENSES.find(e=>e.key===card.expenseKey);
    const i = this.selections[card.expenseKey];
    const opt = exp.options[i];
    const box = document.createElement('div');
    box.className = 'bigbox box-info';
    box.innerHTML = '<div class="k">あなたは「'+opt.text+'」を えらんだね</div>'
      + '<div class="v">'+opt.cost.toLocaleString('ja-JP')+'えん 払うよ</div>';
    body.appendChild(box);
    const b = document.createElement('button');
    b.className='btn btn-primary'; b.style.marginTop='12px';
    b.textContent = opt.cost.toLocaleString('ja-JP')+'えん 払う';
    b.onclick = () => { b.disabled=true; this.pay(opt.cost); this.afterAction(body, '毎月の 固定費を 払ったよ', this.fxForPay(opt.cost)); };
    body.appendChild(b);
  },

  renderFukubiki(card, body){
    const rate = (this.diff.fukubikiWin!==undefined) ? this.diff.fukubikiWin : CONFIG.FUKUBIKI_WIN_RATE;
    const b = document.createElement('button');
    b.className='btn btn-primary';
    b.textContent='🎁 くじを 引く';
    b.onclick = () => {
      b.disabled=true;
      const win = Math.random() < rate;
      const amt = win ? card.win : card.lose;
      if(win && amt) this.gain(amt);
      const box = document.createElement('div');
      box.className = 'bigbox '+(win?'box-ok':'box-warn'); box.style.marginTop='12px';
      box.innerHTML = win
        ? '<div class="k">あたり！</div><div class="v">'+amt.toLocaleString('ja-JP')+'えん もらえたよ</div>'
        : '<div class="k">はずれ…</div><div class="v">0えん</div>';
      body.appendChild(box);
      this.afterAction(body, '', win?'plus':'flat');
    };
    body.appendChild(b);
  },

  renderYellow(card, body){
    // requireFlag / requireExpense を満たさない場合は「もらえない」表示
    if(card.requireFlag && !this.flags[card.requireFlag]){
      const box = document.createElement('div');
      box.className='bigbox box-warn';
      box.innerHTML = '<div class="k">ざんねん</div><div class="v" style="font-size:18px;">'+(card.noFlagText||'今回は もらえません')+'</div>';
      body.appendChild(box);
      this.afterAction(body, '', 'flat'); return;
    }
    if(card.requireExpense){
      const got = this.expenseLabel(card.requireExpense.key) === card.requireExpense.label;
      if(!got){
        const box = document.createElement('div');
        box.className='bigbox box-warn';
        box.innerHTML = '<div class="k">ざんねん</div><div class="v" style="font-size:16px;">'+card.requireExpense.reason+'<br>今回は もらえません</div>';
        body.appendChild(box);
        this.afterAction(body, '', 'flat'); return;
      }
    }
    const box = document.createElement('div');
    box.className='bigbox box-ok';
    let reason = card.requireExpense ? '<div class="k" style="font-size:13px;">'+card.requireExpense.reason+'</div>' : '';
    box.innerHTML = reason + '<div class="k">'+(card.gainLabel||'もらえる')+'</div>'
      + '<div class="v">'+card.gain.toLocaleString('ja-JP')+'えん もらう</div>';
    body.appendChild(box);
    const b = document.createElement('button');
    b.className='btn btn-primary'; b.style.marginTop='12px';
    b.textContent='もらう';
    b.onclick = () => { b.disabled=true; this.gain(card.gain); this.afterAction(body, '', 'plus'); };
    body.appendChild(b);
  },

  renderRed(card, body){
    // requireExpense（車の修理など）を満たさない人はスキップ案内
    if(card.requireExpense){
      const got = this.expenseLabel(card.requireExpense.key) === card.requireExpense.label;
      if(!got){
        const box = document.createElement('div');
        box.className='bigbox box-ok';
        box.innerHTML = '<div class="k">セーフ！</div><div class="v" style="font-size:16px;">'+card.requireExpense.reason+'<br>あなたは 払わなくて OK</div>';
        body.appendChild(box);
        this.afterAction(body, '', 'flat'); return;
      }
    }
    const box = document.createElement('div');
    box.className='bigbox box-warn';
    box.innerHTML = '<div class="k">'+(card.costLabel||'')+'</div>'
      + '<div class="v">'+card.cost.toLocaleString('ja-JP')+'えん 払う</div>';
    body.appendChild(box);
    const b = document.createElement('button');
    b.className='btn btn-primary'; b.style.marginTop='12px';
    b.textContent = card.cost.toLocaleString('ja-JP')+'えん 払う';
    b.onclick = () => { b.disabled=true; this.pay(card.cost); this.afterAction(body, '', this.fxForPay(card.cost)); };
    body.appendChild(b);
  },

  fxForPay(cost){ return cost >= 20000 ? 'bigminus' : (cost>0 ? 'minus' : 'flat'); },

  afterAction(body, msg, fx){
    if(fx) this.playFx(fx);
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

  /* 演出フック（今は残高の色変化＋簡単な揺れ。あとでキャラ等に拡張） */
  playFx(kind){
    const hud = document.querySelector('.hud');
    if(!hud) return;
    hud.classList.remove('fx-plus','fx-minus','fx-bigminus');
    void hud.offsetWidth; // リセット
    if(kind==='plus') hud.classList.add('fx-plus');
    else if(kind==='minus') hud.classList.add('fx-minus');
    else if(kind==='bigminus') hud.classList.add('fx-bigminus');
  },

  pay(n){ this.balance -= n; this.refreshHud(); },
  gain(n){ this.balance += n; this.refreshHud(); },

  finish(){ this.endScreen(); },

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

  restart(){ this.selections={}; this.flags={}; this.balance=0; this.idx=0; this.show('menu'); }
};

function yen(n){ return n.toLocaleString('ja-JP') + 'えん'; }
function rubyWrap(base, reading){ return '<ruby>'+base+'<rt>'+reading+'</rt></ruby>'; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

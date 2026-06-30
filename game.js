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

  // ---- 複数人モード用 ----
  multi: false,       // みんなで遊ぶモードか
  players: [],        // [{name, selections, savingCourse, balance, flags, paidFixed, log:[]}]
  turn: 0,            // いま入力している人（0始まり）
  setupIdx: 0,        // 準備中：いま設定している人

  show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('s-'+id).classList.add('active');
    window.scrollTo(0,0);
  },

  start(where){
    this.salary = CONFIG.SALARY;
    this.selections = {};
    this.flags = {};
    this.savingCourse = null;
    this.diff = CONFIG.DIFFICULTY_SETS[CONFIG.DIFFICULTY] || CONFIG.DIFFICULTY_SETS.easy;
    document.getElementById('sumSalary').textContent = yen(this.salary);
    if(where==='learn'){ this.show('learn'); }
    else { this.buildPlan(); this.show('plan'); }
  },

  goPlan(){ this.buildPlan(); this.show('plan'); },

  /* =================================================================
     みんなで遊ぶモード（複数人・パスアンドプレイ）
     ================================================================= */

  /* 「みんなで遊ぶ」を選んだ：人数を決める画面へ（難易度はタイトルで選択済み） */
  startMulti(){
    this.multi = true;
    this.players = [];
    this.salary = CONFIG.SALARY;
    this.diff = CONFIG.DIFFICULTY_SETS[CONFIG.DIFFICULTY] || CONFIG.DIFFICULTY_SETS.easy;
    document.getElementById('sumSalary').textContent = yen(this.salary);
    this.show('mcount');
  },

  /* （未使用）難易度画面：タイトルの難易度を使うため不要だが互換のため残す */
  mSetDiff(key){
    CONFIG.DIFFICULTY = key;
    ['easy','normal'].forEach(k=>{
      const b = document.getElementById('mdiff-'+k);
      if(b) b.classList.toggle('on', k===key);
    });
  },
  mGoCount(){
    this.diff = CONFIG.DIFFICULTY_SETS[CONFIG.DIFFICULTY] || CONFIG.DIFFICULTY_SETS.easy;
    this.show('mcount');
  },

  /* 人数を選んだ：各自の設定（名前→プラン→目標）へ */
  mSetCount(n){
    this.playerCount = n;
    this.players = [];
    for(let i=0;i<n;i++){
      this.players.push({ name:'', selections:{}, savingCourse:null,
        balance:0, flags:{}, paidFixed:{}, log:[] });
    }
    this.setupIdx = 0;
    this.mSetupPlayer();
  },

  /* いまの人の「名前・プラン・目標」を入力する画面 */
  mSetupPlayer(){
    const i = this.setupIdx;
    const total = this.playerCount;
    document.getElementById('mSetupTitle').textContent =
      (i+1)+'人目（ぜんいんで '+total+'人）の せってい';
    // 名前欄をリセット
    const nameInput = document.getElementById('mName');
    nameInput.value = this.players[i].name || '';
    // プラン（くらし）を作る
    this.selections = {};   // 一時的に使う
    this.buildMPlan();
    // 目標コースを作る
    this.buildMCourse();
    this._setupChoice = null;
    this.show('msetup');
    this.mSetupValidate();
  },

  buildMPlan(){
    const host = document.getElementById('mExpList');
    host.innerHTML = '';
    CONFIG.EXPENSES.forEach(exp => {
      const box = document.createElement('div');
      box.className = 'exp';
      const name = exp.ruby ? rubyWrap(exp.name, exp.ruby) : exp.name;
      const ic = ICONS[exp.icon] || '';
      box.innerHTML = '<h3><span class="exp-ic">'+ic+'</span>'+name+'</h3>';
      const grid = document.createElement('div');
      grid.className = 'opts';
      exp.options.forEach((o,idx) => {
        const b = document.createElement('button');
        b.className = 'opt opt-'+o.label;
        b.innerHTML = '<span class="tag">'+o.label+'</span>'
          + '<span class="nm">'+(o.textRuby||o.text)+'</span>'
          + '<span class="pr">'+o.cost.toLocaleString('ja-JP')+'</span>';
        b.onclick = () => {
          this.selections[exp.key] = idx;
          grid.querySelectorAll('.opt').forEach(x=>x.classList.remove('sel'));
          b.classList.add('sel');
          this.mSetupValidate();
        };
        grid.appendChild(b);
      });
      box.appendChild(grid);
      host.appendChild(box);
    });
  },

  buildMCourse(){
    const host = document.getElementById('mCourseList');
    host.innerHTML = '';
    const icons = { hi:'🐷', mid:'💰', lo:'🛟' };
    CONFIG.SAVING_COURSES.forEach(c => {
      const b = document.createElement('button');
      b.className = 'course '+c.key;
      b.innerHTML = '<span class="cic">'+(icons[c.key]||'💰')+'</span>'
        + '<span class="ctx"><span class="cname">'+(c.ruby||c.label)+'</span>'
        + '<span class="csub">'+c.sub+'</span></span>';
      b.onclick = () => {
        this._setupChoice = c;
        host.querySelectorAll('.course').forEach(x=>x.classList.remove('sel'));
        b.classList.add('sel');
        this.mSetupValidate();
      };
      host.appendChild(b);
    });
  },

  /* 名前・プラン5つ・目標が そろったら「つぎへ」を出す */
  mSetupValidate(){
    const nameOk = document.getElementById('mName').value.trim().length>0;
    const planOk = Object.keys(this.selections).length === CONFIG.EXPENSES.length;
    const courseOk = !!this._setupChoice;
    const btn = document.getElementById('mSetupNext');
    btn.style.display = (nameOk && planOk && courseOk) ? 'block' : 'none';
  },

  /* いまの人の設定を保存して、次の人へ／全員終わったらゲーム開始 */
  mSetupNext(){
    const i = this.setupIdx;
    const pl = this.players[i];
    pl.name = document.getElementById('mName').value.trim();
    pl.selections = Object.assign({}, this.selections);
    pl.savingCourse = this._setupChoice;
    pl.balance = this.salary - this.mPlanTotal(pl.selections);
    if(i+1 < this.playerCount){
      this.setupIdx = i+1;
      this.mSetupPlayer();
    } else {
      this.mStartGame();
    }
  },

  mPlanTotal(sel){
    let t=0;
    CONFIG.EXPENSES.forEach(exp=>{ const idx=sel[exp.key]; if(idx!==undefined) t+=exp.options[idx].cost; });
    return t;
  },

  /* ---- 複数人ゲーム開始 ---- */
  mStartGame(){
    // 全員 共通のデッキを1つ作る。宝くじの抽選カードと資格のランクアップカードは
    // 全員に同じ位置で出し、結果だけ各プレイヤーの選択・状況で変える（案A）。
    this.selections = this.players[0].selections; // buildDeck内の参照用（高額判定等）
    this.flags = {};
    let deck = this.buildDeck();
    deck = this.mInjectFeaturedResults(deck);  // 抽選カード・ランクアップを固定配置
    this.deck = deck;
    this.idx = 0;        // いま何枚目か（全員 同じ位置で進む）
    this.turn = 0;       // いまそのカードを引く人
    this.players.forEach(pl => { pl.flags={}; pl.paidFixed={}; pl.boughtLottery=false; pl.lotteryWin=null; pl.log=[]; });
    this.show('mgame');
    this.mAnnounce();
  },

  /* 複数人用：宝くじカードの3枚あとに抽選カード、資格カードの後にランクアップを固定で入れる */
  mInjectFeaturedResults(deck){
    // 宝くじカードの位置を探し、その delay 枚あとに抽選カードを入れる
    const lotIdx = deck.findIndex(c => c.type==='green' && c.options && c.options.some(o=>o.lottery));
    if(lotIdx >= 0 && !deck.some(c=>c.type==='lottery_result')){
      const at = Math.min(lotIdx + 1 + CONFIG.LOTTERY.delay, deck.length);
      deck.splice(at, 0, { type:'lottery_result', title:'宝くじの 抽選日！', icon:'gift' });
    }
    // 資格カードの位置を探し、その3枚あと以降にランクアップを入れる（無ければ元データから）
    const shiIdx = deck.findIndex(c => c.type==='green' && c.options && c.options.some(o=>o.setsFlag==='shikaku'));
    let rank = deck.find(c => c.requireFlag==='shikaku');
    if(!rank){ rank = CONFIG.CARDS.find(c => c.requireFlag==='shikaku'); }
    // すでにデッキにランクアップがあれば抜いて、資格の後ろへ置き直す
    const existing = deck.findIndex(c => c.requireFlag==='shikaku');
    if(existing >= 0) deck.splice(existing, 1);
    if(shiIdx >= 0 && rank){
      const at = Math.min(shiIdx + 3, deck.length);
      deck.splice(at, 0, Object.assign({}, rank));
    }
    return deck;
  },

  /* 「○○さん、カードを引いてください」のお知らせ */
  mAnnounce(){
    // 全カード終了？
    if(this.idx >= this.deck.length){ this.mEndScreen(); return; }
    const pl = this.players[this.turn];
    const stage = document.getElementById('mStage');
    stage.innerHTML =
      '<div class="announce">'
      + '<div class="an-sub">'+(this.idx+1)+'まいめ / '+this.deck.length+'まい</div>'
      + '<div class="an-name">'+this.escapeHtml(pl.name)+' さん</div>'
      + '<div class="an-msg">カードを ひいてください</div>'
      + '<button class="btn btn-primary" id="anBtn">カードを ひく</button>'
      + '</div>';
    this.mRefreshBoard();
    document.getElementById('anBtn').onclick = () => this.mReveal();
  },

  /* 裏向きカードを出して、タップでめくる */
  mCardBack(){
    const stage = document.getElementById('mStage');
    const pl = this.players[this.turn];
    stage.innerHTML =
      '<div class="turn-label">'+this.escapeHtml(pl.name)+' さんの ばん</div>'
      + '<div class="cardback" id="mBack"><span class="qm">？</span></div>'
      + '<div class="progress">タップして めくろう</div>';
    document.getElementById('mBack').onclick = () => this.mReveal();
    this.mRefreshBoard();
  },

  /* カードをめくって、いまの人の選択を受け付ける */
  mReveal(){
    const card = this.deck[this.idx];
    const pl = this.players[this.turn];
    // 一人用の reveal を再利用するため、現在プレイヤーの状態を GAME 本体に橋渡しする
    this._bindPlayer(pl);
    const stage = document.getElementById('mStage');
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'gamecard';
    const headClass = (card.type==='yellow'||card.type==='fukubiki'||card.type==='lottery_result') ? 'gc-yellow'
                    : (card.type==='red') ? 'gc-red' : 'gc-green';
    const ic = ICONS[card.icon] || '💴';
    wrap.innerHTML = '<div class="gc-head '+headClass+'">'
      + '<div class="turn-mini">'+this.escapeHtml(pl.name)+' さん</div>'
      + '<div class="ic">'+ic+'</div>'
      + '<h2>'+card.title+'</h2>'
      + (card.subtitle?'<div class="sub">'+card.subtitle+'</div>':'')
      + '</div>';
    const body = document.createElement('div');
    body.className = 'gc-body';
    wrap.appendChild(body);
    stage.appendChild(wrap);
    this.mRefreshBoard();

    // 選択後に呼ばれる「次へ」を、複数人用に差し替える
    this._afterHook = () => this.mAfterTurn();

    if(card.type==='green') this.renderGreen(card, body);
    else if(card.type==='pay') this.renderPay(card, body);
    else if(card.type==='fukubiki') this.renderFukubiki(card, body);
    else if(card.type==='yellow') this.renderYellow(card, body);
    else if(card.type==='red') this.renderRed(card, body);
    else if(card.type==='lottery_result') this.renderLotteryResult(card, body);
  },

  /* 現在プレイヤーの状態を GAME本体のプロパティに割り当て（一人用関数を流用するため） */
  _bindPlayer(pl){
    this.balance = pl.balance;
    this.flags = pl.flags;
    this.paidFixed = pl.paidFixed;
    this.selections = pl.selections;
    this.savingCourse = pl.savingCourse;
    this.rankCard = pl.rankCard;
    this._cur = pl;
  },
  /* GAME本体の状態を 現在プレイヤーに書き戻す */
  _savePlayer(){
    const pl = this._cur;
    if(!pl) return;
    pl.balance = this.balance;
    pl.flags = this.flags;
    pl.paidFixed = this.paidFixed;
    pl.rankCard = this.rankCard;
  },

  /* いまの人の選択が終わったあと：次の人 or 次のカードへ */
  mAfterTurn(){
    this._savePlayer();
    if(this.turn + 1 < this.playerCount){
      this.turn++;
      this.mAnnounce();      // 次の人へ（同じカード）
    } else {
      this.turn = 0;
      this.idx++;
      this.mAnnounce();      // 次のカードへ（最初の人から）
    }
  },

  /* 今の手番の人の 残高だけを 大きく表示（他の人の残高は見せない） */
  mRefreshBoard(){
    this.mRenderFixedBar();
    const board = document.getElementById('mBoard');
    if(!board) return;
    const pl = this.players[this.turn];
    if(!pl){ board.innerHTML=''; return; }
    const neg = pl.balance<0 ? ' neg' : '';
    board.innerHTML =
      '<div class="my-bal-box">'
      + '<div class="mb-label">'+this.escapeHtml(pl.name)+' さんの ざんだか</div>'
      + '<div class="mb-bal'+neg+'">'+yen(pl.balance)+'</div>'
      + '</div>';
  },

  /* ---- 複数人 結果画面（全員ならべて見せる） ---- */
  mEndScreen(){
    const leftover = document.getElementById('charPop');
    if(leftover) leftover.remove();
    const host = document.getElementById('mResultList');
    host.innerHTML = '';
    this.players.forEach(pl => {
      const plus = pl.balance >= 0;
      const course = pl.savingCourse;
      const goal = course ? course.goal : 0;
      let stars;
      if(pl.balance>=0 && (course? pl.balance>=goal : true)) stars=3;
      else if(pl.balance>=0) stars=2; else stars=1;
      let starHtml='';
      for(let s=0;s<3;s++) starHtml += '<span class="star '+(s<stars?'on':'')+'">★</span>';
      // その人の ふりかえりコメント（一人用と同じ粒度）
      const refl = this.buildReflection({ selections:pl.selections, flags:pl.flags, balance:pl.balance });
      const reflHtml = '<div class="rc-reflect">'
        + refl.map(t=>'<div class="rc-rline">・'+t+'</div>').join('')
        + '</div>';
      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML =
        '<div class="rc-top">'
        + '<div class="rc-name">'+this.escapeHtml(pl.name)+'</div>'
        + '<div class="rc-bal'+(plus?'':' neg')+'">'+yen(pl.balance)+'</div>'
        + '<div class="rc-goal">目標：'+(course?course.label:'—')+'</div>'
        + '<div class="rc-stars">'+starHtml+'</div>'
        + '</div>'
        + reflHtml;
      host.appendChild(card);
    });
    // 話し合いのきっかけ（毎回ランダムで いくつか）
    const talk = document.getElementById('mTalk');
    if(talk){
      const all = (CONFIG.TALK_QUESTIONS || []).slice();
      const n = CONFIG.TALK_SHOW || 4;
      shuffle(all);
      const pick = all.slice(0, Math.min(n, all.length));
      talk.innerHTML = '<div class="talk-title">みんなで 話してみよう</div>'
        + pick.map(q=>'<div class="talk-line">・'+q+'</div>').join('');
    }
    this.show('mend');
  },

  escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },

  /* 今の手番の人の 固定費バーを描く */
  mRenderFixedBar(){
    const bar = document.getElementById('mFixedBar');
    if(!bar) return;
    const pl = this.players[this.turn];
    if(!pl || !pl.selections){ bar.innerHTML=''; return; }
    const paid = pl.paidFixed || {};
    bar.innerHTML = '<div class="mfx-name">'+this.escapeHtml(pl.name)+' さんの こていひ</div>'
      + '<div class="mfx-row">'
      + CONFIG.PAYDAY_CARDS.map(pc => {
          const exp = CONFIG.EXPENSES.find(e=>e.key===pc.expenseKey);
          const idx = pl.selections[pc.expenseKey];
          const cost = (exp && idx!==undefined) ? exp.options[idx].cost : 0;
          const name = (exp&&exp.name)?exp.name:pc.title;
          const done = paid[pc.expenseKey] ? ' paid' : '';
          return '<div class="fc'+done+'"><span class="fcname">'+name+'</span>'
            + '<span class="fcyen">'+cost.toLocaleString('ja-JP')+'</span></div>';
        }).join('')
      + '</div>';
  },

  /* 貯金チャレンジ画面へ */
  goChallenge(){
    const host = document.getElementById('courseList');
    host.innerHTML = '';
    const icons = { hi:'🐷', mid:'💰', lo:'🛟' };
    CONFIG.SAVING_COURSES.forEach(c => {
      const b = document.createElement('button');
      b.className = 'course '+c.key;
      b.innerHTML = '<span class="cic">'+(icons[c.key]||'💰')+'</span>'
        + '<span class="ctx"><span class="cname">'+(c.ruby||c.label)+'</span>'
        + '<span class="csub">'+c.sub+'</span></span>';
      b.onclick = () => { this.savingCourse = c; this.buildPlan(); this.show('plan'); };
      host.appendChild(b);
    });
    this.show('challenge');
  },

  setDiff(key){
    CONFIG.DIFFICULTY = key;
    ['easy','normal'].forEach(k=>{
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
      const ic = ICONS[exp.icon] || '';
      box.innerHTML = '<h3><span class="exp-ic">'+ic+'</span>'+name+'</h3>';
      const grid = document.createElement('div');
      grid.className = 'opts';
      exp.options.forEach((o,i) => {
        const b = document.createElement('button');
        b.className = 'opt opt-'+o.label;   // opt-A / opt-B / opt-C で色分け
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
    this.paidFixed = {};            // 支払い済みの固定費
    this.deck = this.buildDeck();
    this.idx = 0;
    this.buildFixedBar();
    this.refreshHud();
    this.show('game');
    this.cardBack();
  },

  /* 固定費バーを作る（残高の下に常時表示） */
  buildFixedBar(){
    const bar = document.getElementById('fixedBar');
    if(!bar) return;
    bar.innerHTML = '';
    CONFIG.PAYDAY_CARDS.forEach(pc => {
      const exp = CONFIG.EXPENSES.find(e => e.key === pc.expenseKey);
      const cost = exp ? this.optCost(pc.expenseKey) : 0;
      const cell = document.createElement('div');
      cell.className = 'fc';
      cell.id = 'fc-' + pc.expenseKey;
      const shortName = (exp && exp.name) ? exp.name : pc.title;
      cell.innerHTML = '<span class="fcname">'+shortName+'</span>'
        + '<span class="fcyen">'+cost.toLocaleString('ja-JP')+'</span>';
      bar.appendChild(cell);
    });
  },

  /* プランで選んだ その固定費の金額 */
  optCost(key){
    const lab = this.expenseLabel(key);
    const exp = CONFIG.EXPENSES.find(e=>e.key===key);
    if(!exp) return 0;
    const o = exp.options.find(x=>x.label===lab);
    return o ? o.cost : 0;
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

    // よく出したいカード（宝くじ・資格など）を、指定の確率で必ず入れる
    (CONFIG.FEATURED_CARDS || []).forEach(f => {
      const already = chosen.some(c => c.title === f.title);
      if(already) return;                       // すでに入っていれば何もしない
      if(Math.random() >= f.rate) return;       // 確率で出さない回もある
      const src = CONFIG.CARDS.find(c => c.title === f.title);
      if(!src) return;
      // ふつうカードを1枚 押し出して、代わりに入れる（枚数を保つ）
      const loIdx = chosen.findIndex(c => (c.type==='green'||c.type==='red') && this.cardMaxCost(c) < 20000
                      && !(CONFIG.FEATURED_CARDS || []).some(ff=>ff.title===c.title));
      if(loIdx >= 0){ chosen.splice(loIdx, 1, src); }
      else { chosen.push(src); }
    });
    chosen = shuffle(chosen);

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
    // ランクアップ（資格でもらえるカード）は最初はデッキから除外。
    // 資格を取ったときに、あとから動的に差し込む。
    this.rankCard = null;
    for(let k=deck.length-1; k>=0; k--){
      if(deck[k].requireFlag === 'shikaku'){
        this.rankCard = deck.splice(k,1)[0];
      }
    }
    return deck;
  },

  /* 資格を取ったとき：50%でランクアップを「3枚以上あと」に差し込む */
  tryScheduleRankup(){
    if(this.multi) return;                // 複数人モードでは共通デッキを崩さない
    if(!this.rankCard) return;            // ランクアップ自体が無い回
    if(Math.random() >= 0.5) return;      // 半々で出ない
    const earliest = this.idx + 4;        // 今のカードから3枚以上あと（=4枚目以降）
    if(earliest > this.deck.length) return; // もう入れる余地がなければ出さない
    const span = this.deck.length - earliest;
    const pos = earliest + (span>0 ? Math.floor(Math.random()*(span+1)) : 0);
    this.deck.splice(Math.min(pos, this.deck.length), 0, this.rankCard);
    this.rankCard = null;                 // 一度だけ
    this.refreshHud();                    // のこり枚数表示を更新
  },

  /* カードの最大コスト（高額判定用） */
  cardMaxCost(c){
    if(c.type==='green') return Math.max(...c.options.map(o=>o.cost));
    if(c.type==='red') return c.cost;
    return 0;
  },

  refreshHud(){
    if(this.multi){ this.mRefreshBoard(); return; }
    const bal = document.getElementById('gBal');
    if(!bal) return;
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
    const headClass = (card.type==='yellow'||card.type==='fukubiki'||card.type==='lottery_result') ? 'gc-yellow'
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
    else if(card.type==='lottery_result') this.renderLotteryResult(card, body);
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
        // お金を払うと残高がマイナスになる場合は、緑カードだけ警告を出す
        const willGoNegative = (o.cost > 0) && ((this.balance - o.cost) < 0);
        if(willGoNegative){
          this.confirmMinus(o.cost, () => this.applyGreenChoice(card, o, b, body));
        } else {
          this.applyGreenChoice(card, o, b, body);
        }
      };
      body.appendChild(b);
    });
  },

  /* 緑カードの選択を実行する */
  applyGreenChoice(card, o, b, body){
    // 選ばなかった選択肢は薄くし、選んだものだけ目立たせる
    body.querySelectorAll('.choice').forEach(x=>{ x.disabled=true; x.classList.add('faded'); });
    b.classList.remove('faded');
    b.classList.add('picked');
    let extraMsg = '';
    let fxKind = null;
    if(o.lottery){
      this.pay(o.cost);
      if(this.multi){
        // 案A：買ったことだけ記録。当落は後の「抽選日」カードで全員に見せる
        this._cur.boughtLottery = true;
        this._cur.lotteryWin = (Math.random() < CONFIG.LOTTERY.winRate);
        extraMsg = '宝くじを 買ったよ。あとで 抽選が あるよ！';
      } else {
        this.scheduleLottery();   // 一人用：3枚あとに 抽選結果カードを差し込む
        extraMsg = '宝くじを 買ったよ。3まい あとに 抽選が あるよ！';
      }
    } else {
      this.pay(o.cost);
    }
    if(o.setsFlag){
      this.flags[o.setsFlag] = true;
      if(o.setsFlag==='shikaku'){ this.tryScheduleRankup(); }
    }
    if(o.note){ extraMsg = (extraMsg?extraMsg+' ':'') + o.note; }
    const base = o.cost>0 ? (o.text+'を えらんで '+o.cost.toLocaleString('ja-JP')+'えん 払ったよ') : (o.text+'を えらんだよ（0えん）');
    this.afterAction(body, extraMsg ? base+'／'+extraMsg : base, fxKind);
  },

  /* 宝くじ：当落を今のうちに決めて、抽選結果カードを delay 枚あとに差し込む */
  scheduleLottery(){
    const L = CONFIG.LOTTERY;
    const win = Math.random() < L.winRate;
    const resultCard = { type:'lottery_result', title:'宝くじの 抽選日！', icon:'gift', _win:win };
    const at = this.idx + 1 + L.delay;   // 今のカードの delay 枚あと
    const pos = Math.min(at, this.deck.length);
    this.deck.splice(pos, 0, resultCard);
    this.refreshHud();
  },

  /* 宝くじの抽選結果カードを表示 */
  renderLotteryResult(card, body){
    const L = CONFIG.LOTTERY;
    // 複数人モードでは、その人が買ったかどうかで表示を変える
    const multi = this.multi;
    const bought = multi ? !!(this._cur && this._cur.boughtLottery) : true;
    const win = multi ? !!(this._cur && this._cur.lotteryWin) : !!card._win;

    const box = document.createElement('div');
    if(multi && !bought){
      // 買っていない人：抽選なし
      box.className = 'bigbox';
      box.style.marginBottom = '12px';
      box.innerHTML = '<div class="k">抽選日</div><div class="v" style="font-size:16px;">あなたは 宝くじを 買わなかったので、抽選は ありません</div>';
    } else {
      box.className = 'bigbox '+(win?'box-ok':'box-warn');
      box.style.marginBottom = '12px';
      box.innerHTML = win
        ? '<div class="k">大当たり！</div><div class="v">'+L.prize.toLocaleString('ja-JP')+'えん 当たった！</div>'
        : '<div class="k">はずれ…</div><div class="v">買った '+L.cost.toLocaleString('ja-JP')+'えんは もどってきません</div>';
    }
    body.appendChild(box);

    // 確率の説明（全員に見せる）
    const note = document.createElement('div');
    note.className = 'lottery-note';
    note.innerHTML = '<p>'+L.inGameText+'</p>' + '<p>'+L.realText+'</p>';
    body.appendChild(note);

    let fx = null;
    if(bought){
      if(win){ this.gain(L.prize); fx='excited'; }
      else { fx='minus'; }
    }
    this.afterAction(body, '', fx);
  },

  /* マイナスになる買い物の確認ダイアログ */
  confirmMinus(cost, onOk){
    const after = this.balance - cost;
    const mask = document.createElement('div');
    mask.className = 'warnmask';
    mask.innerHTML =
      '<div class="warnbox">'
      + '<div class="wh">お金が たりないよ</div>'
      + '<div class="wb">これを 買うと、のこりが <b>'+yen(after)+'</b> に なります。<br>お金が ないのに 買うと、あとで こまるかも。<br>それでも 買いますか？</div>'
      + '<div class="wrow">'
      + '<button class="btn btn-cancel" id="warnNo">やめておく</button>'
      + '<button class="btn btn-primary" id="warnYes">それでも 買う</button>'
      + '</div></div>';
    document.body.appendChild(mask);
    mask.querySelector('#warnNo').onclick = () => mask.remove();
    mask.querySelector('#warnYes').onclick = () => { mask.remove(); onOk(); };
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
    b.onclick = () => {
      b.remove();
      this.pay(opt.cost);
      this.markFixedPaid(card.expenseKey);
      this.afterAction(body, '毎月の 固定費を 払ったよ', null);
    };
    body.appendChild(b);
  },

  /* 固定費を 支払い済みにする */
  markFixedPaid(key){
    this.paidFixed = this.paidFixed || {};
    this.paidFixed[key] = true;
    if(this.multi){
      // 手番の人のデータに記録し、バーを描き直す
      if(this._cur){ this._cur.paidFixed = this.paidFixed; }
      this.mRenderFixedBar();
      return;
    }
    const cell = document.getElementById('fc-'+key);
    if(cell) cell.classList.add('paid');
  },

  renderFukubiki(card, body){
    const rate = (this.diff.fukubikiWin!==undefined) ? this.diff.fukubikiWin : CONFIG.FUKUBIKI_WIN_RATE;
    const b = document.createElement('button');
    b.className='btn btn-primary';
    b.textContent='🎁 くじを 引く';
    b.onclick = () => {
      b.remove();
      const win = Math.random() < rate;
      const amt = win ? card.win : card.lose;
      if(win && amt) this.gain(amt);
      const box = document.createElement('div');
      box.className = 'bigbox '+(win?'box-ok':'box-warn'); box.style.marginTop='12px';
      box.innerHTML = win
        ? '<div class="k">あたり！</div><div class="v">'+amt.toLocaleString('ja-JP')+'えん もらえたよ</div>'
        : '<div class="k">はずれ…</div><div class="v">0えん</div>';
      body.appendChild(box);
      this.afterAction(body, '', win?'excited':null);
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
      this.afterAction(body, '', null); return;
    }
    if(card.requireExpense){
      const got = this.expenseLabel(card.requireExpense.key) === card.requireExpense.label;
      if(!got){
        const box = document.createElement('div');
        box.className='bigbox box-warn';
        box.innerHTML = '<div class="k">ざんねん</div><div class="v" style="font-size:16px;">'+card.requireExpense.reason+'<br>今回は もらえません</div>';
        body.appendChild(box);
        this.afterAction(body, '', null); return;
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
    b.onclick = () => { b.remove(); this.gain(card.gain); this.afterAction(body, '', 'plus'); };
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
        this.afterAction(body, '', null); return;
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
    b.onclick = () => { b.remove(); this.pay(card.cost); this.afterAction(body, '', this.fxForPay(card.cost)); };
    body.appendChild(b);
  },

  fxForPay(cost){ return cost >= 20000 ? 'bigminus' : (cost>0 ? 'minus' : null); },

  afterAction(body, msg, fx){
    if(msg){
      const m = document.createElement('div');
      m.className='resultmsg'; m.style.color='var(--muted)';
      m.textContent = msg;
      body.appendChild(m);
    }
    const next = document.createElement('button');
    next.className='btn btn-primary'; next.style.marginTop='12px';
    if(this.multi && this._afterHook){
      // 複数人モード：最後の人の最後のカードなら「結果」、それ以外は「つぎへ」
      const lastCard = (this.idx+1 >= this.deck.length);
      const lastPlayer = (this.turn+1 >= this.playerCount);
      next.textContent = (lastCard && lastPlayer) ? 'けっかを みる' : 'つぎへ';
      const hook = this._afterHook;
      next.onclick = () => { this._afterHook = null; hook(); };
    } else {
      next.textContent = (this.idx+1 >= this.deck.length) ? 'けっかを みる' : 'つぎの カードへ';
      next.onclick = () => { this.idx++; this.refreshHud(); this.cardBack(); };
    }
    body.appendChild(next);
    if(fx){
      // 演出を出している間は「つぎへ」を隠し、消えてから出す
      next.style.display = 'none';
      const life = this.playFx(fx);
      setTimeout(()=>{ next.style.display = ''; }, life);
    }
  },

  /* 演出フック（残高の色変化＋揺れ＋キャラのポップアップ）。表示時間(ms)を返す */
  playFx(kind){
    const hud = document.querySelector('.hud');
    if(hud){
      hud.classList.remove('fx-plus','fx-minus','fx-bigminus');
      void hud.offsetWidth; // リセット
      if(kind==='plus') hud.classList.add('fx-plus');
      else if(kind==='minus') hud.classList.add('fx-minus');
      else if(kind==='bigminus') hud.classList.add('fx-bigminus');
    }
    return this.popChar(kind);
  },

  /* どの演出で どのキャラを 出すか */
  CHAR_FOR: {
    plus:     'char-happy.png',     // お金が増えた
    minus:    'char-sad.png',       // 出費（赤カードなど 突然の出費）
    bigminus: 'char-sad.png',       // 大きな出費
    excited:  'char-excited.png',   // 福引き・くじの当たり
    calm:     'char-normal.png',    // 自分で選ぶ買い物・支払い・セーフ
    flat:     'char-normal.png'     // 増減なし
  },

  /* 画面の真ん中に キャラを ふわっと出して 少ししたら消す。表示時間(ms)を返す */
  popChar(kind){
    const file = this.CHAR_FOR[kind];
    if(!file) return 0;
    const old = document.getElementById('charPop');
    if(old) old.remove();
    const pop = document.createElement('div');
    pop.id = 'charPop';
    pop.className = 'charpop ' + (kind==='plus'||kind==='excited' ? 'is-up'
                      : (kind==='minus'||kind==='bigminus') ? 'is-down' : 'is-flat');
    const img = document.createElement('img');
    img.src = file;
    img.alt = '';
    pop.appendChild(img);
    document.body.appendChild(pop);
    // 表示時間（短め）
    const life = 1400;
    setTimeout(()=>{ pop.classList.add('out'); }, life - 300);
    setTimeout(()=>{ if(pop.parentNode) pop.remove(); }, life);
    return life;
  },

  pay(n){ this.balance -= n; this.refreshHud(); },
  gain(n){ this.balance += n; this.refreshHud(); },

  finish(){ this.endScreen(); },

  endScreen(){
    const leftover = document.getElementById('charPop');
    if(leftover) leftover.remove();
    const plus = this.balance >= 0;
    const e = CONFIG.ENDING;
    // 10万円を超えるマイナスは「つかいすぎ」メッセージ
    const threshold = (e.bigMinusThreshold !== undefined) ? e.bigMinusThreshold : 100000;
    const bigMinus = (this.balance < 0) && (Math.abs(this.balance) > threshold);
    const m = plus ? e.plus : (bigMinus && e.bigminus ? e.bigminus : e.minus);
    const balEl = document.getElementById('endBal');
    balEl.textContent = yen(this.balance);
    balEl.classList.toggle('neg', this.balance<0);
    const big = document.getElementById('endBig');
    big.textContent = plus ? 'プラスで おわったね' : (bigMinus ? 'つかいすぎ かも…' : 'マイナスで おわったね');
    big.className = 'big '+(plus?'plus':'minus');
    document.getElementById('endHead').textContent = m.heading;
    document.getElementById('endBody').textContent = m.body;
    document.getElementById('endCommon').textContent = e.common;
    // 結果に合わせて キャラを出す（プラス=達成 / 大マイナス=泣き顔 / マイナス=励まし）
    const endChar = document.getElementById('endChar');
    if(endChar){
      endChar.src = plus ? 'char-clear.png' : (bigMinus ? 'char-sad.png' : 'char-encourage.png');
      endChar.alt = '';
    }
    this.renderStars();
    this.renderReflection();
    this.show('end');
  },

  /* 貯金チャレンジの達成を 星で表す */
  renderStars(){
    const host = document.getElementById('endStars');
    if(!host) return;
    const course = this.savingCourse;
    const goal = course ? course.goal : 0;
    let stars, label;
    if(this.balance >= 0 && (course ? this.balance >= goal : true)){
      stars = 3; label = course ? '目標 たっせい！すばらしい！' : 'よく のこせたね！';
    } else if(this.balance >= 0){
      stars = 2; label = '赤字には ならなかったね。目標まで あと すこし！';
    } else {
      stars = 1; label = 'つぎは 赤字に ならないように チャレンジ！';
    }
    let s = '';
    for(let i=0;i<3;i++){ s += '<span class="star '+(i<stars?'on':'')+'">★</span>'; }
    let goalLine = '';
    if(course){
      goalLine = '<div class="goal-line">こんげつの 目標：'+course.label+'（'+course.sub+'）</div>';
    }
    host.innerHTML = goalLine + '<div class="stars">'+s+'</div><div class="star-label">'+label+'</div>';
  },

  /* プレイ内容に応じた ふりかえりの一言 */
  /* ふりかえりコメントを作る（一人用・複数人 共通）。
     data = { selections, flags, balance } */
  buildReflection(data){
    const sel = data.selections || {};
    const flags = data.flags || {};
    const labelOf = (key) => {
      const exp = CONFIG.EXPENSES.find(e=>e.key===key);
      const i = sel[key];
      return (exp && i!==undefined) ? exp.options[i].label : null;
    };
    const msgs = [];
    if(labelOf('food')==='C') msgs.push('じすいを えらんで、食費を かしこく おさえたね。');
    if(labelOf('util')==='C') msgs.push('電気・ガス・水道を 節約できたね。');
    if(labelOf('phone')==='C') msgs.push('スマホを 格安プランにして かしこい！');
    if(labelOf('food')==='A' && labelOf('home')==='A') msgs.push('べんりな くらしを えらんだね。そのぶん お金は たくさん つかうよ。');
    if(flags.shikaku) msgs.push('資格の 勉強を がんばったね。学びは 将来の ちからに なるよ。');
    if(data.balance < 0){
      msgs.push('お金が たりなくなる 場面も あったね。つぎは 先を 考えて つかってみよう。');
    } else if(data.balance >= 20000){
      msgs.push('しっかり お金を のこせたね。がまんする ちからが あるね。');
    } else if(data.balance >= 0){
      msgs.push('赤字に ならずに やりくりできたね。');
    }
    if(msgs.length===0){
      msgs.push('いろんな えらびかたを ためせたね。つぎは どうするか 考えてみよう。');
    }
    return msgs.slice(0,3);
  },

  renderReflection(){
    const host = document.getElementById('endReflect');
    if(!host) return;
    const pick = this.buildReflection({ selections:this.selections, flags:this.flags, balance:this.balance });
    host.innerHTML = '<div class="reflect-title">ふりかえり</div>'
      + pick.map(t=>'<div class="reflect-line">・'+t+'</div>').join('');
  },

  restart(){ this.selections={}; this.flags={}; this.balance=0; this.idx=0; this.savingCourse=null; this.rankCard=null; this.multi=false; this.players=[]; this.turn=0; this.setupIdx=0; this._afterHook=null; this._cur=null; this.show('menu'); }
};

function yen(n){ return n.toLocaleString('ja-JP') + 'えん'; }
function rubyWrap(base, reading){ return '<ruby>'+base+'<rt>'+reading+'</rt></ruby>'; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

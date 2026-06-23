/* ============================================================
   マネープランゲーム  設定ファイル（config.js）
   ------------------------------------------------------------
   このファイルの数字や文章を書きかえると、
   ゲームのバランスや内容を調整できます。
   プログラム（game.js）はさわらなくて大丈夫です。

   ★よくある調整★
   - 金額をかえる        … cost / gain / win の数字をなおす
   - 文章をかえる        … text / subtitle の文字をなおす
   - 福引きの当たりやすさ … FUKUBIKI_WIN_RATE の数字（0〜1）
   - お給料をかえる      … SALARY の数字
   - 支払日を予算と連動   … type:"pay" の expenseKey で予算とむすびつく
   ============================================================ */

const CONFIG = {

  /* お給料（1か月にもらえるお金） */
  SALARY: 150000,

  /* 福引きの当たる確率（0〜1）。0.4なら40%で当たり */
  FUKUBIKI_WIN_RATE: 0.4,

  /* 支払日カードを、ゲーム中にバランスよくばらけさせるか */
  SPREAD_PAYDAY: true,

  /* --------------------------------------------------------
     ワークシート1：予算プラン
     5つのこうもくを A/B/C からえらぶ
     -------------------------------------------------------- */
  EXPENSES: [
    {
      key: "food", name: "食事", ruby: "しょくじ",
      options: [
        { label: "A", text: "すべて外食",  textRuby: "すべて<ruby>外食<rt>がいしょく</rt></ruby>", cost: 50000 },
        { label: "B", text: "たまに外食",  textRuby: "たまに<ruby>外食<rt>がいしょく</rt></ruby>", cost: 30000 },
        { label: "C", text: "すべて自炊",  textRuby: "すべて<ruby>自炊<rt>じすい</rt></ruby>", cost: 20000 }
      ]
    },
    {
      key: "home", name: "家", ruby: "いえ",
      options: [
        { label: "A", text: "新築・便利",      textRuby: "<ruby>新築<rt>しんちく</rt></ruby>・<ruby>便利<rt>べんり</rt></ruby>", cost: 60000 },
        { label: "B", text: "築10年・自転車",  textRuby: "<ruby>築<rt>ちく</rt></ruby>10<ruby>年<rt>ねん</rt></ruby>・<ruby>自転車<rt>じてんしゃ</rt></ruby>", cost: 40000 },
        { label: "C", text: "古い・店が遠い",  textRuby: "<ruby>古<rt>ふる</rt></ruby>い・<ruby>店<rt>みせ</rt></ruby>が<ruby>遠<rt>とお</rt></ruby>い", cost: 30000 }
      ]
    },
    {
      key: "util", name: "電気ガス水道", ruby: "でんき・ガス・すいどう",
      options: [
        { label: "A", text: "気にせず使う",  textRuby: "<ruby>気<rt>き</rt></ruby>にせず<ruby>使<rt>つか</rt></ruby>う", cost: 15000 },
        { label: "B", text: "ふつうに使う",  textRuby: "ふつうに<ruby>使<rt>つか</rt></ruby>う", cost: 11000 },
        { label: "C", text: "節約する",      textRuby: "<ruby>節約<rt>せつやく</rt></ruby>する", cost: 7000 }
      ]
    },
    {
      key: "phone", name: "スマホ", ruby: "",
      options: [
        { label: "A", text: "無制限",      textRuby: "<ruby>無制限<rt>むせいげん</rt></ruby>", cost: 10000 },
        { label: "B", text: "20ギガ",      textRuby: "20ギガ", cost: 3000 },
        { label: "C", text: "格安3ギガ",   textRuby: "<ruby>格安<rt>かくやす</rt></ruby>3ギガ", cost: 1000 }
      ]
    },
    {
      key: "move", name: "移動", ruby: "いどう",
      options: [
        { label: "A", text: "自分の車",     textRuby: "<ruby>自分<rt>じぶん</rt></ruby>の<ruby>車<rt>くるま</rt></ruby>", cost: 10000 },
        { label: "B", text: "公共交通",     textRuby: "<ruby>公共<rt>こうきょう</rt></ruby><ruby>交通<rt>こうつう</rt></ruby>", cost: 5000 },
        { label: "C", text: "徒歩・自転車", textRuby: "<ruby>徒歩<rt>とほ</rt></ruby>・<ruby>自転車<rt>じてんしゃ</rt></ruby>", cost: 1000 }
      ]
    }
  ],

  /* --------------------------------------------------------
     カード（ぜんぶで19まい）
     type: "green"  … えらんで払う
     type: "pay"    … 支払日カード（予算と連動）expenseKey でむすぶ
     type: "yellow" … もらえる
     type: "fukubiki" … 福引き（くじ）
     type: "red"    … 払う
     -------------------------------------------------------- */
  CARDS: [
    /* ---- 緑：えらんで払う（10まい） ---- */
    { type:"green", title:"靴", titleRuby:"<ruby>靴<rt>くつ</rt></ruby>", subtitle:"仕事用に靴を買おう！", subtitleRuby:"<ruby>仕事用<rt>しごとよう</rt></ruby>に<ruby>靴<rt>くつ</rt></ruby>を<ruby>買<rt>か</rt></ruby>おう！", icon:"shoe",
      options:[
        { label:"A", text:"好きなブランドの靴",   textRuby:"<ruby>好<rt>す</rt></ruby>きなブランドの<ruby>靴<rt>くつ</rt></ruby>", cost:6000 },
        { label:"B", text:"手頃な値段の靴",       textRuby:"<ruby>手頃<rt>てごろ</rt></ruby>な<ruby>値段<rt>ねだん</rt></ruby>の<ruby>靴<rt>くつ</rt></ruby>", cost:3000 },
        { label:"C", text:"とにかく安い靴",       textRuby:"とにかく<ruby>安<rt>やす</rt></ruby>い<ruby>靴<rt>くつ</rt></ruby>", cost:1000 }
      ] },
    { type:"green", title:"ランチ", titleRuby:"ランチ", subtitle:"友達から高級ホテルのランチに誘われた", subtitleRuby:"<ruby>友達<rt>ともだち</rt></ruby>から<ruby>高級<rt>こうきゅう</rt></ruby>ホテルのランチに<ruby>誘<rt>さそ</rt></ruby>われた", icon:"food",
      options:[
        { label:"A", text:"行く！",                       textRuby:"<ruby>行<rt>い</rt></ruby>く！", cost:3000 },
        { label:"B", text:"近くのカフェでランチ",         textRuby:"<ruby>近<rt>ちか</rt></ruby>くのカフェでランチ", cost:1000 },
        { label:"C", text:"行かない",                     textRuby:"<ruby>行<rt>い</rt></ruby>かない", cost:0 }
      ] },
    { type:"green", title:"お祭り", titleRuby:"お<ruby>祭<rt>まつ</rt></ruby>り", subtitle:"友達とお祭りにきました", subtitleRuby:"<ruby>友達<rt>ともだち</rt></ruby>とお<ruby>祭<rt>まつ</rt></ruby>りにきました", icon:"festival",
      options:[
        { label:"A", text:"屋台で好きなだけ買い物",       textRuby:"<ruby>屋台<rt>やたい</rt></ruby>で<ruby>好<rt>す</rt></ruby>きなだけ<ruby>買<rt>か</rt></ruby>い<ruby>物<rt>もの</rt></ruby>", cost:3000 },
        { label:"B", text:"時々ガマンする",               textRuby:"<ruby>時々<rt>ときどき</rt></ruby>ガマンする", cost:1000 },
        { label:"C", text:"花火だけ楽しむ",               textRuby:"<ruby>花火<rt>はなび</rt></ruby>だけ<ruby>楽<rt>たの</rt></ruby>しむ", cost:0 }
      ] },
    { type:"green", title:"プレゼント", titleRuby:"プレゼント", subtitle:"お世話になった方へ…", subtitleRuby:"お<ruby>世話<rt>せわ</rt></ruby>になった<ruby>方<rt>かた</rt></ruby>へ…", icon:"gift",
      options:[
        { label:"A", text:"プレゼントを贈る（高い）",     textRuby:"プレゼントを<ruby>贈<rt>おく</rt></ruby>る（<ruby>高<rt>たか</rt></ruby>い）", cost:10000 },
        { label:"B", text:"プレゼントを贈る（安い）",     textRuby:"プレゼントを<ruby>贈<rt>おく</rt></ruby>る（<ruby>安<rt>やす</rt></ruby>い）", cost:5000 },
        { label:"C", text:"SNSでメッセージを送る",        textRuby:"SNSでメッセージを<ruby>送<rt>おく</rt></ruby>る", cost:0 }
      ] },
    { type:"green", title:"電球", titleRuby:"<ruby>電球<rt>でんきゅう</rt></ruby>", subtitle:"お風呂場の電球がきれた", subtitleRuby:"お<ruby>風呂場<rt>ふろば</rt></ruby>の<ruby>電球<rt>でんきゅう</rt></ruby>がきれた", icon:"bulb",
      options:[
        { label:"A", text:"業者に交換をお願いする",       textRuby:"<ruby>業者<rt>ぎょうしゃ</rt></ruby>に<ruby>交換<rt>こうかん</rt></ruby>をお<ruby>願<rt>ねが</rt></ruby>いする", cost:4000 },
        { label:"B", text:"自分で交換する",               textRuby:"<ruby>自分<rt>じぶん</rt></ruby>で<ruby>交換<rt>こうかん</rt></ruby>する", cost:1000 },
        { label:"C", text:"そのままにする",               textRuby:"そのままにする", cost:0 }
      ] },
    { type:"green", title:"東京○○ランド", titleRuby:"<ruby>東京<rt>とうきょう</rt></ruby>○○ランド", subtitle:"友達に旅行に誘われた♪", subtitleRuby:"<ruby>友達<rt>ともだち</rt></ruby>に<ruby>旅行<rt>りょこう</rt></ruby>に<ruby>誘<rt>さそ</rt></ruby>われた♪", icon:"park",
      options:[
        { label:"A", text:"行く！",                       textRuby:"<ruby>行<rt>い</rt></ruby>く！", cost:30000 },
        { label:"B", text:"香川県内の遊園地を提案",       textRuby:"<ruby>香川県内<rt>かがわけんない</rt></ruby>の<ruby>遊園地<rt>ゆうえんち</rt></ruby>を<ruby>提案<rt>ていあん</rt></ruby>", cost:5000 },
        { label:"C", text:"行かない",                     textRuby:"<ruby>行<rt>い</rt></ruby>かない", cost:0 }
      ] },
    { type:"green", title:"誕生日", titleRuby:"<ruby>誕生日<rt>たんじょうび</rt></ruby>", subtitle:"もうすぐ家族のおたん生日です！", subtitleRuby:"もうすぐ<ruby>家族<rt>かぞく</rt></ruby>のおたん<ruby>生日<rt>じょうび</rt></ruby>です！", icon:"cake",
      options:[
        { label:"A", text:"お店のケーキを買って贈る",     textRuby:"お<ruby>店<rt>みせ</rt></ruby>のケーキを<ruby>買<rt>か</rt></ruby>って<ruby>贈<rt>おく</rt></ruby>る", cost:5000 },
        { label:"B", text:"手作りのケーキを贈る",         textRuby:"<ruby>手作<rt>てづく</rt></ruby>りのケーキを<ruby>贈<rt>おく</rt></ruby>る", cost:2000 },
        { label:"C", text:"SNSでおめでとうを伝える",       textRuby:"SNSでおめでとうを<ruby>伝<rt>つた</rt></ruby>える", cost:0 }
      ] },
    { type:"green", title:"マンガ", titleRuby:"マンガ", subtitle:"話題のマンガの新刊が発売された！", subtitleRuby:"<ruby>話題<rt>わだい</rt></ruby>のマンガの<ruby>新刊<rt>しんかん</rt></ruby>が<ruby>発売<rt>はつばい</rt></ruby>された！", icon:"book",
      options:[
        { label:"A", text:"新刊を買う",                   textRuby:"<ruby>新刊<rt>しんかん</rt></ruby>を<ruby>買<rt>か</rt></ruby>う", cost:2000 },
        { label:"B", text:"レンタルで読む",               textRuby:"レンタルで<ruby>読<rt>よ</rt></ruby>む", cost:1000 },
        { label:"C", text:"友達に借りて読む",             textRuby:"<ruby>友達<rt>ともだち</rt></ruby>に<ruby>借<rt>か</rt></ruby>りて<ruby>読<rt>よ</rt></ruby>む", cost:0 }
      ] },
    { type:"green", title:"募金", titleRuby:"<ruby>募金<rt>ぼきん</rt></ruby>", subtitle:"大きな災害が発生！募金活動が行われています", subtitleRuby:"<ruby>大<rt>おお</rt></ruby>きな<ruby>災害<rt>さいがい</rt></ruby>が<ruby>発生<rt>はっせい</rt></ruby>！<ruby>募金活動<rt>ぼきんかつどう</rt></ruby>が<ruby>行<rt>おこな</rt></ruby>われています", icon:"heart",
      options:[
        { label:"A", text:"募金する",                     textRuby:"<ruby>募金<rt>ぼきん</rt></ruby>する", cost:5000 },
        { label:"B", text:"ボランティアに行く（交通費）", textRuby:"ボランティアに<ruby>行<rt>い</rt></ruby>く（<ruby>交通費<rt>こうつうひ</rt></ruby>）", cost:3000 },
        { label:"C", text:"何もしない",                   textRuby:"<ruby>何<rt>なに</rt></ruby>もしない", cost:0 }
      ] },
    { type:"green", title:"スマホ", titleRuby:"スマホ", subtitle:"スマホの新機種が発売された！", subtitleRuby:"スマホの<ruby>新機種<rt>しんきしゅ</rt></ruby>が<ruby>発売<rt>はつばい</rt></ruby>された！", icon:"phone",
      options:[
        { label:"A", text:"新機種を買う",                 textRuby:"<ruby>新機種<rt>しんきしゅ</rt></ruby>を<ruby>買<rt>か</rt></ruby>う", cost:50000 },
        { label:"B", text:"一つ前の機種を買う",           textRuby:"<ruby>一<rt>ひと</rt></ruby>つ<ruby>前<rt>まえ</rt></ruby>の<ruby>機種<rt>きしゅ</rt></ruby>を<ruby>買<rt>か</rt></ruby>う", cost:30000 },
        { label:"C", text:"買わない",                     textRuby:"<ruby>買<rt>か</rt></ruby>わない", cost:0 }
      ] },

    /* ---- 支払日：予算と連動（5まい） ---- */
    { type:"pay", title:"食費の支払日",     titleRuby:"<ruby>食費<rt>しょくひ</rt></ruby>の<ruby>支払日<rt>しはらいび</rt></ruby>",       expenseKey:"food",  icon:"food" },
    { type:"pay", title:"家賃の支払日",     titleRuby:"<ruby>家賃<rt>やちん</rt></ruby>の<ruby>支払日<rt>しはらいび</rt></ruby>",       expenseKey:"home",  icon:"home" },
    { type:"pay", title:"水道光熱費の支払日", titleRuby:"<ruby>水道光熱費<rt>すいどうこうねつひ</rt></ruby>の<ruby>支払日<rt>しはらいび</rt></ruby>", expenseKey:"util",  icon:"bulb" },
    { type:"pay", title:"通信費の支払日",   titleRuby:"<ruby>通信費<rt>つうしんひ</rt></ruby>の<ruby>支払日<rt>しはらいび</rt></ruby>",     expenseKey:"phone", icon:"phone" },
    { type:"pay", title:"交通費の支払日",   titleRuby:"<ruby>交通費<rt>こうつうひ</rt></ruby>の<ruby>支払日<rt>しはらいび</rt></ruby>",     expenseKey:"move",  icon:"bus" },

    /* ---- 黄：もらえる（3まい） ---- */
    { type:"fukubiki", title:"福引き", titleRuby:"<ruby>福引<rt>ふくび</rt></ruby>き", subtitle:"スーパーで福引きに挑戦！", subtitleRuby:"スーパーで<ruby>福引<rt>ふくび</rt></ruby>きに<ruby>挑戦<rt>ちょうせん</rt></ruby>！", icon:"gift", win:5000, lose:0 },
    { type:"yellow", title:"ランクアップ", titleRuby:"ランクアップ", subtitle:"資格を持っている人はお仕事でランクアップ！", subtitleRuby:"<ruby>資格<rt>しかく</rt></ruby>を<ruby>持<rt>も</rt></ruby>っている<ruby>人<rt>ひと</rt></ruby>はお<ruby>仕事<rt>しごと</rt></ruby>でランクアップ！", icon:"up", gain:10000, gainLabel:"ボーナス" },
    { type:"yellow", title:"就職祝い", titleRuby:"<ruby>就職祝<rt>しゅうしょくいわ</rt></ruby>い", subtitle:"おじいちゃん・おばあちゃんから就職祝いをいただいた！", subtitleRuby:"おじいちゃん・おばあちゃんから<ruby>就職祝<rt>しゅうしょくいわ</rt></ruby>いをいただいた！", icon:"gift", gain:20000, gainLabel:"お祝い" },

    /* ---- 赤：払う（1まい） ---- */
    { type:"red", title:"水もれ", titleRuby:"<ruby>水<rt>みず</rt></ruby>もれ", subtitle:"自宅で水もれ発生！", subtitleRuby:"<ruby>自宅<rt>じたく</rt></ruby>で<ruby>水<rt>みず</rt></ruby>もれ<ruby>発生<rt>はっせい</rt></ruby>！", icon:"water", cost:10000, costLabel:"修理代" }
  ],

  /* --------------------------------------------------------
     結論メッセージ（結果でかわる）
     -------------------------------------------------------- */
  ENDING: {
    plus: {
      heading: "じょうずに やりくりできたね！",
      body: "でも、まいつき いつも プラスにできるとは かぎりません。これから 入ってくるお金と 出ていくお金を 予想しながら 使うしゅうかんが、しょうらいの あなたを たすけてくれます。"
    },
    minus: {
      heading: "マイナスでも、しっぱいじゃないよ",
      body: "今回は たまたま 出ていくお金が 多かっただけ。大切なのは「つぎは どうしようかな」と 考えられること。ふだんから 先のお金を 予想しながら くらせば、ちゃんと 立てなおせます。"
    },
    common: "お金は、これからのことを 考えながら 使うと、こわくない。"
  }

};

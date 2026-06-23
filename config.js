/* ============================================================
   マネープランゲーム  設定ファイル（config.js）  v2
   ------------------------------------------------------------
   このファイルの数字や文章を書きかえると、
   ゲームのバランスや内容を調整できます。
   プログラム（game.js）はさわらなくて大丈夫です。

   ★よくある調整★
   - お給料          … SALARY
   - 1回で使う枚数   … DRAW_COUNT（支払日カードはこれとは別に必ず入る）
   - 福引きの当たり率 … FUKUBIKI_WIN_RATE（0〜1）
   - 金額をかえる     … 各カードの cost / gain / win
   - 文章をかえる     … title / subtitle / text
   - むずかしさ       … DIFFICULTY と DIFFICULTY_SETS

   ★カードの連動★
   - requireFlag:"shikaku"      … 資格を持っている人だけ有効
   - requireExpense:{key,label} … ワークシート1で特定プランを選んだ人だけ
   - setsFlag:"shikaku"/"hoken" … このカードで資格・保険を得る
   - onlyIfFlag:"hoken"         … その選択肢は条件を満たす人だけ
   ============================================================ */

const CONFIG = {

  SALARY: 230000,
  DRAW_COUNT: 15,
  FUKUBIKI_WIN_RATE: 0.45,
  SPREAD_PAYDAY: true,
  DIFFICULTY: "normal",

  DIFFICULTY_SETS: {
    easy:   { drawCount: 12, luckyBoost: 2,  fukubikiWin: 0.6,  hiCap: 1 },
    normal: { drawCount: 15, luckyBoost: 1,  fukubikiWin: 0.45, hiCap: 2 },
    hard:   { drawCount: 18, luckyBoost: -1, fukubikiWin: 0.3,  hiCap: 3 }
  },

  EXPENSES: [
    { key:"food", name:"食事", ruby:"しょくじ",
      options:[
        { label:"A", text:"すべて外食", textRuby:"すべて<ruby>外食<rt>がいしょく</rt></ruby>", cost:50000 },
        { label:"B", text:"たまに外食", textRuby:"たまに<ruby>外食<rt>がいしょく</rt></ruby>", cost:30000 },
        { label:"C", text:"すべて自炊", textRuby:"すべて<ruby>自炊<rt>じすい</rt></ruby>", cost:20000 }
      ] },
    { key:"home", name:"家", ruby:"いえ",
      options:[
        { label:"A", text:"新築・便利", textRuby:"<ruby>新築<rt>しんちく</rt></ruby>・<ruby>便利<rt>べんり</rt></ruby>", cost:60000 },
        { label:"B", text:"築10年・自転車", textRuby:"<ruby>築<rt>ちく</rt></ruby>10<ruby>年<rt>ねん</rt></ruby>・<ruby>自転車<rt>じてんしゃ</rt></ruby>", cost:40000 },
        { label:"C", text:"古い・店が遠い", textRuby:"<ruby>古<rt>ふる</rt></ruby>い・<ruby>店<rt>みせ</rt></ruby>が<ruby>遠<rt>とお</rt></ruby>い", cost:30000 }
      ] },
    { key:"util", name:"電気ガス水道", ruby:"でんき・ガス・すいどう",
      options:[
        { label:"A", text:"気にせず使う", textRuby:"<ruby>気<rt>き</rt></ruby>にせず<ruby>使<rt>つか</rt></ruby>う", cost:15000 },
        { label:"B", text:"ふつうに使う", textRuby:"ふつうに<ruby>使<rt>つか</rt></ruby>う", cost:11000 },
        { label:"C", text:"節約する", textRuby:"<ruby>節約<rt>せつやく</rt></ruby>する", cost:7000 }
      ] },
    { key:"phone", name:"スマホ", ruby:"",
      options:[
        { label:"A", text:"無制限", textRuby:"<ruby>無制限<rt>むせいげん</rt></ruby>", cost:10000 },
        { label:"B", text:"20ギガ", textRuby:"20ギガ", cost:3000 },
        { label:"C", text:"格安3ギガ", textRuby:"<ruby>格安<rt>かくやす</rt></ruby>3ギガ", cost:1000 }
      ] },
    { key:"move", name:"移動", ruby:"いどう",
      options:[
        { label:"A", text:"自分の車", textRuby:"<ruby>自分<rt>じぶん</rt></ruby>の<ruby>車<rt>くるま</rt></ruby>", cost:10000 },
        { label:"B", text:"公共交通", textRuby:"<ruby>公共<rt>こうきょう</rt></ruby><ruby>交通<rt>こうつう</rt></ruby>", cost:5000 },
        { label:"C", text:"徒歩・自転車", textRuby:"<ruby>徒歩<rt>とほ</rt></ruby>・<ruby>自転車<rt>じてんしゃ</rt></ruby>", cost:1000 }
      ] }
  ],

  PAYDAY_CARDS: [
    { type:"pay", title:"食費の支払日",     expenseKey:"food",  icon:"food" },
    { type:"pay", title:"家賃の支払日",     expenseKey:"home",  icon:"home" },
    { type:"pay", title:"水道光熱費の支払日", expenseKey:"util",  icon:"bulb" },
    { type:"pay", title:"通信費の支払日",   expenseKey:"phone", icon:"phone" },
    { type:"pay", title:"交通費の支払日",   expenseKey:"move",  icon:"bus" }
  ],

  CARDS: [
    { type:"green", title:"靴", subtitle:"仕事用に靴を買おう！", icon:"shoe",
      options:[ {label:"A",text:"好きなブランドの靴",cost:6000},{label:"B",text:"手頃な値段の靴",cost:3000},{label:"C",text:"とにかく安い靴",cost:1000} ] },
    { type:"green", title:"ランチ", subtitle:"高級ホテルのランチに誘われた", icon:"food",
      options:[ {label:"A",text:"行く！",cost:3000},{label:"B",text:"近くのカフェでランチ",cost:1000},{label:"C",text:"行かない",cost:0} ] },
    { type:"green", title:"お祭り", subtitle:"友達とお祭りにきました", icon:"festival",
      options:[ {label:"A",text:"好きなだけ買い物",cost:3000},{label:"B",text:"時々ガマンする",cost:1000},{label:"C",text:"花火だけ楽しむ",cost:0} ] },
    { type:"green", title:"プレゼント", subtitle:"お世話になった方へ…", icon:"gift",
      options:[ {label:"A",text:"プレゼントを贈る（高い）",cost:10000},{label:"B",text:"プレゼントを贈る（安い）",cost:5000},{label:"C",text:"SNSでメッセージ",cost:0} ] },
    { type:"green", title:"電球", subtitle:"お風呂場の電球がきれた", icon:"bulb",
      options:[ {label:"A",text:"業者にお願いする",cost:4000},{label:"B",text:"自分で交換する",cost:1000},{label:"C",text:"そのままにする",cost:0} ] },
    { type:"green", title:"東京○○ランド", subtitle:"旅行に誘われた♪", icon:"park",
      options:[ {label:"A",text:"行く！",cost:30000},{label:"B",text:"香川県内の遊園地を提案",cost:5000},{label:"C",text:"行かない",cost:0} ] },
    { type:"green", title:"誕生日", subtitle:"家族のおたん生日です！", icon:"cake",
      options:[ {label:"A",text:"お店のケーキを贈る",cost:5000},{label:"B",text:"手作りのケーキを贈る",cost:2000},{label:"C",text:"SNSで伝える",cost:0} ] },
    { type:"green", title:"マンガ", subtitle:"話題のマンガの新刊が発売！", icon:"book",
      options:[ {label:"A",text:"新刊を買う",cost:2000},{label:"B",text:"レンタルで読む",cost:1000},{label:"C",text:"友達に借りて読む",cost:0} ] },
    { type:"green", title:"募金", subtitle:"大きな災害が発生！募金活動中", icon:"heart",
      options:[ {label:"A",text:"募金する",cost:5000},{label:"B",text:"ボランティアに行く（交通費）",cost:3000},{label:"C",text:"何もしない",cost:0} ] },
    { type:"green", title:"スマホ", subtitle:"スマホの新機種が発売！", icon:"phone",
      options:[ {label:"A",text:"新機種を買う",cost:50000},{label:"B",text:"一つ前の機種を買う",cost:30000},{label:"C",text:"買わない",cost:0} ] },
    { type:"green", title:"お花見", subtitle:"会社の人にお花見に誘われた♪", icon:"festival",
      options:[ {label:"A",text:"みんなでご飯を食べる",cost:5000},{label:"B",text:"お花を見るだけ（交通費）",cost:1000},{label:"C",text:"参加しない",cost:0} ] },
    { type:"green", title:"ピザ", subtitle:"季節限定のピザが発売された", icon:"food",
      options:[ {label:"A",text:"宅配してもらう",cost:3000},{label:"B",text:"お店へ取りにいく",cost:2000},{label:"C",text:"自分で作る",cost:1000} ] },
    { type:"green", title:"宝くじ", subtitle:"宝くじが発売された！", icon:"gift",
      options:[ {label:"A",text:"買う（当たれば5,000円）",cost:3000,lottery:true},{label:"B",text:"買わない",cost:0} ] },
    { type:"green", title:"新聞", subtitle:"新聞を買いませんか？と誘われた", icon:"book",
      options:[ {label:"A",text:"買う（1か月分）",cost:3000},{label:"B",text:"買わない",cost:0} ] },
    { type:"green", title:"ライブ", subtitle:"好きなアーティストのライブ！", icon:"festival",
      options:[ {label:"A",text:"行く！",cost:5000},{label:"B",text:"後からDVDで見る",cost:3000},{label:"C",text:"行かない",cost:0} ] },
    { type:"green", title:"熱帯魚", subtitle:"一人暮らしが少し寂しい…", icon:"heart",
      options:[ {label:"A",text:"飼う",cost:10000},{label:"B",text:"写真集で癒やされる",cost:3000},{label:"C",text:"飼わない",cost:0} ] },
    { type:"green", title:"飲み会", subtitle:"職場の人に飲み会に誘われた", icon:"food",
      options:[ {label:"A",text:"参加する",cost:3000},{label:"B",text:"参加しない",cost:0} ] },
    { type:"green", title:"ドライヤー", subtitle:"ドライヤーが壊れた！", icon:"bulb",
      options:[ {label:"A",text:"いい物に買い替える",cost:6000},{label:"B",text:"安く買い替える",cost:3000},{label:"C",text:"修理する",cost:1000} ] },
    { type:"green", title:"ゲーム課金", subtitle:"新しいアイテムが追加された！", icon:"phone",
      options:[ {label:"A",text:"課金して手に入れる",cost:2000},{label:"B",text:"課金しないで遊ぶ",cost:0} ] },
    { type:"green", title:"散髪", subtitle:"そろそろ髪を切りたいなぁ…", icon:"shoe",
      options:[ {label:"A",text:"流行の髪型に（シャンプー付）",cost:5000},{label:"B",text:"カットだけ",cost:1000},{label:"C",text:"自分でカット",cost:0} ] },
    { type:"green", title:"結婚祝い", subtitle:"親友が結こん♡", icon:"gift",
      options:[ {label:"A",text:"結こん式に出席する",cost:30000},{label:"B",text:"結こん祝いを贈る",cost:10000},{label:"C",text:"SNSで伝える",cost:0} ] },
    { type:"green", title:"シャンプー", subtitle:"シャンプーが無くなった", icon:"bulb",
      options:[ {label:"A",text:"美容院でやさしいもの",cost:5000},{label:"B",text:"お買い得（3個）",cost:2000},{label:"C",text:"ふつうに買う（1個）",cost:1000} ] },
    { type:"green", title:"風邪", subtitle:"咳がでる。風邪をひいたかな？", icon:"heart",
      options:[ {label:"A",text:"病院で薬をもらう",cost:3000},{label:"B",text:"薬局で風邪薬を買う",cost:1000},{label:"C",text:"家で休む",cost:0} ] },
    { type:"green", title:"コンビニ", subtitle:"仕事帰りにコンビニへ寄った", icon:"food",
      options:[ {label:"A",text:"お弁当とスープを買う",cost:2000},{label:"B",text:"新発売のスイーツを買う",cost:1000},{label:"C",text:"何も買わない",cost:0} ] },
    { type:"green", title:"テレビ", subtitle:"テレビが故障した！", icon:"phone",
      options:[ {label:"A",text:"新品に買い替える",cost:30000},{label:"B",text:"中古品を買う",cost:10000},{label:"C",text:"買い替えない",cost:0} ] },
    { type:"green", title:"予防接種", subtitle:"インフルエンザの予防接種", icon:"heart",
      options:[ {label:"A",text:"受ける",cost:3000},{label:"B",text:"受けない",cost:0} ] },
    { type:"green", title:"同窓会", subtitle:"数年ぶりの同窓会", icon:"festival",
      options:[ {label:"A",text:"行く！",cost:5000},{label:"B",text:"オンラインで出席",cost:1000},{label:"C",text:"行かない",cost:0} ] },
    { type:"green", title:"エアコン", subtitle:"エアコンが故障した！", icon:"bulb",
      options:[ {label:"A",text:"新品に交換",cost:30000},{label:"B",text:"修理する",cost:5000},{label:"C",text:"実家の扇風機をもらう",cost:0} ] },
    { type:"green", title:"ケーキ", subtitle:"仕事をめちゃくちゃ頑張った！", icon:"cake",
      options:[ {label:"A",text:"ちょっと高級なケーキ",cost:2000},{label:"B",text:"いつものケーキ",cost:1000},{label:"C",text:"今日はがまん",cost:0} ] },
    { type:"green", title:"Tシャツ", subtitle:"お揃いでTシャツを買おうと誘われた", icon:"shoe",
      options:[ {label:"A",text:"おすすめのものを買う",cost:5000},{label:"B",text:"もう少し安いものを提案",cost:3000},{label:"C",text:"買わない",cost:0} ] },

    { type:"green", title:"資格", subtitle:"勉強すれば将来役に立つかも？", icon:"up",
      options:[ {label:"A",text:"勉強する（資格がとれる）",cost:5000,setsFlag:"shikaku"},{label:"B",text:"今は勉強しない",cost:0} ] },
    { type:"green", title:"医りょう保険", subtitle:"けがや病気が心配…", icon:"heart",
      options:[ {label:"A",text:"保険に入って備える（1か月分）",cost:5000,setsFlag:"hoken"},{label:"B",text:"入らない",cost:0} ] },
    { type:"green", title:"パソコン", subtitle:"新しいパソコンが発売された", icon:"phone",
      options:[ {label:"A",text:"一括で買う",cost:50000},{label:"B",text:"ローンで買う（今回12,000円・総額60,000円）",cost:12000,note:"ローンは総額が高くなるよ"},{label:"C",text:"買わない",cost:0} ] },
    { type:"green", title:"車（高額）", subtitle:"前から欲しかった車（150万円）！", icon:"bus",
      options:[ {label:"A",text:"銀行ローンで買う（今回30,000円・約4年）",cost:30000,note:"長いあいだ払い続けるよ"},{label:"B",text:"買わない",cost:0} ] },
    { type:"green", title:"入院", subtitle:"転んで大けが！入院が必要に", icon:"heart",
      options:[ {label:"A",text:"入院費を払う",cost:30000},{label:"B",text:"保険金で支払う（保険に入っている人）",cost:0,onlyIfFlag:"hoken"} ] },

    { type:"yellow", title:"就職祝い", subtitle:"祖父母から就職祝いをいただいた！", icon:"gift", gain:20000, gainLabel:"お祝い" },
    { type:"yellow", title:"落とし物のお礼", subtitle:"落とし物を届けたらお礼が", icon:"gift", gain:10000, gainLabel:"お礼" },
    { type:"yellow", title:"不用品を売る", subtitle:"家の掃除で使わないものを売った", icon:"up", gain:5000, gainLabel:"売れた" },
    { type:"yellow", title:"お米", subtitle:"スーパーでお米が安売り！", icon:"food", gain:3000, gainLabel:"浮いた", requireExpense:{key:"food", label:"C", reason:"自炊を選んだ人は食費が浮いた"} },
    { type:"yellow", title:"ランクアップ", subtitle:"資格を持っている人はランクアップ！", icon:"up", gain:10000, gainLabel:"ボーナス", requireFlag:"shikaku", noFlagText:"資格がないので 今回は ボーナスなし" },

    { type:"fukubiki", title:"福引き", subtitle:"スーパーで福引きに挑戦！", icon:"gift", win:5000, lose:0 },

    { type:"red", title:"水もれ", subtitle:"自宅で水もれ発生！", icon:"water", cost:10000, costLabel:"修理代" },
    { type:"red", title:"アパートの鍵", subtitle:"アパートの鍵をなくした！", icon:"home", cost:20000, costLabel:"鍵の交換工事" },
    { type:"red", title:"車の修理", subtitle:"車が壊れた！", icon:"bus", cost:5000, costLabel:"車の修理", requireExpense:{key:"move", label:"A", reason:"「自分の車」を選んだ人だけ"} }
  ],

  ENDING: {
    plus: {
      heading:"じょうずに やりくりできたね！",
      body:"でも、まいつき いつも プラスにできるとは かぎりません。これから 入ってくるお金と 出ていくお金を 予想しながら 使うしゅうかんが、しょうらいの あなたを たすけてくれます。"
    },
    minus: {
      heading:"マイナスでも、しっぱいじゃないよ",
      body:"今回は たまたま 出ていくお金が 多かっただけ。大切なのは「つぎは どうしようかな」と 考えられること。ふだんから 先のお金を 予想しながら くらせば、ちゃんと 立てなおせます。"
    },
    common:"お金は、これからのことを 考えながら 使うと、こわくない。"
  }

};

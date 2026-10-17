import {evaluateChapter3,validateChapter3Answers} from "./engine.mjs";

/** CH3 ONLY. No C1/C2 source imports, no GAS, no storage, no referrals or analytics. */
const ART="../../assets/";
const MASCOT=ART+"mudagiri/poses/v1/MUDAGIRI_POSE_03_GUIDE.webp";
const REWARD=ART+"mudagiri/poses/v1/MUDAGIRI_POSE_23_RESULT.webp";
const SCROLL=ART+"mudagiri/poses/v1/MUDAGIRI_POSE_20_CHECK.webp";
const BG=ART+"mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp";
const HALL=ART+"mudagiri/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp";
const $=document.getElementById("chapter3-stage");
const newAnswers=()=>({goal:null,horizon:null,forces:{capital:null,time:null,credit:null},concern:null,topics:[]});
let answers=newAnswers(),screen="intro",step=0,dialogue=null,demoOpen=false;
const demoCases=[
 {name:"生活費・返済が不安",goal:"stability",horizon:"over10",forces:{capital:"notNow",time:"notNow",credit:"interested"},concern:"debt",topics:["budget","consult"]},
 {name:"3年以内 × 運用中",goal:"future",horizon:"under3",forces:{capital:"notNow",time:"active",credit:"unknown"},concern:"loss",topics:["investBasics"]},
 {name:"3年以内 × 未運用",goal:"family",horizon:"under3",forces:{capital:"notNow",time:"notNow",credit:"unknown"},concern:"none",topics:["resultOnly"]},
 {name:"目標はこれから",goal:"undecided",horizon:"unknown",forces:{capital:"unknown",time:"unknown",credit:"unknown"},concern:"skip",topics:["resultOnly"]},
 {name:"転職・副業に関心",goal:"freedom",horizon:"threeTo10",forces:{capital:"notNow",time:"notNow",credit:"notNow"},concern:"busy",topics:["career","sideWork"]},
 {name:"老後に向け積立中",goal:"retirement",horizon:"over10",forces:{capital:"interested",time:"active",credit:"unknown"},concern:"none",topics:["investBasics","consult"]},
 {name:"不動産・融資を知りたい",goal:"future",horizon:"threeTo10",forces:{capital:"notNow",time:"notNow",credit:"interested"},concern:"loss",topics:["propertyLearning"]},
 {name:"保障の選択肢を知りたい",goal:"family",horizon:"threeTo10",forces:{capital:"unknown",time:"unknown",credit:"notNow"},concern:"dontKnow",topics:["insurance"]}
];
const goals=[
 ["stability","毎日の暮らしに、もっと余裕がほしい","☀"],
 ["future","将来のお金の心配を減らしたい","✦"],
 ["retirement","老後の暮らしに備えたい","⌛"],
 ["family","家や子どものことに備えたい","⌂"],
 ["freedom","好きなことを選べる余裕がほしい","✧"],
 ["undecided","まだ決めていない","？"]
];
const horizons=[
 ["under3","3年以内","◷"],["threeTo10","3〜10年くらい","◴"],
 ["over10","10年以上先","∞"],["unknown","まだ分からない","？"]
];
const concerns=[
 ["living","毎月の生活費に余裕がない","◈"],
 ["debt","ローンや返済の負担が気になる","◇"],
 ["dontKnow","何から始めたらいいか分からない","？"],
 ["loss","損をするのが不安","⚑"],
 ["busy","忙しくて考える時間がない","⌛"],
 ["none","特に困っていない","✦"],
 ["skip","答えたくない","—"]
];
const topics=[
 ["investBasics","資産運用の基本","◈"],
 ["propertyLearning","不動産投資・借入の仕組み","⌂"],
 ["sideWork","副業で収入を増やす","✣"],
 ["career","転職・年収アップ","↗"],
 ["skills","今の仕事に役立つスキル","◆"],
 ["insurance","保険・保障の見直し","✚"],
 ["budget","毎月の家計改善","⚑"],
 ["consult","自分の場合を相談したい","✧"],
 ["resultOnly","今は結果だけ見たい","✓"]
];
const forceTexts={
 capital:{title:"お金の力",sub:"まとまったお金を運用してる？",desc:"今あるお金を使う方法",values:["今やっている","興味はある","今は考えていない","よく分からない"]},
 time:{title:"時間の力",sub:"積立や長期の運用をしてる？",desc:"積み重ねと時間を使う方法",values:["今やっている","興味はある","今は考えていない","よく分からない"]},
 credit:{title:"信用力の活用",sub:"借入を使う投資や事業の方法を知ってる？",desc:"借りられるかの診断ではないよ",values:["使ったことがある","仕組みを知りたい","利用するつもりはない","よく分からない"]}
};
const statusKeys=["active","interested","notNow","unknown"];
const statusLabels={active:"活用・経験あり",interested:"関心あり",notNow:"今は選ばない",unknown:"未確認"};
const storyVisuals={
 household:{crest:"🛡",tag:"足元を固めるルート"},short_active:{crest:"⌛",tag:"時間を味方にするルート"},
 short:{crest:"⌛",tag:"期限から考えるルート"},no_goal:{crest:"✧",tag:"目的を探すルート"},
 earning:{crest:"↗",tag:"稼ぐ力を伸ばすルート"},existing:{crest:"◈",tag:"続け方を確かめるルート"},
 borrowing:{crest:"◇",tag:"仕組みを見極めるルート"},start:{crest:"✦",tag:"選択肢を知るルート"}
};
function node(tag,klass,txt){const n=document.createElement(tag);if(klass)n.className=klass;if(txt!==undefined)n.textContent=txt;return n;}
function append(p,...children){for(const c of children)if(c)p.appendChild(c);return p;}
function btn(text,klass,fn){const b=node("button",klass,text);b.type="button";b.addEventListener("click",fn);return b;}
function paragraph(text,klass){return node("p",klass||"",text);}
function image(src,klass,alt){const i=node("img",klass);i.src=src;i.alt=alt;return i;}
function sectionClass(klass){return node("section",klass);}
function scrollTop(){window.scrollTo({top:0,behavior:"instant"});}
function cardBody(){const shell=node("div","stage-shell");const top=node("div","build-flag","CHAPTER III  ·  独立プレビュー  /  個人情報の保存・送信なし");shell.append(top);return shell;}
function chapterNav(active){const nav=node("div","chapter-rail");nav.setAttribute("aria-label","ムダギリの物語");
 const names=[["Ⅰ","冒険者","前の章"],["Ⅱ","家計バトル","前の章"],["Ⅲ","未来の大陸","NEW STAGE"]];
 for(let i=0;i<3;i++){const item=node("div","rail-stop"+(i===2?" current":""));append(item,node("small","",names[i][0]),node("span","",names[i][1]),node("em","",names[i][2]));nav.append(item);if(i<2)nav.append(node("b","rail-arrow","›"));}
 return nav;
}
function heroCopy(text,pose){const box=node("div","speech-stage");append(box,image(pose||MASCOT,"speech-mascot","ムダギリくん"),append(node("div","speech-text"),node("small","","ムダギリくん"),paragraph(text)));return box;}
function stageHead(tag,title,sub){const head=node("header","area-heading");append(head,node("div","heading-over",tag),node("h1","",title),paragraph(sub,"heading-desc"));return head;}
function reset(){answers=newAnswers();step=0;screen="intro";dialogue=null;demoOpen=false;render();scrollTop();}
function begin(){screen="quest";step=0;render();scrollTop();}
function areaIntro(){
 const shell=cardBody();
 const scene=sectionClass("new-world-scene");
 scene.style.setProperty("--world-bg","url("+BG+")");
 append(scene,
  node("p","area-crest","✦  NEW AREA UNLOCKED  ✦"),
  node("div","chapter-letter","CHAPTER Ⅲ"),
  node("h1","world-title","未来の大陸"),
  node("p","world-sub","守るだけじゃない。ここからは、未来をつくる冒険。")
 );
 const map=node("div","stage-route");
 append(map,node("div","route-path"));
 [["Ⅰ","冒険者を知る","CLEAR"],["Ⅱ","家計を見極める","CLEAR"],["Ⅲ","未来をつくる","NEW!"]].forEach((x,i)=>{
  const stop=node("div","map-stop"+(i===2?" is-new":""));
  append(stop,node("span","map-seal",x[0]),node("strong","",x[1]),node("small","",x[2]));map.append(stop);
 });
 scene.append(map);
 const gate=node("div","portal");
 append(gate,node("span","portal-rune","✧"),node("div","portal-inner","未来への扉が開いた"));
 scene.append(gate);
 scene.append(heroCopy("前のクエストでは家計を見極めたね。次は、何を育てるか。未来の作戦を一緒に考えよう！",MASCOT));
 const open=node("div","intro-next");
 append(open,
  node("p","story-label","新エリアの攻略目標"),
  node("h2","","自分だけの未来の作戦書を手に入れよう"),
  paragraph("5つの問いで、今のお金・時間・働き方を整理。あなたが次に確かめたいことが見つかる。"),
  btn("第3章をはじめる  →","gold-cta",begin),
  node("small","fineprint","約1〜2分は設計目安。商品適性・融資可否を判定するものではありません。")
 );
 append(shell,scene,open);
 return shell;
}
function progress(){
 const wrap=node("div","quest-progress");const label=node("div","progress-caption");
 append(label,node("span","","未来の地図を探索中"),node("b","",String(step+1)+" / 5"));wrap.append(label);
 const spots=node("div","progress-spots");spots.setAttribute("aria-label","質問の進行状況");
 for(let i=0;i<5;i++){const spot=node("span","progress-spot"+(i<step?" done":i===step?" current":""));spot.textContent=i<step?"✓":String(i+1);spots.append(spot);}
 wrap.append(spots);return wrap;
}
function choice(text,glyph,selected,fn,kind){const b=btn("","answer-option"+(selected?" selected":"")+(kind==="small"?" compact":""),fn);b.setAttribute("aria-pressed",String(!!selected));append(b,node("span","option-glyph",glyph),node("span","option-text",text),node("span","option-mark",selected?"✓":"›"));return b;}
function picked(){
 if(step===0)return !!answers.goal;
 if(step===1)return !!answers.horizon;
 if(step===2)return Object.values(answers.forces).every(x=>x!==null);
 if(step===3)return !!answers.concern;
 return answers.topics.length>=1;
}
function selectSingle(field,value){answers[field]=value;render();}
function selectForce(key,value){answers.forces[key]=value;render();}
function selectTopic(value){
 if(value==="resultOnly"){answers.topics=["resultOnly"];render();return;}
 let next=answers.topics.filter(t=>t!=="resultOnly");
 if(next.includes(value))next=next.filter(x=>x!==value);
 else if(next.length<2)next=[...next,value];
 else{dialogue="2つまで選べるよ。気になるものをもう一度押すと、選び直せる。";render();return;}
 answers.topics=next;dialogue=null;render();
}
function next(){
 if(!picked())return;
 if(step<4){step++;dialogue=null;render();scrollTop();return;}
 const validation=validateChapter3Answers(answers);
 if(!validation.ok){dialogue="まだ確認できていない項目があるよ。";render();return;}
 screen="result";dialogue=null;render();scrollTop();
}
function previous(){if(step===0){screen="intro"}else{step--;}dialogue=null;render();scrollTop();}
function questionScreen(){
 const shell=cardBody();shell.append(chapterNav());shell.append(progress());
 const stage=sectionClass("question-arena");
 stage.style.setProperty("--world-bg","url("+HALL+")");
 const names=[
  ["QUEST 01 · 未来の目的","これから、お金の面で叶えたいことは？","いちばん近いものを1つ。まだ決まっていなくても大丈夫。","ここでは正解も不正解もないよ。自分の気持ちに近いものを選んでね。"],
  ["QUEST 02 · 時間の地図","それ、いつ頃までに叶えたい？","だいたいの時期でOK。","目標までの時間で、比べるべき選択肢が変わることもあるんだ。"],
  ["QUEST 03 · 3つの力","今の自分は、どんな状態？","3つ全部使っている必要はないよ。","ここは得意・不得意の採点じゃない。やっていることと、興味があることを整理しよう。"],
  ["QUEST 04 · 気になること","今、お金のことで一番気になるのは？","いちばん近いものを1つ選んでね。","心配を増やすためじゃないよ。先に確かめることを決めるためなんだ。"],
  ["QUEST 05 · 次の行き先","次は、どんな選択肢を知ってみたい？","2つまで選択OK。結果だけ見たい場合も選べるよ。","どこへ進むかは自分で決めていい。気になるものを選んでみよう。"]
 ];
 const [tag,title,sub,talk]=names[step];
 append(stage,stageHead(tag,title,sub),heroCopy(dialogue||talk,step===2?SCROLL:MASCOT));
 const options=node("div","question-options"+(step===2?" multi-powers":""));
 if(step===0||step===1||step===3){const vals=step===0?goals:step===1?horizons:concerns;const field=step===0?"goal":step===1?"horizon":"concern";
  for(const v of vals)options.append(choice(v[1],v[2],answers[field]===v[0],()=>selectSingle(field,v[0])));
 }else if(step===2){
  const forceGlyphs={capital:"◈",time:"⌛",credit:"◇"};
  for(const [key,force] of Object.entries(forceTexts)){
   const group=node("fieldset","force-question");group.setAttribute("data-force",key);
   const legend=node("legend","",""+forceGlyphs[key]+"  "+force.title);append(group,legend,node("p","force-prompt",force.sub),node("small","force-explain",force.desc));
   const grid=node("div","force-choices");
   statusKeys.forEach((status,i)=>grid.append(choice(force.values[i],i===0?"✓":i===1?"✧":i===2?"—":"?",answers.forces[key]===status,()=>selectForce(key,status),"small")));
   group.append(grid);options.append(group);
  }
 }else{
  const chosen=node("div","chosen-count",answers.topics.includes("resultOnly")?"結果だけ見る":String(answers.topics.length)+" / 2 選択中");options.append(chosen);
  for(const v of topics)options.append(choice(v[1],v[2],answers.topics.includes(v[0]),()=>selectTopic(v[0])));
 }
 stage.append(options);
 const actions=node("div","question-footer");
 const primary=btn(step===4?"作戦書をひらく  ✦":"次の問いへ  →","gold-cta",next);
 primary.disabled=!picked();append(actions,primary,btn("←  戻る","quiet-back",previous));
 stage.append(actions);shell.append(stage);
 return shell;
}
function idea(icon,text){const el=node("div","idea-row");append(el,node("b","",icon),node("span","",text));return el;}
function resultScreen(){
 const evaluated=evaluateChapter3({answers,chapter1:null,chapter2:null});
 if(!evaluated.ok){screen="quest";step=4;dialogue="結果を表示する前に確認が必要だよ。";return questionScreen();}
 const current=storyVisuals[evaluated.storyKey]||storyVisuals.start;
 const shell=cardBody();shell.append(chapterNav());
 const hero=sectionClass("reward-reveal");
 hero.style.setProperty("--world-bg","url("+BG+")");
 append(hero,node("p","area-crest","✦  QUEST CLEAR!  ✦"),node("div","chapter-letter","CHAPTER Ⅲ CLEAR"),
 node("h1","world-title","未来の作戦書を獲得！"),paragraph("君の答えから、次に進むルートが見つかった。","world-sub"));
 const token=node("div","reward-token");append(token,node("span","reward-token-inner",current.crest),node("small","",current.tag));hero.append(token);
 hero.append(heroCopy("未来の地図がひらいたぞ！ここで分かったことを、一緒に確かめよう。",REWARD));
 shell.append(hero);
 const report=node("div","result-scroll");
 append(report,node("p","result-kicker","発見した未来のルート"),node("h2","",evaluated.insight.title),
  append(node("div","question-reveal"),node("small","","次に確かめたい問い"),paragraph(evaluated.insight.question)),
  paragraph(evaluated.insight.why,"result-why"),
  append(node("div","step-reward"),node("span","","今日できる一歩"),node("strong","",evaluated.insight.action)));
 shell.append(report);
 const cards=sectionClass("new-powers");
 append(cards,node("p","result-kicker","冒険者の現在地"),node("h2","","3つの力 ＋ 稼ぐ力"));
 const powerGrid=node("div","power-grid");
 const entries=[
 ["◈","お金","まとまったお金を使う方法",evaluated.threeForces.capital],
 ["⌛","時間","積立や期間を活かす方法",evaluated.threeForces.time],
 ["◇","借入","信用力を使う仕組み",evaluated.threeForces.credit]
 ];
 for(const a of entries){const c=node("article","power-tile");append(c,node("span","power-glyph",a[0]),node("strong","",a[1]),node("small","",statusLabels[a[3]]),node("p","",a[2]));powerGrid.append(c);}
 const earning=node("article","earn-power");append(earning,node("div","earn-glyph","↗"),append(node("div",""),node("b","","稼ぐ力"),paragraph("転職・副業・学習なども、未来を選ぶ手段になる。")));
 append(cards,powerGrid,earning,paragraph("これは回答時点の状態表示。資産額や年収、融資できる額を判定したものではない。","caution"));
 shell.append(cards);
 const nextStage=sectionClass("mission-choice");
 append(nextStage,node("p","result-kicker","次のクエスト"),node("h2","","ここから先は、自分で選べる"),paragraph("先ほど選んだ関心から、まず知っておきたいことを整理しよう。"));
 const labels=Object.fromEntries(topics.map(a=>[a[0],a[1]]));
 const entries2=evaluated.topicIds;
 if(entries2.length===0)nextStage.append(paragraph("今日は作戦書を手に入れて、ここで冒険を終えるのもOK。","mission-topic"));
 else for(const t of entries2)nextStage.append(idea("✦",labels[t]||t));
 const action=btn(evaluated.primaryAction.label+"  →","gold-cta",()=>openAction(evaluated));
 const consult=btn("ライフプラン相談について知る","alt-cta",()=>openAction({primaryAction:{kind:"consult_interest"},topicIds:[]}));
 nextStage.append(action);
 if(evaluated.primaryAction.kind!=="consult_interest")nextStage.append(consult);
 const panel=node("div","action-panel");panel.id="action-panel";panel.hidden=true;nextStage.append(panel);
 nextStage.append(paragraph("この体験版では、提携先への紹介・予約・情報送信は行わないよ。","caution"));
 shell.append(nextStage);
 const final=sectionClass("result-footer");append(final,
  btn("もう一度、未来を探索する","quiet-back",reset),
  btn("結果パターンを試す（デモ）","test-toggle",()=>{demoOpen=!demoOpen;document.getElementById("demo-choices").hidden=!demoOpen;}));
 const dev=node("div","demo-choices");dev.id="demo-choices";dev.hidden=!demoOpen;
 dev.append(paragraph("8つの合成回答で、表示の違いを確認できます。個人データではありません。","caution"));
 const select=node("select","demo-select");select.setAttribute("aria-label","デモケース");
 const blank=node("option","","デモケースを選ぶ");blank.value="";select.append(blank);
 demoCases.forEach((x,i)=>{const opt=node("option","",String(i+1)+". "+x.name);opt.value=String(i);select.append(opt);});
 select.addEventListener("change",()=>{if(select.value==="")return;const a=demoCases[Number(select.value)];answers={goal:a.goal,horizon:a.horizon,forces:{...a.forces},concern:a.concern,topics:[...a.topics]};screen="result";render();scrollTop();});
 dev.append(select);final.append(dev);shell.append(final);
 return shell;
}
function openAction(res){
 const panel=document.getElementById("action-panel");panel.hidden=false;panel.replaceChildren();
 const action=res.primaryAction;
 if(action.kind==="save"){append(panel,node("strong","","作戦書を獲得！"),paragraph("このプレビューでは個人データは保存していません。必要なら最初から診断できます。"));}
 else if(action.kind==="consult_interest"){append(panel,node("strong","","ライフプラン相談で整理すること"),paragraph("目標や必要な時期、家計の現状、選択肢のリスクを一緒に確認するための入口だよ。正式な予約・LINE導線は未接続。"));}
 else{append(panel,node("strong","","まずは仕組みと条件を知ろう"),paragraph("費用・リスク・必要な時間・申込条件を確認してから選ぶことが大事。ここでは商品や紹介先の自動推薦はしないよ。"));}
 panel.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"});
}
function render(){
 $.replaceChildren(screen==="intro"?areaIntro():screen==="quest"?questionScreen():resultScreen());
 document.title=screen==="intro"?"第3章｜未来の大陸 · ムダギリ診断":screen==="quest"?"QUEST "+String(step+1)+"｜未来の大陸":"作戦書を獲得｜第3章";
}
render();

import {GOALS,HORIZONS,PREPARATIONS,OBSTACLES,PRIORITIES,buildDiscovery} from "./engine.mjs";
import {getTopicGuide} from "../chapter3-v12/next-guide.mjs";
/** Chapter 3 V1.6 isolated pilot: zero storage, zero backend requests, no C1/C2 data reading. */
const root=document.getElementById("chapter3-stage");
const ASSETS="../../assets/";
const GUIDE=ASSETS+"mudagiri/poses/v1/MUDAGIRI_POSE_03_GUIDE.webp";
const WIN=ASSETS+"mudagiri/poses/v1/MUDAGIRI_POSE_23_RESULT.webp";
const BG=ASSETS+"mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp";
const HALL=ASSETS+"mudagiri/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp";
const FIELDS=["goal","horizon","preparation","obstacle","priority"];
const initial=()=>({goal:null,horizon:null,preparation:null,obstacle:null,priority:null});
let answers=initial(),screen="intro",step=0,selectedTopics=[],planOpened=false,guideOpened=false,consultOpened=false,copied=false;
const QUESTIONS=[
 {legend:"叶えたい未来",head:"お金の心配が減ったら、何を変えたい？",sub:"「何を増やすか」の前に、叶えたい暮らしを1つ選ぼう。",say:"自分の本当の目的が、未来の地図になる。",keys:["stability","future","retirement","family","freedom","undecided"],map:GOALS,glyphs:["☀","✦","⌛","⌂","↗","？"]},
 {legend:"叶えたい時期",head:"その未来、いつ頃叶えたい？",sub:"正確でなくていい。時期が決まっていなくても大丈夫。",say:"いつ使うお金かで、選ぶ道は変わってくる。",keys:["under3","threeTo10","over10","unknown"],map:HORIZONS,glyphs:["◷","◴","∞","？"]},
 {legend:"今の準備",head:"その未来に向けて、今どこまで進んでる？",sub:"金額や収入を聞く質問じゃないよ。今の感覚に近いものを選んで。",say:"今の立ち位置が分かれば、次の一歩を無理なく決められる。",keys:["regular","uncertain","notYet","unknown"],map:PREPARATIONS,glyphs:["✓","◇","⚑","？"]},
 {legend:"行く手の霧",head:"その未来を遠ざけているのは、どんなこと？",sub:"困っていないなら「特にない」でOK。無理に不安を探さなくていい。",say:"足を止めているものを知るのも、立派な前進だよ。",keys:["living","debt","dontKnow","loss","busy","none","skip"],map:OBSTACLES,glyphs:["◈","◇","？","⚑","⌛","✦","—"]},
 {legend:"守りたいもの",head:"未来のために、何を犠牲にしたくない？",sub:"正解はないよ。今の暮らしで大切にしたいものを1つ。",say:"叶えたいことだけじゃなく、守りたいものも作戦に入れよう。",keys:["joy","people","peace","growth","freedom"],map:PRIORITIES,glyphs:["✧","♡","🛡","✦","↗"]}
];
const TOPICS=[
 ["investBasics","資産運用の基本"],["propertyLearning","不動産・借入"],["sideWork","副業"],["career","転職・キャリア"],
 ["skills","スキル・学び直し"],["insurance","保障の見直し"],["budget","家計を整える"],["consult","ライフプランの整理"]
];
const el=(tag,cls="",text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
const add=(p,...children)=>{for(const c of children)if(c)p.append(c);return p;};
const p=(s,cls="")=>el("p",cls,s);
const button=(s,cls,fn)=>{const b=el("button",cls,s);b.type="button";b.onclick=fn;return b;};
const img=(src,cls,alt)=>{const n=el("img",cls);n.src=src;n.alt=alt;return n;};
const shell=()=>add(el("div","stage-shell"),p("CHAPTER III · 未来の作戦書 / 保存なし","build-flag"));
const bg=(n,image)=>{n.style.setProperty("--world-bg","url('"+image+"')");return n;};
function rail(){
 const r=el("div","chapter-rail");
 [["Ⅰ","自分の戦い方"],["Ⅱ","家計バトル"],["Ⅲ","未来の大陸"]].forEach(([i,label],n)=>{
  if(n)r.append(el("b","rail-arrow","›"));
  const a=el("div","rail-stop"+(n===2?" current":""));
  add(a,el("small","",i),el("span","",label),el("em","",n===2?"NOW":"前の章"));r.append(a);
 });
 return r;
}
function speech(s,pose=GUIDE){
 const w=el("div","speech-stage");
 return add(w,img(pose,"speech-mascot","ムダギリくん"),add(el("div","speech-text"),el("small","","ムダギリくん"),p(s)));
}
function toTop(){window.scrollTo({top:0,behavior:"instant"});}
function start(){screen="quest";step=0;render();toTop();}
function choose(k){
 answers[FIELDS[step]]=k;
 if(step<4)step++;else screen="result";
 render();toTop();
}
function goBack(){if(step===0){screen="intro";}else step--;render();toTop();}
function reset(){answers=initial();screen="intro";step=0;selectedTopics=[];planOpened=false;guideOpened=false;consultOpened=false;copied=false;render();toTop();}
function intro(){
 const w=shell();
 const scene=bg(el("section","new-world-scene v16-intro"),BG);
 add(scene,p("✦ NEW AREA UNLOCKED ✦","area-crest"),el("div","chapter-letter","CHAPTER Ⅲ"),
 el("h1","world-title","未来の大陸"),p("増やす前に、どんな未来を叶えたい？","world-sub"));
 const steps=el("div","v16-story-progress");
 [["Ⅰ","自分を知る"],["Ⅱ","家計を知る"],["Ⅲ","未来を選ぶ"]].forEach(([n,s],i)=>{
  steps.append(add(el("div","v16-story-stop"+(i===2?" current":"")),el("span","",n),el("b","",s)));
 });
 scene.append(steps);
 const portal=el("div","portal");add(portal,el("span","portal-rune","✧"),el("div","portal-inner","未来の扉が開いた"));scene.append(portal);
 scene.append(speech("お金を増やす方法は、その先に叶えたいことがあってこそ意味がある。まずは君の未来を探そう！"));
 scene.append(button("5つの問いで、未来を探す →","gold-cta stage-entry-cta",start));
 scene.append(p("未来の目的地・今の障害・守りたいものから、最初の一歩を見つける。","v16-hero-promise"));
 add(w,scene,add(el("section","v16-context"),p("第1章：自分の戦い方 ／ 第2章：家計との戦い","v16-context-cap"),el("h2","","第3章は「その先、どう生きたい？」"),p("前章のJOB・STYLEや家計の戦果は、現在この独立プレビューへ未連携。実際の結果や改善額を作りません。","v16-minor")));
 return w;
}
function question(){
 const w=shell();w.append(rail());
 const progress=el("div","quest-progress");
 add(progress,add(el("div","progress-caption"),el("span","",QUESTIONS[step].legend),el("b","",String(step+1)+" / 5")));
 const spots=el("div","progress-spots");
 for(let n=0;n<5;n++)spots.append(el("span","progress-spot"+(n<step?" done":n===step?" current":""),n<step?"✓":String(n+1)));
 progress.append(spots);w.append(progress);
 const q=QUESTIONS[step],arena=bg(el("section","question-arena v16-arena"),HALL);
 add(arena,add(el("header","area-heading"),p("QUEST "+String(step+1).padStart(2,"0")+" · "+q.legend,"heading-over"),el("h1","",q.head),p(q.sub,"heading-desc")),speech(q.say));
 const choices=el("div","question-options");
 for(let i=0;i<q.keys.length;i++){
  const key=q.keys[i],value=q.map[key],label=typeof value==="string"?value:value.label;
  const b=button("","answer-option",()=>choose(key));
  add(b,el("span","option-glyph",q.glyphs[i]),el("span","option-text",label),el("span","option-mark","›"));
  choices.append(b);
 }
 add(arena,choices,p("選ぶと次の質問に進むよ","v16-auto-hint"),button("← 1つ前に戻る","quiet-back",goBack));
 w.append(arena);return w;
}
function result(){
 const d=buildDiscovery(answers);
 if(!d.ok){screen="quest";step=0;return question();}
 const w=shell();w.append(rail());
 const hero=bg(el("section","reward-reveal v16-result-hero"),BG);
 add(hero,p("✦ QUEST CLEAR! ✦","area-crest"),el("div","chapter-letter","CHAPTER III CLEAR"),
 el("h1","world-title","君の未来の作戦タイプは"),
 el("div","v16-route-name",d.routeTitle),
 add(el("div","v16-crest"),el("span","",d.crest)),speech("未来の地図、1枚目を手に入れたね。次は君だけの進み方を確かめよう！",WIN));
 w.append(hero);
 const insight=el("section","v16-insight");
 add(insight,p("✦ 回答から見えてきた、今の分岐点","v16-kicker"),
 el("h2","","君の答えをつなぐと、見えてくること"),
 p(d.discovery,"v16-discovery-hero"),
 add(el("div","v16-action-reward"),el("small","","まずできる、ひとつの行動"),el("strong","",d.action)),
 button("設計図に必要な3つのことを確認する →","gold-cta v16-primary",()=>{
  planOpened=true;render();document.getElementById("v16-plan")?.scrollIntoView({behavior:"smooth",block:"start"});
 }),
 p(d.headline,"v16-headline"),
 p(d.timeframeCue,"v16-timeframe"));
 const pair=el("div","v16-evidence-pair");
 add(pair,
  add(el("div","v16-evidence"),el("small","","叶えたい未来"),el("strong","",d.goal)),
  add(el("div","v16-evidence"),el("small","","今の立ち位置"),el("strong","",d.preparation)),
  add(el("div","v16-evidence"),el("small","","今の気がかり"),el("strong","",d.obstacle)),
  add(el("div","v16-evidence"),el("small","","手放したくないもの"),el("strong","",d.priority))
 );
 insight.append(pair);
 insight.append(p(d.synthesis,"v16-synthesis"));
 w.append(insight);
 const plan=el("section","v16-plan");plan.id="v16-plan";
 add(plan,p("MAP PIECE 01 / 03","v16-kicker"),el("h2","","ここから「未来の設計図」に変えよう"),
 p("5つの回答で分かったのは、目標・今の障害・守りたい条件。次は数字を確かめる段階。","v16-plan-desc"));
 const three=el("div","v16-piece-grid");
 [["1","発見済み","目標と最初の一歩"],["2","次の探索","いつ、いくら必要か"],["3","次の探索","今の資金と差額"]].forEach(([n,s,t],i)=>three.append(add(el("div","v16-piece"+(i===0?" earned":"")),el("b","",n),el("small","",s),el("strong","",t))));
 plan.append(three);
 if(planOpened){
  const detail=add(el("div","v16-unlocked"),p("✦ 次の地図が見えてきた","v16-kicker"),
   el("h3","","数字で確かめたい3つのこと"),
   add(el("ol",""),el("li","","叶えたい未来：「"+d.dream+"」のために、いつ・いくら必要？"),el("li","","今の家計：貯蓄・負債・毎月の余力はどのくらい？"),el("li","","差額と手段：足りない部分を、何を守りながら埋める？")),
   p("最初に確認するなら：「"+d.firstCheck+"」","v16-firstcheck"),
   p("数字を入力・保存・送信する機能や、相談予約はこの独立プレビューにはありません。","v16-minor"));
  plan.append(detail);
 }else plan.append(button("次の地図に必要なものを確認する","v16-alt",()=>{planOpened=true;render();document.getElementById("v16-plan")?.scrollIntoView({behavior:"smooth",block:"start"});}));
 add(plan,p(d.disclaimer,"v16-minor"));w.append(plan);
 const learn=el("section","v16-learn");
 add(learn,p("OPTIONAL / 次のクエスト","v16-kicker"),el("h2","","興味がある方法は、このあと選ぼう"),
 p("先に運用や借入を選ばせるのではなく、目的地を確認してから。比較したいテーマを2つまで選べる。","v16-plan-desc"));
 const grid=el("div","v16-topic-grid");
 for(const [key,label] of TOPICS){
  const b=button((selectedTopics.includes(key)?"✓ ":"✦ ")+label,"v16-topic"+(selectedTopics.includes(key)?" selected":""),()=>{
   if(selectedTopics.includes(key))selectedTopics=selectedTopics.filter(x=>x!==key);
   else if(selectedTopics.length<2)selectedTopics.push(key);
   else {const n=document.getElementById("v16-topic-warning");if(n)n.textContent="2つまで。選び直すなら、いずれかの選択を外してね。";return;}
   guideOpened=false;render();document.getElementById("v16-learn-anchor")?.scrollIntoView({block:"start"});
  });
  b.setAttribute("aria-pressed",String(selectedTopics.includes(key)));grid.append(b);
 }
 learn.id="v16-learn-anchor";learn.append(grid);
 learn.append(p("","v16-minor"));learn.lastChild.id="v16-topic-warning";
 if(selectedTopics.length)learn.append(button("選んだテーマの攻略ヒントを見る →","v16-alt",()=>{guideOpened=true;render();document.getElementById("v16-guide-results")?.scrollIntoView({behavior:"smooth",block:"start"});}));
 if(guideOpened){
  const detail=el("div","v16-guides");detail.id="v16-guide-results";
  for(const id of selectedTopics){
   const guide=getTopicGuide(id);if(!guide)continue;
   const box=el("article","v16-guide");
   add(box,el("h3","",guide.title),p(guide.benefit),el("strong","","確認したい3つのこと"));
   const ul=el("ul","");
   for(const s of guide.check)ul.append(el("li","",s));
   add(box,ul,el("strong","","今日の一歩"),p(guide.first),p(guide.caveat,"v16-minor"));
   detail.append(box);
  }
  learn.append(detail);
 }
 const consult=el("section","v16-consult");consult.id="v16-consult";
 add(consult,p("THE NEXT MAP / 任意の相談","v16-kicker"),
  el("h2","","一緒に整理すると、何が見える？"),
  p("「"+d.goal+"」に近づくために、生活を無理に変える前に、判断材料をそろえる。","v16-plan-desc"),
  p(d.benefit,"v16-consult-benefit"));
 if(!consultOpened){
  consult.append(button("相談で整理できる3つのことを見る","v16-alt",()=>{consultOpened=true;render();document.getElementById("v16-consult")?.scrollIntoView({behavior:"smooth",block:"start"});}));
 }else{
  const items=el("ol","v16-consult-items");
  [
   ["目的地を数字にする","いつ・何に・いくら必要か。必要額が分からない部分も分けて考える。"],
   ["今ある材料を棚卸しする","貯蓄・返済・保障・家計の状況を確認する。第2章の確定改善額と未確定候補は混ぜない。"],
   ["今の暮らしを守る道を比べる","「"+d.priority+"」を守る条件から、実行できそうな選択肢と先に調べることを整理する。"]
  ].forEach(([h,body])=>items.append(add(el("li",""),el("strong","",h),p(body))));
  consult.append(items);
 }
 consult.append(p("ここでは相談予約・LINE送信は行いません。必要額や将来の成果を保証するものでもありません。","v16-minor"));
 w.append(consult);w.append(learn);
 const share=el("section","v16-share");
 add(share,p("冒険の称号だけ、シェアしよう","v16-kicker"),el("h2","",d.routeTitle),
 p("金額や答えた気がかりはシェア文に含めない。","v16-minor"),
 button(copied?"コピーできたよ！":"称号をコピーする","v16-alt",async()=>{
  try{await navigator.clipboard.writeText(d.shareText);copied=true;render();}
  catch{document.getElementById("v16-share-fallback").textContent=d.shareText;}
 }),p("","v16-minor"));share.lastChild.id="v16-share-fallback";
 w.append(share);
 const details=el("details","v16-evidence-details");
 add(details,el("summary","","なぜこの結果？ 回答の組み合わせを見る"),p(d.premise),p(d.why),p("判定は回答に対する優先順位の提案。性格・収入・融資可能額を推定していません。"));
 w.append(details);
 add(w,button("最初から、未来を探索し直す","quiet-back v16-reset",reset),p("第1章JOB・STYLE／第2章12カテゴリは未連携。金額の創作・外部送信・予約は行いません。","v16-page-note"));
 return w;
}
function render(){
 root.replaceChildren(screen==="intro"?intro():screen==="quest"?question():result());
 document.title=screen==="result"?"未来の作戦書を獲得｜ムダギリ診断 第3章":screen==="quest"?"QUEST "+String(step+1)+"｜未来の大陸":"第3章V1.6｜未来の大陸";
}
render();

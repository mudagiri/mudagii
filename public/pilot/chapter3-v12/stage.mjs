import {evaluateChapter3,validateChapter3Answers} from "./engine.mjs";
import {buildChapter3Motivation} from "./motivation.mjs";
import {JOBS,STYLES,journeyView,journeyDialogue,chapter2StoryDescription,FOG_STAGES,MAP_REWARD} from "./story.mjs";

/** CH3 ONLY. No C1/C2 source imports, no GAS, no storage, no referrals or analytics. */
const ART="../../assets/";
const MASCOT=ART+"mudagiri/poses/v1/MUDAGIRI_POSE_03_GUIDE.webp";
const REWARD=ART+"mudagiri/poses/v1/MUDAGIRI_POSE_23_RESULT.webp";
const SCROLL=ART+"mudagiri/poses/v1/MUDAGIRI_POSE_20_CHECK.webp";
const BG=ART+"mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp";
const HALL=ART+"mudagiri/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp";
const $=document.getElementById("chapter3-stage");
const newAnswers=()=>({goal:null,horizon:null,forces:{capital:null,time:null,credit:null},concern:null,topics:[]});
let answers=newAnswers(),screen="intro",step=0,dialogue=null,demoOpen=false,previewSample=false;
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
function relicArchive(journey,finished=false){
 const box=sectionClass("relic-archive");
 box.setAttribute("data-story-phase",finished?"reward-legacy":"chapter-legacy");
 append(box,node("p","relic-eyebrow","冒険の記録  ·  THE JOURNEY"),
  node("h2","","ここまでの冒険は、未来へつながる"));
 const line=node("div","relic-progress");
 const c1=node("article","relic-tile");
 const j=journey.chapter1?JOBS[journey.chapter1.job]:null;
 if(j){c1.append(image(ART+"jobs/v1/"+j.file,"relic-job-img","サンプルJOBの公式画像："+j.name));}
 else c1.append(node("span","relic-symbol","⚔"));
 append(c1,node("small","","CHAPTER Ⅰ / 冒険者の覚醒"),
  node("strong","",j?j.name:"お金の戦い方を知る"),
  paragraph(j?"STYLE： "+STYLES[journey.chapter1.style]+"（サンプル）":"JOB・STYLEは未連携","relic-foot"));
 const c2=node("article","relic-tile");
 append(c2,node("span","relic-symbol","◆"),node("small","","CHAPTER Ⅱ / 家計の魔物"),
  node("strong","",journey.chapter2?"戦果を見つける（サンプル）":"家計の現在地を知る"),
  paragraph(chapter2StoryDescription(journey.chapter2),"relic-foot"));
 append(line,c1,c2);
 const c3=node("article","relic-tile relic-new");
 append(c3,node("span","relic-symbol","✦"),node("small","","CHAPTER Ⅲ / 未来の大陸"),
  node("strong","",finished?"未来の地図・第一片":"未来の目的地を探す"),
  paragraph(finished?"最初の一片を獲得。地図の完成はこれから。":"これまで守ってきたお金を、何のために使う？","relic-foot"));
 line.append(c3);box.append(line);
 box.append(paragraph(journey.label,"relic-disclosure"));
 return box;
}
function storyFog(){
 const panel=sectionClass("fog-riddle");
 append(panel,node("div","fog-emblem","☁"),
  append(node("div","fog-copy"),node("p","fog-kicker","第3章の敵 · 未来の霧"),
    node("strong","","未来が見えないまま、手段だけ選んでいない？"),
    paragraph("目的・期限・必要なお金が見えないと、どの道を選べばいいか分かりにくい。5つの問いで、霧の向こうを見に行こう。")));
 return panel;
}
function mapFragments(){
 const fragment=sectionClass("map-fragments");
 append(fragment,node("p","result-kicker","NEW ITEM · 地図の欠片"),
  node("h2","","未来の地図は、まだ完成していない"));
 const pieces=[
  ["1","獲得！",MAP_REWARD.unlocked,true],
  ["2","未解放",MAP_REWARD.lockedMoney,false],
  ["3","未解放",MAP_REWARD.lockedGap,false]
 ];
 const row=node("div","fragment-grid");
 for(const [n,state,info,ok] of pieces){
  const c=node("div","fragment-tile"+(ok?" fragment-earned":" fragment-locked"));
  append(c,node("span","fragment-number",n),node("small","",state),node("strong","",info));row.append(c);
 }
 fragment.append(row);
 fragment.append(paragraph(MAP_REWARD.disclaimer,"fragment-note"));
 return fragment;
}

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
  node("p","world-sub","守った先に、どんな未来が待ってる？")
 );
 const map=node("div","stage-route");
 append(map,node("div","route-path"));
 const journey=journeyView(previewSample);
 [["Ⅰ","自分の戦い方",journey.ready?"SAMPLE":"前章"],["Ⅱ","家計との戦い",journey.ready?"SAMPLE":"前章"],["Ⅲ","未来の目的地","NEW!"]].forEach((x,i)=>{
  const stop=node("div","map-stop"+(i===2?" is-new":""));
  append(stop,node("span","map-seal",x[0]),node("strong","",x[1]),node("small","",x[2]));map.append(stop);
 });
 scene.append(map);
 const gate=node("div","portal");
 append(gate,node("span","portal-rune","✧"),node("div","portal-inner","未来への扉が開いた"));
 scene.append(gate);
 scene.append(heroCopy(journeyDialogue(previewSample),MASCOT));
 scene.append(btn("未来の霧を晴らしに行く  →","gold-cta stage-entry-cta",begin));
 scene.append(storyFog());
 const open=node("div","intro-next");
 open.append(relicArchive(journey));
 const demoToggle=btn(previewSample?"サンプル演出を閉じる":"前章を引き継ぐ演出を見る（架空サンプル）","story-demo-toggle",()=>{previewSample=!previewSample;render();scrollTop();});
 open.append(demoToggle);
 append(open,
  node("p","story-label","新エリアの攻略目標"),
  node("h2","","未来の地図・第一片を手に入れよう"),
  paragraph("JOBと家計の戦果を、どんな未来につなぐ？ 5つの問いで「目的地」と「次に確かめたいこと」を探そう。"),
  node("small","fineprint","約1〜2分は設計目安。商品適性・融資可否を判定するものではありません。")
 );
 append(shell,scene,open);
 return shell;
}
function progress(){
 const wrap=node("div","quest-progress");const label=node("div","progress-caption");
 append(label,node("span","",FOG_STAGES[step].name),node("b","",String(step+1)+" / 5"));wrap.append(label);
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
  ["QUEST 01 · 霧の向こうの目的地","お金の心配が減ったら、どんな暮らしがしたい？","いちばん近いものを1つ。まだ決まっていなくても大丈夫。","増やす方法の前に、君が叶えたいことを教えて。そこから作戦を考えよう。"],
  ["QUEST 02 · 目的地までの距離","それ、いつ頃までに叶えたい？","だいたいの時期でOK。","目標までの時間で、比べるべき選択肢が変わることもあるんだ。"],
  ["QUEST 03 · 冒険の装備","今は、どんな方法を使っている？","全部使う必要はないよ。","ここは採点じゃない。未来に向かうための手段を、まず整理してみよう。"],
  ["QUEST 04 · 行く手を阻む霧","その未来を考えるとき、何がいちばん気になる？","困っていないなら「特にない」でOK。","無理に不安を探さなくていい。今引っかかっていることだけ教えてね。"],
  ["QUEST 05 · 次の航路","何が分かれば、一歩進めそう？","気になるものを2つまで。結果だけでもOK。","商品を決める前に、今の君に役立つ情報を選ぼう。"]
 ];
 const [tag,title,sub,talk]=names[step];
 append(stage,stageHead(tag,title,sub),paragraph("霧を晴らす手がかり · "+FOG_STAGES[step].quest,"fog-step-kicker"),heroCopy(dialogue||talk,step===2?SCROLL:MASCOT));
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
 const primary=btn(step===4?"地図の第一片を獲得する  ✦":"霧の向こうへ進む  →","gold-cta",next);
 primary.disabled=!picked();append(actions,primary,btn("←  戻る","quiet-back",previous));
 stage.append(actions);shell.append(stage);
 return shell;
}
function idea(icon,text){const el=node("div","idea-row");append(el,node("b","",icon),node("span","",text));return el;}
function resultScreen(){
 const evaluated=evaluateChapter3({answers,chapter1:null,chapter2:null});
 if(!evaluated.ok){screen="quest";step=4;dialogue="結果を表示する前に確認が必要だよ。";return questionScreen();}
 const current=storyVisuals[evaluated.storyKey]||storyVisuals.start;
 const motivation=buildChapter3Motivation(answers);
 const shell=cardBody();shell.append(chapterNav());
 const hero=sectionClass("reward-reveal");
 hero.style.setProperty("--world-bg","url("+BG+")");
 append(hero,node("p","area-crest","✦  QUEST CLEAR!  ✦"),node("div","chapter-letter","CHAPTER Ⅲ CLEAR"),
 node("h1","world-title","未来の地図・第一片を獲得！"),paragraph("霧の向こうに、君の目指す方向が見えてきた。","world-sub"));
 const token=node("div","reward-token");append(token,node("span","reward-token-inner",current.crest),node("small","",current.tag));hero.append(token);
 hero.append(heroCopy("いいぞ！未来の地図の最初の欠片が見つかった。でも必要額と、今とのギャップはまだ未解放。続きを見つけよう！",REWARD));
 shell.append(hero);
 shell.append(mapFragments());
 shell.append(relicArchive(journeyView(previewSample),true));
 // Needs-first design: show the visitor's expressed gain and concern before offering any "three powers".
 const mirror=sectionClass("motivation-mirror");
 append(mirror,node("p","result-kicker","君が答えたことから見えてきた"),
   node("h2","","地図に刻まれた、君の未来"),
   append(node("div","aha-card"),node("small","","✦ 今回、いちばん考えてみたいこと"),node("strong","",motivation.aha.question)));
 const gain=sectionClass("gain-card");
 append(gain,node("span","motivation-head","✦ 叶えたい未来"),node("strong","",motivation.goal.label),
   paragraph(motivation.goal.horizon+"を目安に考える","motivation-context"));
 mirror.append(gain);
 const pain=sectionClass("pain-card");
 append(pain,node("span","motivation-head",motivation.pain.selfReported?"⚑ 君が選んだ気がかり":"◇ 今の気がかり"),
   node("strong","",motivation.pain.label));
 if(motivation.pain.selfReported)append(pain,paragraph("確認せずに進むと？","motivation-context"),
   paragraph(motivation.pain.conditionalRisk,"motivation-body"));
 else pain.append(paragraph("不安をつくって行動させる必要はないよ。","motivation-body"));
 mirror.append(pain);
 append(mirror,heroCopy(motivation.pain.selfReported
   ?"「困るかもしれないこと」と「叶えたいこと」、両方が見えたね。次は、その差を整理してみよう。"
   :"心配がなくてもいいんだ。これから選べる未来を、一緒に増やしていこう。",REWARD));
 shell.append(mirror);
 const report=node("div","result-scroll");
 append(report,node("p","result-kicker","発見した未来のルート"),node("h2","",evaluated.insight.title),
  append(node("div","question-reveal"),node("small","","次に確かめたい問い"),paragraph(evaluated.insight.question)),
  paragraph(evaluated.insight.why,"result-why"),
  append(node("div","step-reward"),node("span","","今日できる一歩"),node("strong","",evaluated.insight.action)));
 shell.append(report);
 const life=sectionClass("benefit-bridge");
 append(life,node("p","result-kicker","だから、あなたに何がいい？"),node("h2","","手段の話より、暮らしの話をしよう"));
 const detail=node("div","benefit-steps");
 append(detail,
   append(node("div","benefit-step"),node("small","","知ること・比べること"),node("strong","",motivation.benefit.feature)),
   append(node("div","benefit-step"),node("small","","だから、何が変わる？"),node("strong","",motivation.benefit.therefore)),
   append(node("div","benefit-step final"),node("small","","だから、暮らしには？"),node("strong","",motivation.benefit.life)));
 life.append(detail);
 life.append(paragraph(motivation.timing,"motivation-note"));
 const gap=node("div","gap-slot");
 append(gap,node("strong","","まだ数字で分かっていないこと"),
   paragraph("叶えたい未来 → 必要額 → 現在地 → ギャップ → 手段","gap-equation"),
   paragraph(motivation.gap.reason,"gap-reason"));
 life.append(gap);
 life.append(heroCopy("この地図、まだ途中だね。必要なお金と今の状況が分かれば、どんな道があるか一緒に比べられるよ。",SCROLL));
 shell.append(life);
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
 append(nextStage,node("p","result-kicker","地図を完成させる次のクエスト"),node("h2","","残りの地図は、何から埋める？"),paragraph("叶えたい未来は見えた。次は必要な金額と今の状態を確かめて、方法を比べる段階。気になる選択肢は自分で選ぼう。"));
 const labels=Object.fromEntries(topics.map(a=>[a[0],a[1]]));
 const entries2=evaluated.topicIds;
 if(entries2.length===0)nextStage.append(paragraph("今日は作戦書を手に入れて、ここで冒険を終えるのもOK。","mission-topic"));
 else for(const t of entries2)nextStage.append(idea("✦",labels[t]||t));
 const action=btn(evaluated.primaryAction.label+"  →","gold-cta",()=>openAction(evaluated));
 const consult=btn("地図の未解放部分を、数字で整理する方法を見る","alt-cta",()=>openAction({primaryAction:{kind:"consult_interest"},topicIds:[]}));
 nextStage.append(action);
 if(evaluated.primaryAction.kind!=="consult_interest")nextStage.append(consult);
 const panel=node("div","action-panel");panel.id="action-panel";panel.hidden=true;nextStage.append(panel);
 nextStage.append(paragraph("この体験版では、提携先への紹介・予約・情報送信は行わないよ。","caution"));
 shell.append(nextStage);
 const shareBox=sectionClass("share-quest");
 append(shareBox,node("p","result-kicker","冒険を広げる"),node("h2","","未来の地図・第一片を獲得！"),
   paragraph("金額や気がかりは共有しない。冒険の記録だけ、希望する人がシェアできる。"));
 const shareText=node("p","share-confirm");shareText.id="share-confirm";shareText.setAttribute("aria-live","polite");
 shareBox.append(btn("冒険クリアの文章をコピー","alt-cta",async()=>{
   try{await navigator.clipboard.writeText(motivation.copy);shareText.textContent="コピーしたよ。投稿するかは自分で決めてね。";}
   catch{shareText.textContent="コピーできなかったよ。必要なら文章を選んでね。";const fallback=node("p","share-fallback",motivation.copy);shareBox.append(fallback);}
 }));
 shareBox.append(shareText);shell.append(shareBox);
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
 else if(action.kind==="consult_interest"){append(panel,node("strong","","数字にできれば、選ぶ理由が見えてくる"),paragraph("叶えたい未来 → 必要額 → 今の家計と資産・負債 → 足りない部分 → 具体的な手段。この順番で自分の設計図を整理できるよ。商品を選ぶのはその後でいい。"),paragraph("このデモでは必要額や差額は未計算。相談予約・LINE・提携先には接続していないよ。"));}
 else{append(panel,node("strong","","まずは仕組みと条件を知ろう"),paragraph("費用・リスク・必要な時間・申込条件を確認してから選ぶことが大事。ここでは商品や紹介先の自動推薦はしないよ。"));}
 panel.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"});
}
function render(){
 $.replaceChildren(screen==="intro"?areaIntro():screen==="quest"?questionScreen():resultScreen());
 document.title=screen==="intro"?"第3章｜未来の大陸 · ムダギリ診断":screen==="quest"?"QUEST "+String(step+1)+"｜未来の大陸":"作戦書を獲得｜第3章";
}
render();

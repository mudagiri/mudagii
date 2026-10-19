import {GOALS,HORIZONS,PREPARATIONS,OBSTACLES,PRIORITIES,buildDiscovery,validateAnswers} from "./engine.mjs";

/** CH3 V1.6 isolated experience. No Chapter 1/2 imports, storage, analytics, GAS or external referrals. */
const root=document.getElementById("chapter3-stage");
const ASSETS="../../assets/";
const IMG={
 guide:ASSETS+"mudagiri/poses/v1/MUDAGIRI_POSE_03_GUIDE.webp",
 reward:ASSETS+"mudagiri/poses/v1/MUDAGIRI_POSE_23_RESULT.webp",
 check:ASSETS+"mudagiri/poses/v1/MUDAGIRI_POSE_20_CHECK.webp",
 bg:ASSETS+"mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp",
 hall:ASSETS+"mudagiri/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp"
};
const QUESTIONS=[
 {key:"goal",label:"叶えたい未来",tag:"QUEST 01 · 未来の願い",title:"お金を理由に、諦めたくないことは？",sub:"正解はないよ。これからの暮らしで、いちばん近いものを選んでね。",talk:"欲しいのは、お金そのものじゃなくて、その先の暮らしかもしれないね。",map:GOALS,glyphs:["☀","✦","⌛","⌂","✧","？"]},
 {key:"horizon",label:"叶えたい時期",tag:"QUEST 02 · 未来への距離",title:"その未来、いつ頃に叶えたい？",sub:"まだ決まっていなければ「時期はまだ未定」で大丈夫。",talk:"同じ目標でも、必要になる時期で準備の仕方は変わるんだ。",map:HORIZONS,glyphs:["◴","◷","∞","？"]},
 {key:"preparation",label:"今の準備",tag:"QUEST 03 · いまの位置",title:"その未来に向けて、今どのあたり？",sub:"できている・できていないの優劣はないよ。",talk:"今の立ち位置が分かれば、最初の一歩を選びやすい。",map:PREPARATIONS,glyphs:["✓","◇","◈","？"]},
 {key:"obstacle",label:"立ちはだかる霧",tag:"QUEST 04 · 行く手の霧",title:"未来に進むのを、一番止めているのは？",sub:"困っていないなら「特に困っていない」を選んでね。",talk:"無理に不安を探さなくていい。気になることだけで作戦を考えよう。",map:OBSTACLES,glyphs:["◈","◇","？","⚑","⌛","✧","—"]},
 {key:"priority",label:"守りたいもの",tag:"QUEST 05 · 冒険の約束",title:"未来のためにも、今これだけは守りたいのは？",sub:"未来を叶える途中で、大切にしたいことを一つ。",talk:"増やすために好きな暮らしを全部削ったら、何のための冒険か分からないもんね。",map:PRIORITIES,glyphs:["♡","✿","◈","✦","↗"]}
];
const newAnswers=()=>({goal:null,horizon:null,preparation:null,obstacle:null,priority:null});
let answers=newAnswers(),screen="intro",step=0,disclosure=false,planOpen=false,copyMessage="",assetFailure=false;
function el(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function add(e,...children){children.filter(Boolean).forEach(x=>e.appendChild(x));return e;}
function button(title,className,action){const e=el("button",className,title);e.type="button";e.addEventListener("click",action);return e;}
function p(text,className){return el("p",className,text);}
function image(src,alt,className){const e=el("img",className);e.src=src;e.alt=alt;e.loading="eager";e.addEventListener("error",()=>{assetFailure=true;e.style.display="none";});return e;}
function top(){window.scrollTo({top:0,behavior:"instant"});}
function head(){const out=el("div","chapter-header");add(out,el("span","chapter-progress-title","CHAPTER Ⅰ  冒険者"),el("span","chapter-progress-dot","›"),el("span","chapter-progress-title","CHAPTER Ⅱ  家計"),el("span","chapter-progress-dot","›"),el("span","chapter-progress-title current","CHAPTER Ⅲ  未来"));return out;}
function shell(){return add(el("div","stage-shell"),el("div","pilot-note","第3章V1.6 · 独立プレビュー ／ 個人情報の保存・送信なし"),head());}
function dialogue(text,pose){const row=el("div","dialogue");add(row,image(pose||IMG.guide,"ムダギリくん","guide-image"),add(el("div","dialogue-bubble"),el("span","dialogue-name","ムダギリくん"),p(text)));return row;}
function setStage(next){screen=next;render();top();}
function renderIntro(){
 const wrap=shell();
 const hero=el("section","intro-hero");hero.style.setProperty("--scene","url('"+IMG.bg+"')");
 add(hero,p("✦ NEW AREA UNLOCKED ✦","rune-over"),el("div","chapter-mark","CHAPTER III"),el("h1","intro-title","未来の大陸"),p("お金を守った、その先へ。","intro-sub"));
 const pillars=el("div","stage-pillars");
 for(const v of [["Ⅰ","自分を知る"],["Ⅱ","家計を知る"],["Ⅲ","未来を選ぶ"]])add(pillars,add(el("div","stage-pillar"),el("strong","",v[0]),el("span","",v[1])));
 hero.append(pillars);
 const portal=add(el("div","portal"),el("span","portal-rune","✧"));hero.append(portal);
 hero.append(dialogue("第1章で自分の戦い方、第2章で家計の戦果を知った。次は、そのお金でどんな未来をつくりたい？"));
 const introReward=add(el("div","intro-promise"),el("span","small-kicker","この章で手に入るもの"),el("h2","","自分の未来を動かす「最初の一手」"),p("5つの問いに答えると、叶えたい未来・今の障害・守りたいものをもとに、次に確かめたいことが見つかる。"));
 hero.append(introReward);
 hero.append(button("未来の霧を晴らす  →","gold-button",()=>{step=0;setStage("questions");}));
 wrap.append(hero);
 const note=add(el("section","continuity"),el("h2","","前の冒険から、次の冒険へ"),p("JOB・STYLEと家計の結果は現在未連携。これは第3章だけを確認するプレビューで、架空の資産額・改善額は出さない。"));
 wrap.append(note);return wrap;
}
function renderProgress(){
 const box=el("div","quest-progress");add(box,add(el("div","progress-caption"),el("span","",QUESTIONS[step].label),el("strong","",String(step+1)+" / 5")));
 const markers=el("div","progress-pips");QUESTIONS.forEach((q,i)=>markers.append(el("span",i<step?"passed":i===step?"active":"",i<step?"✓":String(i+1))));box.append(markers);return box;
}
function renderQuestion(){
 const wrap=shell();wrap.append(renderProgress());
 const q=QUESTIONS[step];const hero=el("section","question-scene");hero.style.setProperty("--scene","url('"+IMG.hall+"')");
 add(hero,p(q.tag,"question-kicker"),el("h1","question-title",q.title),p(q.sub,"question-sub"),dialogue(q.talk,step===2?IMG.check:IMG.guide));
 const choices=el("div","choice-list");
 Object.entries(q.map).forEach(([key,desc],i)=>{
  const label=typeof desc==="string"?desc:desc.label;
  const selected=answers[q.key]===key;
  const entry=button("","answer-choice"+(selected?" selected":""),()=>{answers[q.key]=key;render();});
  entry.setAttribute("aria-pressed",String(selected));
  add(entry,el("span","choice-glyph",q.glyphs[i]||"✧"),el("span","choice-label",label),el("span","choice-check",selected?"✓":"›"));choices.append(entry);
 });
 hero.append(choices);
 const nav=el("div","question-actions");const next=button(step===4?"未来の地図をひらく  ✦":"次の霧を晴らす  →","gold-button",()=>{if(!answers[q.key])return;if(step<4){step+=1;render();top();}else{const v=validateAnswers(answers);if(v.ok)setStage("result");}});
 next.disabled=!answers[q.key];nav.append(next);
 nav.append(button(step===0?"← 冒険の入口に戻る":"← 前の質問に戻る","back-button",()=>{if(step===0)setStage("intro");else{step-=1;render();top();}}));
 hero.append(nav);wrap.append(hero);return wrap;
}
function mapTile(n,title,filled){return add(el("div","map-tile "+(filled?"unlocked":"locked")),el("span","map-n",String(n)),el("strong","",title),el("small","",filled?"手に入れた！":"次の冒険で確認"));}
function renderResult(){
 const info=buildDiscovery(answers);
 if(!info.ok){step=0;return renderQuestion();}
 const wrap=shell();
 const hero=el("section","result-hero");hero.style.setProperty("--scene","url('"+IMG.bg+"')");
 add(hero,p("✦ QUEST CLEAR! ✦","rune-over"),el("div","chapter-mark","FUTURE DISCOVERED"),el("h1","result-title","君の未来を動かす、最初の一手が見つかった。"));
 const emblem=add(el("div","reward-emblem"),el("span","",info.crest));hero.append(emblem);
 add(hero,p("獲得した未来の称号","reward-label"),el("h2","route-name",info.routeTitle));
 hero.append(dialogue("未来の霧が少し晴れたね。大事なのは、誰かの正解じゃなく、君が守りたい暮らしだよ！",IMG.reward));
 wrap.append(hero);
 const aha=el("section","main-discovery");
 add(aha,p("✦ 今回の発見","discovery-kicker"),el("h2","","まず知ってほしいこと"),p(info.headline,"aha-lead"));
 const mirror=el("div","reflection-pair");
 add(mirror,add(el("div","reflection-main"),el("small","","叶えたい未来"),el("strong","",info.goal),p(info.horizon+"を目安に考えたい")),add(el("div","reflection-main"),el("small","","いちばん守りたいもの"),el("strong","",info.priority),p("未来を叶える途中でも、大切にしたい")));
 aha.append(mirror);
 const bridge=el("div","reflection-tension");add(bridge,el("small","","回答をつなぐと…"),p("今は「"+info.preparation+"」。"+(["none","skip"].includes(answers.obstacle)?"気がかりは「"+info.obstacle+"」。":"そこで引っかかっているのが「"+info.obstacle+"」。")+"\n"+info.priorityClause+"、"+info.dream+"を目指したい。"));aha.append(bridge);
 aha.append(p("この発見は回答から考えられる仮説。性格や資産の適性を断定するものではない。","factual-note"));
 aha.append(button("僕の「最初の一手」を見る  →","gold-button",()=>{document.getElementById("first-step").scrollIntoView({behavior:"smooth",block:"start"});}));
 wrap.append(aha);
 const stepBox=el("section","first-step");stepBox.id="first-step";
 add(stepBox,p("NEXT QUEST · 今日からできる","small-kicker"),el("h2","","だから、最初にやることはこれ。"),p(info.action,"first-action"),p("これを先に確かめる理由："+info.why,"first-why"));
 stepBox.append(dialogue("いきなり商品を選ぶ必要はないよ。次に知りたいことが分かれば、動き方も変わる。",IMG.check));
 wrap.append(stepBox);
 const reward=el("section","map-section");add(reward,p("MAP FRAGMENT 01 / 03","small-kicker"),el("h2","","未来の地図・第一片を獲得！"));
 const grid=el("div","map-grid");grid.append(mapTile(1,"望む未来と最初の一手",true),mapTile(2,"必要な金額と期限",false),mapTile(3,"現在地と不足分",false));reward.append(grid);
 reward.append(p("未解放の数字は推計していない。第2章の見直し候補は、確定した余剰資金として扱わない。","map-note"));wrap.append(reward);
 const move=el("section","next-mission");add(move,p("地図の先を知る","small-kicker"),el("h2","","次に知りたいのは、どの数字？"),p("目標から順に数字を確かめれば、「何となく不安」から「何をすればいいか」へ進める。"));
 const action=button("未来の地図の続きを見る  →","gold-button",()=>{planOpen=!planOpen;render();document.getElementById("next-mission").scrollIntoView({behavior:"smooth",block:"start"});});
 move.id="next-mission";move.append(action);
 if(planOpen){
  const panel=el("div","planning-panel");
  const steps=[["01","未来の条件",info.firstCheck],["02","手元の現在地","貯蓄・負債・生活費と、すでに確定した改善を確認する"],["03","必要な差と選択肢","必要額から準備済み資金を整理し、方法を比べる（未計算）"]];
  for(const [n,title,detail] of steps)add(panel,add(el("div","planning-row"),el("span","planning-n",n),add(el("div",""),el("strong","",title),p(detail))));
  panel.append(p("この画面では金額・融資可否・商品の適否は計算しない。実際の数字は本人の確認が必要。","factual-note"));
  const cv=add(el("div","consult-value"),el("strong","","ライフプラン相談で整理できること"),p("目標・期限・手元資金・毎月の収支を一枚にして、足りない条件と選択肢を比較する。商品選びより先に、自分の判断基準を持つための時間。"));
  panel.append(cv);panel.append(p("現在は独立プレビュー。予約・LINE追加・情報送信は未接続。","factual-note"));move.append(panel);
 }
 wrap.append(move);
 const evidence=el("details","why-details");evidence.open=disclosure;evidence.addEventListener("toggle",()=>{disclosure=evidence.open;});
 add(evidence,el("summary","","判断の根拠を詳しく見る"),p(info.premise),p(info.synthesis),p(info.disclaimer),p("第1章JOB・STYLE／第2章12カテゴリとの実データ連携はまだない。表示しているのは第3章の回答だけ。"));
 wrap.append(evidence);
 const share=el("section","share-panel");add(share,p("SHARE · 冒険の記録","small-kicker"),el("h2","","この称号、誰かにも見せたい？"),p("金額や気がかりは入れず、称号と冒険の記録だけを共有できる。"));
 share.append(button("称号の文章をコピー","outline-button",async()=>{try{await navigator.clipboard.writeText(info.shareText);copyMessage="コピーしたよ。投稿するかは君が決めてね。";}catch{copyMessage="コピーできなかったよ。必要なら下の文章を選んでね。";}render();document.getElementById("share-message").scrollIntoView({block:"nearest"});}));
 share.append(p(copyMessage,"copy-message"));share.querySelector(".copy-message").id="share-message";
 if(copyMessage.includes("できなかった"))share.append(p(info.shareText,"fallback-share"));
 wrap.append(share);
 wrap.append(button("もう一度、未来を探索する","back-button retry",()=>{answers=newAnswers();step=0;planOpen=false;copyMessage="";disclosure=false;setStage("intro");}));
 return wrap;
}
function render(){
 root.replaceChildren(screen==="intro"?renderIntro():screen==="questions"?renderQuestion():renderResult());
 document.title=screen==="result"?"未来の発見｜ムダギリ診断 第3章":screen==="questions"?"QUEST "+(step+1)+"｜ムダギリ診断 第3章":"第3章｜未来の大陸 V1.6 · ムダギリ診断";
}
render();
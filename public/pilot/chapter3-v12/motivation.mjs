/**
 * Chapter 3 V1.3 self-discovery bridge
 * Content source: user-provided sales psychology training (pain/gain, question depth),
 * benefit-based dialogue notes, 『売れる組織 売れる営業』 needs-first approach,
 * and 『家庭の金銭学』 planning sequence.
 * No PII, goal amount, repayment capacity, or investment suitability inferred.
 */
const GOALS={
 stability:{wish:"毎月の暮らしに、選べる余裕を持ちたい",benefit:"急な支出があっても、大事な予定をどう守るか落ち着いて考えられる",first:"毎月どれだけ残せるかを知る"},
 future:{wish:"将来のお金を、漠然とした不安のままにしたくない",benefit:"先のことを必要以上に心配せず、今の暮らしも大切にできる",first:"いつ、何にいくら必要かを整理する"},
 retirement:{wish:"老後も、自分の暮らし方を選びたい",benefit:"仕事を続けるか・どんな暮らしをするかを、選択肢として考えられる",first:"何歳からどの程度の生活費が必要か確認する"},
 family:{wish:"家や家族の予定を、お金だけで諦めたくない",benefit:"住宅や教育など、大事な時期に必要な支出を優先しやすくなる",first:"近い家族の予定と必要時期を整理する"},
 freedom:{wish:"お金の事情に縛られず、自分で選ぶ時間を増やしたい",benefit:"働き方や挑戦したいことを、金銭面から比較して選びやすくなる",first:"理想の時間の使い方と収入条件を言葉にする"},
 undecided:{wish:"まだ決めていない。だからこそ、選択肢を知りたい",benefit:"焦って一つの商品や方法を選ばずに、必要になったときに考えられる",first:"近い予定と、使い道が決まっていないお金を分ける"}
};
const CONCERNS={
 living:{reported:true,label:"生活費に余裕がない",cost:"家計にどれだけ余力があるか分からないまま方法を増やすと、続ける負担が大きくなるかもしれない",discovery:"まず生活費と手元に残せる金額を確かめる"},
 debt:{reported:true,label:"返済の負担が気になる",cost:"返済条件や手元資金を確認せずに借入や運用を増やすと、家計の選択肢が狭まることがある",discovery:"毎月の返済と必要な現金を先に並べる"},
 dontKnow:{reported:true,label:"何から始めればいいか分からない",cost:"目的が曖昧なまま商品を先に選ぶと、自分に必要な方法を比較しにくくなる",discovery:"目的・期限・手元資金の順で現在地をつかむ"},
 loss:{reported:true,label:"損するのが不安",cost:"仕組みや値動きを知らずに選ぶと、想定外の変動に慌ててしまう可能性がある",discovery:"使う時期と、許容できる変動を分けて考える"},
 busy:{reported:true,label:"考える時間が取れない",cost:"忙しいまま判断を先延ばしにすると、必要な準備の期限を見失うことがある",discovery:"最初に確認することを一つだけ決める"},
 none:{reported:false,label:"今、困っていることは特にない",cost:null,discovery:"困りごとを無理に探さず、叶えたい未来から考えていい"},
 skip:{reported:false,label:"気がかりは未回答",cost:null,discovery:"話したくないことは話さず、今できる確認から始めよう"}
};
const MEANS={
 investBasics:{feature:"積立・運用の違いを知る",what:"使う時期に合わせて、現金で残すものと運用を検討するものを分けて考えられる"},
 propertyLearning:{feature:"不動産・借入の費用とリスクを知る",what:"借りられるかどうかではなく、返済・空室・金利が変わっても続けられるかを比較できる"},
 sideWork:{feature:"副業の条件を比べる",what:"使える時間と収入の安定性を照らして、自分の生活に合う候補を絞れる"},
 career:{feature:"転職・キャリアの条件を比べる",what:"今の待遇だけでなく、将来の収入・働き方・負担も並べて考えられる"},
 skills:{feature:"スキル習得の時間と費用を調べる",what:"学びが必要な仕事や収入につながるか、先に確認できる"},
 insurance:{feature:"公的保障と民間保障の役割を知る",what:"すでに備わっている保障と、自分で対策する必要がある部分を切り分けられる"},
 budget:{feature:"家計の出入りを確かめる",what:"今の暮らしを維持しながら、見直しても困らない支出を見つけやすくなる"},
 consult:{feature:"目標・家計・手段を一枚に整理する",what:"自分に必要な条件と未確認の点を見える形にして、選ぶかどうかを判断しやすくなる"},
 resultOnly:{feature:"今は作戦書だけ受け取る",what:"まだ決めずに、考えたいときに必要な問いを持ち帰れる"}
};
const HORIZONS={under3:"3年以内",threeTo10:"3〜10年",over10:"10年以上先",unknown:"未定"};
function safeLookup(table,key,defaultKey){return table[key]??table[defaultKey];}
export function buildChapter3Motivation(answers){
 if(!answers||typeof answers!=="object")throw new Error("Missing Chapter 3 answers");
 const goal=safeLookup(GOALS,answers.goal,"undecided");
 const concern=safeLookup(CONCERNS,answers.concern,"skip");
 const topic=(Array.isArray(answers.topics)?answers.topics:[]).find(x=>Object.hasOwn(MEANS,x))??"resultOnly";
 const means=MEANS[topic];
 const horizon=HORIZONS[answers.horizon]??"未定";
 const urgency=answers.horizon==="under3"
  ?"使う時期が近いなら、値動きのある方法を先に決めず、必要な現金を確認しよう。"
  :answers.horizon==="unknown"
    ?"期限が未定だからこそ、今すぐ商品を決めなくてもいい。"
    :"目標までの時間があるなら、無理なく続けられる条件を考える余地がある。";
 return {
  version:"CH3_MOTIVATION_V1_3",
  goal:{label:goal.wish,horizon},
  pain:{selfReported:concern.reported,label:concern.label,conditionalRisk:concern.cost,firstCheck:concern.discovery},
  gain:{lifeChange:goal.benefit},
  benefit:{feature:means.feature,therefore:means.what,life:goal.benefit},
  timing:urgency,
  gap:{goalAmountJPY:null,currentAssetsJPY:null,verifiedDifferenceJPY:null,reason:"必要額と現在の資産・負債は、この5問ではまだ確認していないため算出できません。"},
  consent:{shareNeedsUserAction:true,referralNeedsExplicitConsent:true},
  copy:"第3章「未来の大陸」をクリア！ 次の冒険は、未来の自分と向き合うこと。 #ムダギリ診断"
 };
}

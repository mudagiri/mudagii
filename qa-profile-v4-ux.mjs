import fs from 'node:fs';
const scene=fs.readFileSync('./ProfileV4Scene.tsx','utf8');
const profile=fs.readFileSync('./mudagiri-profile-v4.ts','utf8');

const checks=[
 ['no partner question in PROFILE UI',!scene.includes('パートナー・配偶者')],
 ['no wallet-sharing question in PROFILE UI',!scene.includes('家賃や生活費、どう払ってる？')],
 ['no expense-sharing step',!profile.includes("|'expenseSharing'|")&&!profile.includes("steps.push('expenseSharing')")],
 ['multi household uses one composition step',profile.includes("steps.push('composition')")],
 ['personal composition has neither option',scene.includes('どちらもない')],
 ['parent/family special case preserved',scene.includes('親・家族と同居')&&profile.includes("relationships.includes('parents')")],
 ['child branch preserved',scene.includes('子どもと暮らしてる')&&profile.includes("steps.push('childCount')")],
 ['single profile stays six decisions',profile.includes("const steps:ProfileStepV4[]=['scope','householdSize']")],
 ['expense sharing retained only as compatibility field',profile.includes('expenseSharing:ExpenseSharingV4')&&profile.includes('expenseSharing:null')],
];
for(const [name,ok] of checks){if(!ok)throw new Error('PROFILE_V4_UX_QA_FAIL:'+name);console.log('PASS',name)}
console.log('PROFILE_V4_UX_QA_PASS',checks.length);

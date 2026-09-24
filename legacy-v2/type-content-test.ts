import { TYPE_CONTENT } from './type-content-v2';
const codes=['FPAS','FPAE','FPUS','FPUE','FIAS','FIAE','FIUS','FIUE','VPAS','VPAE','VPUS','VPUE','VIAS','VIAE','VIUS','VIUE'];
let assertions=0;
for(const code of codes){
 const x=(TYPE_CONTENT as any)[code];
 if(!x) throw new Error(`missing ${code}`); assertions++;
 for(const k of ['title','catchphrase','summary','mudagiriAdvice','shareText']){if(!x[k]?.trim()) throw new Error(`${code}.${k} empty`); assertions++;}
 if(x.strengths.length!==2||x.traps.length!==2) throw new Error(`${code} list length`); assertions+=2;
 if(/必ず|絶対|確実/.test(x.summary+x.mudagiriAdvice)) throw new Error(`${code} overclaim`); assertions++;
}
if(new Set(codes.map(c=>(TYPE_CONTENT as any)[c].title)).size!==16) throw new Error('duplicate title'); assertions++;
console.log(`TYPE CONTENT PASS: 16/16 types, ${assertions} assertions`);

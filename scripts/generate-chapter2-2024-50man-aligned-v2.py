#!/usr/bin/env python3
"""Generate *direct official* 2024 50万円 joint cells from SHA-confirmed originals.

This is a reproducible generator for a PROVENANCE TABLE, not an income model.
Run after extract-chapter2-official-peer-original-2024.py. Do not use a previous
TS source to generate a new source: that hid a one-50万円 bracket misalignment.
"""
import argparse,json
from pathlib import Path
ITEMS=[
 ("food","210101_食料"),
 ("energy","210103_光熱・水道"),
 ("daily","21010404_家事雑貨"),
 ("daily","21010405_家事用消耗品"),
 ("mobile","21010703_通信"),
 ("car","21010702_自動車等関係費"),
 ("car","210107023_自動車等維持"),
 ("fun","210109_教養娯楽"),
 ("fun","21011003_交際費"),
 ("beautyFashion","210105_被服及び履物"),
 ("beautyFashion","210110011_理美容サービス"),
 ("beautyFashion","210110012_理美容用品"),
 ("rent","21010201_家賃地代"),
 ("insurance","23000002_保険料"),
 ("childEducation","210108_教育"),
]
COLS=set('U V W X Y Z AA AB AC AD AE AF'.split())
EXPECTED_SHA={
 "multi":"0a73765d1cda9c6c2a0ba8238e2260ee595dfbdbbbb91b67aa1abb55adf82c45",
 "single":"62648369c8f550afb849575d34bb4a8ed3935c7b8d7dcc8f28bde7ecbdfe16a2",
}
def generate(data):
 source={s["household"]:s for s in data["sources"]}
 if set(source)!=set(EXPECTED_SHA):
  raise ValueError("Original source household population missing")
 out=[]
 for household,sha in EXPECTED_SHA.items():
  s=source[household]
  if s["verifiedSha256"]!=sha:raise ValueError("Source sha mismatch")
  if not s["rowsScanned"]>=20000:raise ValueError("Incomplete source extraction")
  for r in s["eligibleOriginalIncomeCells"]:
   age=r["age"]
   col=r["grossIncomeColumn"]
   label=r["publishedIncomeLabel"]
   if not age.endswith("（10歳階級2）") or col not in COLS:continue
   # Verify that the encoded column is the published 2024 CLASS LABEL.
   # Do not reuse the previously hand-typed income label!
   if s["officialIncomeHeaders"].get(col)!=label:
    raise ValueError("Official income header-to-data misalignment")
   if not label.split("_",1)[-1].endswith("万円"):
    raise ValueError("Unrecognized official bracket")
   if r["sampleNApprox"]<50 or r["averageMonthlyDisposableYen"]<=0:
    raise ValueError("Unverified official source cell")
   vals=[]
   for group,code in ITEMS:
    obj=r["referenceExpenseItems"].get(group,{}).get(code)
    vals.append(obj["averageMonthlyExpenseYen"] if obj is not None else None)
   if any(v is None for v in vals[:4]):
    raise ValueError("Core comparables missing from n>=50 row")
   out.append([household,age.split("_",1)[1],label.split("_",1)[1],
               r["sampleNApprox"],r["averageMonthlyDisposableYen"],*vals])
 def look(h,a,b):
  return next(r for r in out if r[0]==h and r[1]==a and r[2]==b)
 if look("multi","30～39（10歳階級2）","400～450万円")[5]!=67858:
  raise ValueError("Expected original 2024 30s 400～450 food 67858")
 if look("single","30～39（10歳階級2）","400～450万円")[5]!=40265:
  raise ValueError("Expected original 2024 single 30s 400～450 food 40265")
 if len([x for x in out if x[0]=="multi"])!=58:raise ValueError("Unexpected multi count")
 if len([x for x in out if x[0]=="single"])!=21:raise ValueError("Unexpected single count")
 lines=[
 "/**",
 " * Generated from 2024 Survey of Household Economy a010292/a010293",
 " * table 1-29-1 after ORIGINAL workbook SHA + column/header audit.",
 " * Original official 50万円 gross-income columns U..AF; n>=50; worker",
 " * households, head-of-household age 10-year age-class 2, national.",
 " * IMPORTANT: no modeled factors, no inferred income, no savings.",
 " * Parent and child related expense codes overlap; do not sum blindly.",
 " * src: https://www.e-stat.go.jp/dbview?sid=0004039867",
 " */",
 "export const OFFICIAL_2024_ORIGINAL_50MAN_SHA_V2="+json.dumps(EXPECTED_SHA,ensure_ascii=False,separators=(',',':'))+" as const;",
 "export const OFFICIAL_2024_ORIGINAL_50MAN_CODES_V2="+json.dumps([x[1] for x in ITEMS],ensure_ascii=False,separators=(',',':'))+" as const;",
 "/** [household,headAgeClass,rawPublishedGrossClass,n,meanMonthlyDisposable,",
 " * food,energy,housewares,consumables,communication,carTotal,carMaintenance,",
 " * recreation,social,clothing,beautyService,beautyGoods,rent,insurance,education]",
 " */",
 "export const OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2=[",
 ]
 for row in out:
  lines.append(" "+json.dumps(row,ensure_ascii=False,separators=(',',':'))+",")
 lines.append("] as const;")
 lines.append("export const OFFICIAL_2024_50MAN_SOURCE_SCOPE_V2={year:2024,table:'1-29-1',"
              "incomeClass:'original 50万円 intervals',age:'household head',"
              "status:'worker',household:'single or two-or-more',minimumSample:50,"
              "notDiagnosisCategoryAverage:true,savingsAllowed:false} as const;")
 return "\n".join(lines)+"\n",len(out)
if __name__=="__main__":
 a=argparse.ArgumentParser()
 a.add_argument("source");a.add_argument("output");args=a.parse_args()
 d=json.loads(Path(args.source).read_text(encoding="utf8"))
 output,n=generate(d)
 Path(args.output).write_text(output,encoding="utf8")
 print("OFFICIAL_2024_ALIGNED_50MAN_TS_GENERATED",n,len(output))

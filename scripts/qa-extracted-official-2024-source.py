#!/usr/bin/env python3
"""Check verified-original values and mapping boundaries; no app render."""
import json,sys
from pathlib import Path

data=json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
sources={x["household"]:x for x in data["sources"]}
assert len(sources)==2
for household,source in sources.items():
    assert source["verifiedSha256"] and len(source["verifiedSha256"])==64
    assert source["rowsScanned"]>=20000
    assert source["rateProductionApproved"] is False
    assert source["notOfficialDiagnosisAverage"] is True
    assert source["eligibleOriginalIncomeCellsCount"]>0
    codes=source["matchedOfficialItemCodes"]
    assert len(codes)==11, (household,codes)
    for category in ("food","energy","daily","mobile","car","fun",
                     "beautyFashion","rent","insurance","childEducation","denominator"):
        assert category in codes, (household,category)
    assert "sub" not in codes and "selfDevelopment" not in codes
    for cell in source["eligibleOriginalIncomeCells"]:
        assert cell["sampleNApprox"]>=50
        assert cell["averageMonthlyDisposableYen"]>0
        assert cell["notEquivalentToDiagnosisCategory"]
        assert cell["mustNotEnterSavingOrReviewUpper"]
        for group in cell["referenceExpenseItems"].values():
            for item in group.values():
                assert item["averageMonthlyExpenseYen"]>=0
                assert item["officialRelatedItemRatePct"]>=0
                assert item["originalSheetRow"]>0

def one(h,age,col):
    return next(c for c in sources[h]["eligibleOriginalIncomeCells"]
                if f"{age}～" in c["age"] and c["grossIncomeColumn"]==col)
hi=one("multi","40","BD")
assert hi["sampleNApprox"]==200
assert hi["averageMonthlyDisposableYen"]==965121
assert hi["referenceExpenseItems"]["food"]["210101_食料"]["averageMonthlyExpenseYen"]==132463
assert hi["referenceExpenseItems"]["food"]["210101_食料"]["officialRelatedItemRatePct"]==13.73
assert hi["referenceExpenseItems"]["energy"]["210103_光熱・水道"]["averageMonthlyExpenseYen"]==25508
assert hi["referenceExpenseItems"]["mobile"]["21010703_通信"]["averageMonthlyExpenseYen"]==15948
assert hi["referenceExpenseItems"]["car"]["210107023_自動車等維持"]["averageMonthlyExpenseYen"]==22970
assert hi["referenceExpenseItems"]["insurance"]["23000002_保険料"]["averageMonthlyExpenseYen"]==32191
assert hi["referenceExpenseItems"]["childEducation"]["210108_教育"]["averageMonthlyExpenseYen"]==44405
mid=one("multi","40","BB")
assert mid["sampleNApprox"]==670
assert mid["averageMonthlyDisposableYen"]==579148
assert mid["referenceExpenseItems"]["food"]["210101_食料"]["averageMonthlyExpenseYen"]==105443
assert not any(c for c in sources["single"]["eligibleOriginalIncomeCells"]
               if "40～49" in c["age"] and c["grossIncomeColumn"] in ("BB","BC","BD")),\
       "Do not present low-n single high income as verified peer rate"
print("CHAPTER2_2024_ORIGINAL_VERIFIED_RELATED_ITEM_SCOPE_QA_PASS")
print("ELIGIBLE CELLS",{"multi":sources["multi"]["eligibleOriginalIncomeCellsCount"],
                        "single":sources["single"]["eligibleOriginalIncomeCellsCount"]})
print("OFFICIAL_40S_1500PLUS",json.dumps({
  "n":hi["sampleNApprox"],"disposable":hi["averageMonthlyDisposableYen"],
  "relatedItemRates":{name:{code:item["officialRelatedItemRatePct"] for code,item in group.items()}
   for name,group in hi["referenceExpenseItems"].items()},
},ensure_ascii=False))

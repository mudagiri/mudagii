#!/usr/bin/env python3
"""Read-only inspect 2024 official e-Stat table 1-29-1 original XLSX.

This is a SOURCE-VERIFICATION ONLY script. It does NOT produce application
reference rates and may not edit the FROZEN 12-category diagnosis engine.
Only stdlib zipfile/ElementTree is used. Never coerce X or '-' to zero.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
MAIN = "{" + NS + "}"
SHA = {
    "multi": "0a73765d1cda9c6c2a0ba8238e2260ee595dfbdbbbb91b67aa1abb55adf82c45",
    "single": "62648369c8f550afb849575d34bb4a8ed3935c7b8d7dcc8f28bde7ecbdfe16a2",
}
# Code labels confirmed in source audit, NOT presumed equivalent to diagnosis.
CODES = {
    "food": ["210101_食料"],
    "energy": ["210103_光熱・水道"],
    "daily": ["21010404_家事雑貨", "21010405_家事用消耗品"],
    "mobile": ["21010703_通信"],
    "car": ["21010702_自動車等関係費", "210107023_自動車等維持"],
    "fun": ["210109_教養娯楽", "21011003_交際費"],
    "beautyFashion": ["210105_被服及び履物", "210110011_理美容サービス",
                      "210110012_理美容用品"],
    "rent": ["21010201_家賃地代"],
    "insurance": ["23000002_保険料"],
    "childEducation": ["210108_教育"],
    "denominator": ["4_可処分所得"],
}

def shared_strings(zf):
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    shared = []
    with zf.open("xl/sharedStrings.xml") as src:
        tree = ET.iterparse(src, events=("start", "end"))
        root = None
        for event, node in tree:
            if root is None and event == "start":
                root = node
            if event == "end" and node.tag == MAIN + "si":
                shared.append("".join((t.text or "") for t in node.iter(MAIN + "t")))
                root.clear()
    return shared

def unpack_cell(cell, shared):
    typ = cell.attrib.get("t", "")
    value = cell.find(MAIN + "v")
    if typ == "inlineStr":
        content = cell.find(MAIN + "is")
        return "".join((t.text or "") for t in content.iter(MAIN + "t")) if content is not None else ""
    raw = value.text if value is not None and value.text is not None else ""
    if typ == "s":
        return shared[int(raw)] if raw and raw.isdigit() and int(raw) < len(shared) else ""
    return raw

def col_name(ref):
    return re.match(r"[A-Z]+", ref).group() if re.match(r"[A-Z]+", ref) else ""

def extract(path, household):
    actual = hashlib.sha256(Path(path).read_bytes()).hexdigest()
    if actual != SHA[household]:
        raise ValueError(f"Official original SHA mismatch {household}: {actual} != {SHA[household]}")
    with zipfile.ZipFile(path) as zf:
        shared = shared_strings(zf)
        sheet = next((x for x in zf.namelist() if re.fullmatch(r"xl/worksheets/sheet\d+\.xml",x)),None)
        if sheet is None:
            raise ValueError("Workbook worksheet XML not found")
        candidates = []
        seen_codes = {}
        header = []
        income_headers = {}
        scanned = 0
        with zf.open(sheet) as src:
            tree=ET.iterparse(src,events=("start","end"))
            root=None
            for event,node in tree:
                if root is None and event=="start":
                    root=node
                if event!="end" or node.tag!=MAIN+"row":
                    continue
                scanned += 1
                cells = {col_name(c.attrib.get("r","")):unpack_cell(c,shared)
                         for c in node.iter(MAIN+"c")}
                if scanned==7:
                    income_headers={k:v for k,v in cells.items() if v and k not in ("A","B","C","D","E","F","G","H","I","J","K","L")}
                if scanned<=22:
                    header.append({"row":node.attrib.get("r"),"fields":{k:v for k,v in cells.items() if k in ("A","E","F","G","H","I","J","K","L","M","BB","BC","BD")}})
                item = str(cells.get("K",""))
                if item:
                    for cat,labels in CODES.items():
                        if item in labels:seen_codes.setdefault(cat,set()).add(item)
                # Scope is a true simultaneous 2024 original table cell.
                work=str(cells.get("F",""))
                age=str(cells.get("H",""))
                mode=str(cells.get("I",""))
                target_ages=("30歳未満","30～39","40～49","50～59","60～69","70～79")
                expense_item=item in {x for labels in CODES.values() for x in labels}
                sample_row=(mode=="集計世帯数（概数）" and item=="0_総数")
                if (("勤労者世帯" in work or work.startswith("1_"))
                    and any(label in age for label in target_ages)
                    and age.endswith("（10歳階級2）")
                    and (expense_item or sample_row)):
                    all_income_columns={
                        c:v for c,v in cells.items()
                        if c and 13<=sum((ord(letter)-64)*26**i
                          for i,letter in enumerate(reversed(c)))<=56
                    }
                    candidates.append({
                        "sourceRow":node.attrib.get("r"),
                        "F_worker":work,"H_headAge":age,"I_measure":mode,
                        "K_item":item,"grossBands":all_income_columns,
                    })
                root.clear()
    # A published fee-cell ratio is a ratio of aggregate means, NOT
    # the mean of household spending ratios and NOT a diagnosis-category rate.
    # National average and other overlapping reprinted bands are kept
    # separate and never summed together.
    grouped={}
    for row in candidates:
        grouped.setdefault(row["H_headAge"],{})[row["K_item"]]=row
    sourced=[]
    for age,items in grouped.items():
        count=items.get("0_総数")
        income=items.get("4_可処分所得")
        if not count or not income:
            continue
        for col,label in income_headers.items():
            if not (label.startswith(("A","B","C","R")) or "万円" in label):
                continue
            raw_n=count["grossBands"].get(col)
            raw_d=income["grossBands"].get(col)
            if not (raw_n and raw_n.isdigit() and int(raw_n)>=50):
                continue
            if not (raw_d and raw_d.isdigit() and int(raw_d)>0):
                continue
            raw_rates={}
            for category,names in CODES.items():
                if category=="denominator":
                    continue
                by_item={}
                for code in names:
                    r=items.get(code)
                    if r is None:
                        continue
                    raw=r["grossBands"].get(col,"")
                    if raw and raw.isdigit():
                        value=int(raw)
                        by_item[code]={
                          "averageMonthlyExpenseYen":value,
                          "officialRelatedItemRatePct":round(value/int(raw_d)*100,2),
                          "originalSheetRow":int(r["sourceRow"]),
                        }
                if by_item:raw_rates[category]=by_item
            sourced.append({
                "age":age,"grossIncomeColumn":col,"publishedIncomeLabel":label,
                "sampleNApprox":int(raw_n),
                "averageMonthlyDisposableYen":int(raw_d),
                "referenceExpenseItems":raw_rates,
                "notEquivalentToDiagnosisCategory":True,
                "mustNotEnterSavingOrReviewUpper":True,
            })
    return {
        "sourceFile":Path(path).name,"household":household,
        "verifiedSha256":actual,"sheetXml":sheet,
        "rowsScanned":scanned,"sharedStrings":len(shared),
        "firstRows":header,"matchedOfficialItemCodes":{k:sorted(v) for k,v in seen_codes.items()},
        "candidateRowsCount":len(candidates),
        "candidateRows":candidates[:1000],
        "officialIncomeHeaders":income_headers,
        "eligibleOriginalIncomeCells":sourced,
        "eligibleOriginalIncomeCellsCount":len(sourced),
        "notOfficialDiagnosisAverage":True,
        "rateProductionApproved":False,
    }

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--multi",required=True)
    parser.add_argument("--single",required=False)
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    records=[extract(args.multi,"multi")]
    if args.single:records.append(extract(args.single,"single"))
    dest=Path(args.output);dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps({"sources":records},ensure_ascii=False,indent=2),encoding="utf-8")
    for rec in records:
        print("OFFICIAL_ORIGINAL_INSPECT",json.dumps({
          "household":rec["household"],"sha":rec["verifiedSha256"],
          "rowsScanned":rec["rowsScanned"],"codeHits":rec["matchedOfficialItemCodes"],
          "candidateRows":rec["candidateRowsCount"],
          "eligibleIncomeCells":rec["eligibleOriginalIncomeCellsCount"],
          "age40HigherIncomeCount":len([x for x in rec["eligibleOriginalIncomeCells"] if "40～49" in x["age"] and x["grossIncomeColumn"] in ("BB","BC","BD")]),
          "sample":rec["candidateRows"][:4],
          "firstRows":rec["firstRows"][:3]
        },ensure_ascii=False))

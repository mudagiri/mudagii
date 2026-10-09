import type {JobCode} from './classifierV1';
import {JOB_FREE_GUIDES} from './job-free-guide-v1';

export const LINE_URL=''; // Production official LINE URL is intentionally injected later.
export const LINE_HANDOFF_STORAGE='mudagiri_line_handoff_v1';

export type LineHandoff={version:'1';jobCode:JobCode;guideTitle:string;returnTo:'household';createdAt:string};

export function saveLineHandoff(jobCode:JobCode){
 const payload:LineHandoff={version:'1',jobCode,guideTitle:JOB_FREE_GUIDES[jobCode].title,returnTo:'household',createdAt:new Date().toISOString()};
 try{localStorage.setItem(LINE_HANDOFF_STORAGE,JSON.stringify(payload))}catch{}
 return payload;
}

export function openOfficialLine(jobCode:JobCode){
 saveLineHandoff(jobCode);
 if(!LINE_URL)return false;
 window.location.href=LINE_URL;
 return true;
}

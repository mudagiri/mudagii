import React from 'react';
import { createRoot } from 'react-dom/client';
import MudagiriAppV2 from '../MudagiriAppV2';
import MoneyPersonalityPilot from './features/money-personality/MoneyPersonalityPilot';
import MoneyPersonalityPublic from './features/money-personality/MoneyPersonalityPublic';
import MoneyPersonalityTelemetry from './features/money-personality/MoneyPersonalityTelemetry';
import MoneyPersonalityCognitivePilot from './features/money-personality/MoneyPersonalityCognitivePilot';
import {resolveMudagiriPublicEntryV1} from './features/money-personality/site-entry-route-v1';
import {readActiveResultV1,readJourneyDraftV1} from '../resume-state-v1';
import './style.css';
import '../chapter12-answercheck-card.css';

const params=new URLSearchParams(window.location.search);
// Resume pre-existing Chapter 2 sessions before changing the public first chapter.
let existingHouseholdJourney=false;
try{existingHouseholdJourney=Boolean(readActiveResultV1()||readJourneyDraftV1())}catch{}
const route=resolveMudagiriPublicEntryV1(window.location.pathname,window.location.search,existingHouseholdJourney);
const isMoneyPersonalityAdaptive=route==='adaptive';
const isMoneyPersonalityPilot=route==='legacy-pilot';
const isMoneyPersonalityCognitive=isMoneyPersonalityAdaptive&&params.get('cognitive')==='1';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isMoneyPersonalityAdaptive
      ?<><MoneyPersonalityPublic/><MoneyPersonalityTelemetry/>{isMoneyPersonalityCognitive&&<MoneyPersonalityCognitivePilot/>}</>
      :isMoneyPersonalityPilot
        ?<MoneyPersonalityPilot/>
        :<MudagiriAppV2 />}
  </React.StrictMode>,
);
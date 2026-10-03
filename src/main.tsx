import React from 'react';
import { createRoot } from 'react-dom/client';
import MudagiriAppV2 from '../MudagiriAppV2';
import MoneyPersonalityPilot from './features/money-personality/MoneyPersonalityPilot';
import MoneyPersonalityPublic from './features/money-personality/MoneyPersonalityPublic';
import MoneyPersonalityTelemetry from './features/money-personality/MoneyPersonalityTelemetry';
import MoneyPersonalityCognitivePilot from './features/money-personality/MoneyPersonalityCognitivePilot';
import './style.css';

const params=new URLSearchParams(window.location.search);
const cleanPath=window.location.pathname.replace(/\/+$/,'');
const isMoneyPersonalityAdaptive=
  cleanPath.endsWith('/pilot/money-type/adaptive')||
  params.get('adaptive')==='money-type'||
  params.get('mode')==='adaptive';
const isMoneyPersonalityPilot=
  !isMoneyPersonalityAdaptive&&(
    cleanPath.endsWith('/pilot/money-type')||
    params.get('pilot')==='money-type'
  );
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
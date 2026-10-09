import React from 'react';
import { createRoot } from 'react-dom/client';
import MudagiriAppV2 from '../MudagiriAppV2';
import MoneyPersonalityPilot from './features/money-personality/MoneyPersonalityPilot';
import MoneyPersonalityPublic from './features/money-personality/MoneyPersonalityPublic';
import MoneyPersonalityTelemetry from './features/money-personality/MoneyPersonalityTelemetry';
import MoneyPersonalityCognitivePilot from './features/money-personality/MoneyPersonalityCognitivePilot';
import {resolveMoneyPersonalityEntryRoute} from './features/money-personality/publicRouteV1';
import './style.css';

const params=new URLSearchParams(window.location.search);
const route=resolveMoneyPersonalityEntryRoute(window.location.pathname,window.location.search);
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
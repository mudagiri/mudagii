import React from 'react';
import { createRoot } from 'react-dom/client';
import MudagiriAppV2 from '../MudagiriAppV2';
import MoneyPersonalityPilot from './features/money-personality/MoneyPersonalityPilot';
import MoneyPersonalityAdaptive from './features/money-personality/MoneyPersonalityAdaptive';
import './style.css';

const params=new URLSearchParams(window.location.search);
const cleanPath=window.location.pathname.replace(/\/+$/,'');
const isMoneyPersonalityAdaptive=
  cleanPath.endsWith('/pilot/money-type/adaptive')||
  params.get('adaptive')==='money-type';
const isMoneyPersonalityPilot=
  !isMoneyPersonalityAdaptive&&(
    cleanPath.endsWith('/pilot/money-type')||
    params.get('pilot')==='money-type'
  );

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isMoneyPersonalityAdaptive?<MoneyPersonalityAdaptive/>:isMoneyPersonalityPilot?<MoneyPersonalityPilot/>:<MudagiriAppV2 />}
  </React.StrictMode>,
);

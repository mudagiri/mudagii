import React from 'react';
import { createRoot } from 'react-dom/client';
import MudagiriAppV2 from '../MudagiriAppV2';
import MoneyPersonalityPilot from './features/money-personality/MoneyPersonalityPilot';
import './style.css';

const params=new URLSearchParams(window.location.search);
const isMoneyPersonalityPilot=
  window.location.pathname.replace(/\/+$/,'').endsWith('/pilot/money-type')||
  params.get('pilot')==='money-type';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isMoneyPersonalityPilot?<MoneyPersonalityPilot/>:<MudagiriAppV2 />}
  </React.StrictMode>,
);

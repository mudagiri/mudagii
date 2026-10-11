import React from 'react';
import {createRoot} from 'react-dom/client';
import Chapter3RpgPilot from './Chapter3RpgPilot';
import './chapter3-pilot.css';

createRoot(document.getElementById('chapter3-pilot-root')!).render(
  <React.StrictMode><Chapter3RpgPilot/></React.StrictMode>
);

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { LiveControl } from './pages/LiveControl';
import { Calibration } from './pages/Calibration';
import { VoiceCommands } from './pages/VoiceCommands';
import { Settings } from './pages/Settings';
import { Performance } from './pages/Performance';
import { DesignSystem } from './pages/DesignSystem';
import { Popup } from './pages/Popup';

type CameraPreviewState = 'ready' | 'permission' | 'lost';
type MicrophoneState = 'ready' | 'unavailable';

interface AppProps {
  cameraState?: CameraPreviewState;
  micState?: MicrophoneState;
}

export function App({ cameraState = 'ready', micState = 'ready' }: AppProps) {
  return (
    <SessionProvider initialCamera={cameraState} initialMic={micState}>
      <BrowserRouter>
        <Routes>
          <Route path="/popup" element={<Popup />} />
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="/live" element={<LiveControl />} />
            <Route path="/calibration" element={<Calibration />} />
            <Route path="/voice" element={<VoiceCommands />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

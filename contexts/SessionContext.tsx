import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CameraState, InteractionMode, MicState, SessionStatus } from '../types/session';
import { useScreenInit } from '../useScreenInit.js';

interface SessionContextValue {
  status: SessionStatus;
  elapsed: number;
  cameraState: CameraState;
  micState: MicState;
  headTracking: boolean;
  voiceEnabled: boolean;
  sensitivity: number;
  smoothing: number;
  dwellMs: number;
  confidence: number | null;
  isTracking: boolean;
  canStart: boolean;
  mode: InteractionMode;
  start: () => void;
  pause: () => void;
  stop: () => void;
  toggle: () => void;
  setHeadTracking: (v: boolean) => void;
  setVoiceEnabled: (v: boolean) => void;
  setSensitivity: (v: number) => void;
  setSmoothing: (v: number) => void;
  setDwellMs: (v: number) => void;
  setMode: (m: Exclude<InteractionMode, 'off'>) => void;
  grantCamera: () => void;
  recenter: () => void;
  retryMic: () => void;
}

interface SessionProviderProps {
  children: React.ReactNode;
  initialCamera: CameraState;
  initialMic: MicState;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, initialCamera, initialMic }: SessionProviderProps) {
  const screenInit = useScreenInit() as { sessionStatus?: SessionStatus };
  const [status, setStatus] = useState<SessionStatus>(screenInit.sessionStatus ?? 'idle');
  const [elapsed, setElapsed] = useState(screenInit.sessionStatus ? 754 : 0);
  const [cameraState, setCameraState] = useState<CameraState>(initialCamera);
  const [micState, setMicState] = useState<MicState>(initialMic);
  const [headTracking, setHeadTracking] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState(6);
  const [smoothing, setSmoothing] = useState(60);
  const [dwellMs, setDwellMs] = useState(1000);
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => setCameraState(initialCamera), [initialCamera]);
  useEffect(() => setMicState(initialMic), [initialMic]);

  useEffect(() => {
    if (status !== 'running') return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [status]);

  const isTracking = status === 'running' && headTracking && cameraState === 'ready';

  useEffect(() => {
    if (!isTracking) {
      setConfidence(null);
      return;
    }
    setConfidence(94);
    const t = window.setInterval(() => setConfidence(90 + Math.round(Math.random() * 7)), 1600);
    return () => window.clearInterval(t);
  }, [isTracking]);

  const canStart = (cameraState === 'ready' && headTracking) || (micState === 'ready' && voiceEnabled);

  const start = useCallback(() => {
    if (canStart) setStatus('running');
  }, [canStart]);
  const pause = useCallback(() => setStatus((s) => (s === 'running' ? 'paused' : s)), []);
  const stop = useCallback(() => {
    setStatus('idle');
    setElapsed(0);
  }, []);
  const toggle = useCallback(() => {
    if (status === 'running') pause();
    else start();
  }, [status, pause, start]);

  const mode: InteractionMode =
    headTracking && voiceEnabled ? 'head-voice' : headTracking ? 'head' : voiceEnabled ? 'voice' : 'off';

  const setMode = useCallback((m: Exclude<InteractionMode, 'off'>) => {
    setHeadTracking(m !== 'voice');
    setVoiceEnabled(m !== 'head');
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      elapsed,
      cameraState,
      micState,
      headTracking,
      voiceEnabled,
      sensitivity,
      smoothing,
      dwellMs,
      confidence,
      isTracking,
      canStart,
      mode,
      start,
      pause,
      stop,
      toggle,
      setHeadTracking,
      setVoiceEnabled,
      setSensitivity,
      setSmoothing,
      setDwellMs,
      setMode,
      grantCamera: () => setCameraState('ready'),
      recenter: () => setCameraState('ready'),
      retryMic: () => setMicState('ready'),
    }),
    [status, elapsed, cameraState, micState, headTracking, voiceEnabled, sensitivity, smoothing, dwellMs, confidence, isTracking, canStart, mode, start, pause, stop, toggle, setMode],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

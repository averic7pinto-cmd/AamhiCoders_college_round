
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  CameraState,
  InteractionMode,
  MicState,
  SessionStatus,
} from '../types/session';
import { useScreenInit } from '../useScreenInit.js';

const BACKEND_URL = 'http://127.0.0.1:8000';
const API_KEY = 'HM-local-2026-change-this-key';

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
  loseCamera: () => void;
  recenter: () => void;
  retryMic: () => void;
}

interface SessionProviderProps {
  children: React.ReactNode;
  initialCamera: CameraState;
  initialMic: MicState;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialCamera,
  initialMic,
}: SessionProviderProps) {
  const screenInit = useScreenInit() as {
    sessionStatus?: SessionStatus;
  };

  const [status, setStatus] = useState<SessionStatus>(
    screenInit.sessionStatus ?? 'idle',
  );
  const [elapsed, setElapsed] = useState(
    screenInit.sessionStatus ? 754 : 0,
  );
  const [cameraState, setCameraState] =
    useState<CameraState>(initialCamera);
  const [micState, setMicState] = useState<MicState>(initialMic);
  const [headTracking, setHeadTracking] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState(6);
  const [smoothing, setSmoothing] = useState(60);
  const [dwellMs, setDwellMs] = useState(1000);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    setCameraState(initialCamera);
  }, [initialCamera]);

  useEffect(() => {
    setMicState(initialMic);
  }, [initialMic]);

  useEffect(() => {
    if (status !== 'running') return;

    const timer = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  const confidence: number | null = null;

  const canStart =
    (cameraState === 'ready' && headTracking) ||
    (micState === 'ready' && voiceEnabled);

  const start = useCallback(async () => {
    if (!canStart || status === 'running') return;

    try {
      const response = await fetch(`${BACKEND_URL}/start`, {
        method: 'POST',
        headers: {
          'x-handmouse-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      setIsTracking(true);
      setStatus('running');
    } catch (error) {
      console.error('Could not start Hand Free backend:', error);
      window.alert(
        'Could not start tracking. Check that the Python backend is running and its API key matches.',
      );
    }
  }, [canStart, status]);

  const pause = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/stop`, {
        method: 'POST',
        headers: {
          'x-handmouse-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      setIsTracking(false);
      setStatus('paused');
    } catch (error) {
      console.error('Could not pause tracking:', error);
      window.alert('Could not pause tracking. Check the backend connection.');
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/stop`, {
        method: 'POST',
        headers: {
          'x-handmouse-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      setIsTracking(false);
      setStatus('idle');
      setElapsed(0);
    } catch (error) {
      console.error('Could not stop tracking:', error);
      window.alert('Could not stop tracking. Check the backend connection.');
    }
  }, []);

  const toggle = useCallback(() => {
    if (status === 'running') {
      void pause();
    } else {
      void start();
    }
  }, [status, pause, start]);

  const mode: InteractionMode =
    headTracking && voiceEnabled
      ? 'head-voice'
      : headTracking
        ? 'head'
        : voiceEnabled
          ? 'voice'
          : 'off';

  const setMode = useCallback(
    (nextMode: Exclude<InteractionMode, 'off'>) => {
      setHeadTracking(nextMode !== 'voice');
      setVoiceEnabled(nextMode !== 'head');
    },
    [],
  );

  const grantCamera = useCallback(() => {
    setCameraState('ready');
  }, []);

  const loseCamera = useCallback(() => {
    setCameraState('lost');
  }, []);

  const recenter = useCallback(() => {
    // Camera recentering can be connected separately.
  }, []);

  const retryMic = useCallback(() => {
    setMicState('unavailable');
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
      grantCamera,
      loseCamera,
      recenter,
      retryMic,
    }),
    [
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
      setMode,
      grantCamera,
      loseCamera,
      recenter,
      retryMic,
    ],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return context;
}

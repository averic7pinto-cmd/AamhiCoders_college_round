import { useCallback, useEffect, useState } from 'react';

export const API_URL = 'http://127.0.0.1:8000';
export const API_KEY = 'HM-local-2026-change-this-key';
const STALE_AFTER_SECONDS = 10;
const BLACK_LIMIT = 6;

export interface TrackerState {
  running?: boolean;
  phase?: string;
  hand_detected?: boolean;
  gesture?: string;
  face_detected?: boolean;
  head_yaw?: number;
  head_pitch?: number;
  head_direction?: string;
  head_vertical?: string;
  brightness?: number | null;
  frame_count?: number;
  error?: string | null;
  updated_at?: number | null;
}

export function backend(
  path: string,
  method: 'GET' | 'POST' = 'POST',
  body?: unknown,
) {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'x-handmouse-key': API_KEY,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Fire-and-forget POST that never throws. */
export const post = (path: string, body?: unknown) =>
  backend(path, 'POST', body).catch(() => undefined);

export interface Tracker {
  live: TrackerState | null;
  connected: boolean;
  /** Tracker is running and sending fresh data. */
  active: boolean;
  /** Tracker is running but the camera picture is black. */
  dark: boolean;
  error: string | null;
  videoUrl: string | null;
  restart: () => void;
  reloadVideo: () => void;
}

/**
 * Starts the Python tracker while `enabled` is true and polls its state.
 * It never stops the tracker, so the owner decides when to stop it.
 */
export function useTracker(enabled: boolean): Tracker {
  const [live, setLive] = useState<TrackerState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLive(null);
      setConnected(false);
      setError(null);
      return;
    }

    let cancelled = false;
    let busy = false;
    let timer: number | undefined;

    const startTimer = window.setTimeout(() => {
      if (!cancelled) void post('/start');
    }, 400);

    const poll = async () => {
      if (busy || cancelled) return;
      busy = true;

      try {
        const response = await backend('/live-data', 'GET');

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Backend rejected the API key.'
              : `Backend returned HTTP ${response.status}.`,
          );
        }

        const data = (await response.json()) as TrackerState;

        if (!cancelled) {
          setLive(data);
          setConnected(true);
          setError(data.error ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setConnected(false);
          setError(
            e instanceof Error ? e.message : 'Could not reach the Python backend.',
          );
        }
      } finally {
        busy = false;
        if (!cancelled) timer = window.setTimeout(poll, 120);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [enabled]);

  // If the backend is reachable but the tracker is not running, ask again.
  useEffect(() => {
    if (!enabled || !connected || live?.running || live?.error) return;

    const timer = window.setTimeout(() => void post('/start'), 3000);
    return () => window.clearTimeout(timer);
  }, [enabled, connected, live?.running, live?.error]);

  const restart = useCallback(() => {
    setError(null);
    setNonce((n) => n + 1);
    void post('/start');
  }, []);

  const reloadVideo = useCallback(() => setNonce((n) => n + 1), []);

  const fresh =
    live?.updated_at != null &&
    Date.now() / 1000 - live.updated_at < STALE_AFTER_SECONDS;

  const active =
    enabled && connected && Boolean(live?.running) && live?.phase === 'running' && fresh;

  const dark =
    active && typeof live?.brightness === 'number' && live.brightness < BLACK_LIMIT;

  return {
    live,
    connected,
    active,
    dark,
    error,
    videoUrl: active
      ? `${API_URL}/video-feed?key=${encodeURIComponent(API_KEY)}&t=${nonce}`
      : null,
    restart,
    reloadVideo,
  };
}
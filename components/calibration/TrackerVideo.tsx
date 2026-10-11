import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import type { Tracker } from '../../hooks/useTracker';
import { Button } from '../ui/Button';

const MAX_AUTO_RETRIES = 3;

export function statusText(tracker: Tracker): string {
  if (tracker.error) return tracker.error;
  if (!tracker.connected) return 'Connecting to the Python backend... Is server.py running?';
  if (tracker.live?.phase === 'opening-camera') return 'Opening webcam...';
  if (tracker.live?.phase === 'loading-models') return 'Loading hand and face models...';
  return 'Starting video stream...';
}

/**
 * Fills its (relatively positioned) parent with the tracker's video,
 * or a status / error message. Reloads the stream if it fails to load
 * and warns when the camera picture is black.
 */
export function TrackerVideo({ tracker }: { tracker: Tracker }) {
  const { videoUrl, reloadVideo, dark, active, error } = tracker;
  const [failures, setFailures] = useState(0);

  useEffect(() => {
    if (!active) setFailures(0);
  }, [active]);

  useEffect(() => {
    if (failures === 0 || failures > MAX_AUTO_RETRIES) return;
    const timer = window.setTimeout(reloadVideo, 1200);
    return () => window.clearTimeout(timer);
  }, [failures, reloadVideo]);

  if (videoUrl && failures <= MAX_AUTO_RETRIES) {
    return (
      <>
        <img
          key={videoUrl}
          src={videoUrl}
          alt="Live webcam preview"
          onLoad={() => setFailures(0)}
          onError={() => setFailures((n) => n + 1)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {dark && (
          <div
            role="alert"
            className="glass absolute inset-x-3 bottom-3 rounded-2xl border border-amber/40 p-3 text-xs text-fg"
          >
            The camera picture is black. Check the privacy shutter, close other apps that use
            the webcam, or add more light.
          </div>
        )}
      </>
    );
  }

  const streamFailed = Boolean(videoUrl);
  const isError = streamFailed || Boolean(error);
  const message = streamFailed
    ? 'The tracker is running, but the browser could not load its video stream.'
    : statusText(tracker);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
      {isError && <AlertTriangleIcon className="h-6 w-6 text-coral" aria-hidden="true" />}
      <p className={`text-sm ${isError ? 'text-coral' : 'text-muted'}`}>{message}</p>
      {isError && (
        <Button
          variant="secondary"
          icon={RefreshCwIcon}
          onClick={() => {
            setFailures(0);
            if (streamFailed) reloadVideo();
            else tracker.restart();
          }}
        >
          {streamFailed ? 'Reload video' : 'Retry tracker'}
        </Button>
      )}
    </div>
  );
}
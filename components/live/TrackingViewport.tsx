import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangleIcon,
  CameraIcon,
  CrosshairIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  ScanFaceIcon,
  BoxIcon,
  HandIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "../ui/Button";
import { PointerMinimap } from "./PointerMinimap";
import { CameraPermissionState } from "./CameraPermissionState";
import { useSession } from "../../contexts/SessionContext";

type ViewState =
  | "permission"
  | "idle"
  | "paused"
  | "voice-only"
  | "waiting-model"
  | "tracking";

interface OverlayCopy {
  icon: typeof BoxIcon;
  title: string;
  body: string;
  tone: "neutral" | "warning" | "error";
}

interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface LiveData {
  running?: boolean;
  phase?: string;
  hand_detected?: boolean;
  landmarks?: Landmark[];
  gesture?: string;
  confidence?: number | null;
  head_direction?: string;
  error?: string | null;
  updated_at?: number | null;
}

const API_URL = "http://127.0.0.1:8000";
const API_KEY = "HM-local-2026-change-this-key";
const STALE_AFTER_SECONDS = 10;

const overlayCopy: Partial<Record<ViewState, OverlayCopy>> = {
  idle: {
    icon: CameraIcon,
    title: "Camera ready",
    body: "Start your session to connect the Python gesture-recognition pipeline.",
    tone: "neutral",
  },
  paused: {
    icon: PauseIcon,
    title: "Session paused",
    body: "Your session is paused. Resume when you're ready.",
    tone: "warning",
  },
  "voice-only": {
    icon: MicIcon,
    title: "Hand tracking is off",
    body: "Enable hand tracking to receive real-time gesture predictions.",
    tone: "neutral",
  },
  "waiting-model": {
    icon: ScanFaceIcon,
    title: "Starting hand tracker",
    body: "Connecting to the Python tracking pipeline. This can take a few seconds.",
    tone: "warning",
  },
};

const toneRing = {
  neutral: "ring-line text-cyan",
  warning: "ring-amber/50 text-amber",
  error: "ring-coral/60 text-coral",
};

async function callBackend(path: "/start" | "/stop") {
  try {
    await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "x-handmouse-key": API_KEY },
    });
  } catch {
    // Backend may not be running yet; polling shows the error.
  }
}

function describeCameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : "";

  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera permission was denied. Allow camera access in your browser settings.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found. Connect a webcam and retry.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera may already be in use by another application.";
  }
  return error instanceof Error
    ? error.message
    : "Unable to access the camera.";
}

async function openUserCamera(retries = 1): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Camera access is unavailable. Open HANDSFREE on localhost or HTTPS.",
    );
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
    } catch (error) {
      lastError = error;
      const name = error instanceof Error ? error.name : "";
      // Only retry when the camera is temporarily busy.
      if (name !== "NotReadableError" && name !== "TrackStartError") {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw lastError;
}

export function TrackingViewport() {
  const {
    status,
    cameraState,
    headTracking,
    confidence,
    start,
    grantCamera,
    loseCamera,
    setHeadTracking,
    canStart,
  } = useSession();

  const videoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(true);

  const [cameraStream, setCameraStream] =
    useState<MediaStream | null>(null);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // While the Python tracker runs, Python owns the webcam.
  const trackerWanted =
    status === "running" && headTracking && cameraGranted;

  const handleStreamEnded = useCallback(() => {
    setCameraStream(null);
    setCameraGranted(false);
    setCameraError(
      "The camera disconnected. Reconnect it and try again.",
    );
    loseCamera();
  }, [loseCamera]);

  const attachStream = useCallback(
    (stream: MediaStream) => {
      stream.getVideoTracks().forEach((track) => {
        track.onended = handleStreamEnded;
      });
      setCameraStream(stream);
    },
    [handleStreamEnded],
  );

  // First-time permission request (user gesture).
  const requestCamera = useCallback(async () => {
    if (cameraBusy) return;

    setCameraBusy(true);
    setCameraError(null);

    try {
      const stream = await openUserCamera();

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      attachStream(stream);
      setCameraGranted(true);
      grantCamera();
    } catch (error) {
      setCameraError(describeCameraError(error));
      loseCamera();
    } finally {
      if (mountedRef.current) setCameraBusy(false);
    }
  }, [attachStream, cameraBusy, grantCamera, loseCamera]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Show the local preview video.
  useEffect(() => {
    const video = videoRef.current;

    if (video && cameraStream) {
      video.srcObject = cameraStream;
      void video.play().catch(() => {});
    }

    return () => {
      if (video) video.srcObject = null;
    };
  }, [cameraStream]);

  // Stop the browser stream when it is replaced or unmounted.
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  // Release the browser camera while Python tracks;
  // re-acquire it for the preview when tracking is not running.
  useEffect(() => {
    if (!cameraGranted) return;

    if (trackerWanted) {
      if (cameraStream) setCameraStream(null);
      return;
    }

    if (cameraStream) return;

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const stream = await openUserCamera(6);

        if (cancelled || !mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        attachStream(stream);
      } catch (error) {
        if (!cancelled) setCameraError(describeCameraError(error));
      }
    }, 600); // give Python time to release the camera

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [attachStream, cameraGranted, cameraStream, trackerWanted]);

  // Start / stop the Python tracker.
  useEffect(() => {
    if (!trackerWanted) {
      void callBackend("/stop");
      return;
    }

    let cancelled = false;

    // Wait briefly so the browser has released the camera.
    const timer = window.setTimeout(() => {
      if (!cancelled) void callBackend("/start");
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trackerWanted]);

  // Poll the Python backend while the tracker is wanted.
  useEffect(() => {
    if (!trackerWanted) {
      setLiveData(null);
      setBackendError(null);
      setBackendConnected(false);
      return;
    }

    let cancelled = false;
    let requestInProgress = false;
    let timer: number | undefined;

    const fetchLiveData = async () => {
      if (requestInProgress || cancelled) return;
      requestInProgress = true;

      try {
        const response = await fetch(`${API_URL}/live-data`, {
          method: "GET",
          headers: { "x-handmouse-key": API_KEY },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Backend rejected the API key."
              : `Backend returned HTTP ${response.status}.`,
          );
        }

        const data = (await response.json()) as LiveData;

        if (!cancelled) {
          setLiveData(data);
          setBackendConnected(true);
          setBackendError(data.error ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setBackendConnected(false);
          setBackendError(
            error instanceof Error
              ? error.message
              : "Could not connect to the Python backend.",
          );
        }
      } finally {
        requestInProgress = false;

        if (!cancelled) {
          timer = window.setTimeout(fetchLiveData, 150);
        }
      }
    };

    void fetchLiveData();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [trackerWanted]);

  // Retry /start every 3 s while the backend is reachable
  // but the tracker is not running and reports no error.
  useEffect(() => {
    if (!trackerWanted || !backendConnected) return;
    if (liveData?.running || liveData?.error) return;

    const timer = window.setTimeout(() => {
      void callBackend("/start");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [trackerWanted, backendConnected, liveData?.running, liveData?.error]);

  const isFresh =
    liveData?.updated_at != null &&
    Date.now() / 1000 - liveData.updated_at < STALE_AFTER_SECONDS;

  const trackingActive =
    trackerWanted &&
    backendConnected &&
    Boolean(liveData?.running) &&
    liveData?.phase === "running" &&
    isFresh;

  const view: ViewState = !cameraGranted
    ? "permission"
    : status === "idle"
      ? "idle"
      : status === "paused"
        ? "paused"
        : !headTracking
          ? "voice-only"
          : !trackingActive
            ? "waiting-model"
            : "tracking";

  const overlay = overlayCopy[view];

  const handDetected = trackingActive && Boolean(liveData?.hand_detected);

  const gesture = handDetected
    ? liveData?.gesture ?? "Gesture detected"
    : "No hand detected";

  const gestureConfidence = liveData?.confidence ?? confidence;

  const landmarkCount = liveData?.landmarks?.length ?? 0;

  return (
    <section
      aria-label="Live camera and hand tracking preview"
      className={`luminous relative overflow-hidden rounded-4xl bg-[#0B0E16] shadow-panel ${
        cameraError ? "ring-2 ring-coral/50" : ""
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] 2xl:aspect-video">
        {!cameraGranted ? (
          <>
            <div aria-hidden="true" className="absolute inset-0 bg-grid" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(66,99,255,0.14)_0%,transparent_45%,#0B0E16_100%)]"
            />

            <CameraPermissionState
              onGrant={requestCamera}
              onVoiceOnly={() => setHeadTracking(false)}
            />

            {cameraBusy && (
              <div
                role="status"
                className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-line bg-[#111827]/95 p-3 text-center text-sm text-fg shadow-panel"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan" />
                  Requesting camera access...
                </span>
              </div>
            )}

            {cameraError && !cameraBusy && (
              <div
                role="alert"
                className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-coral/40 bg-[#17121B]/95 p-4 shadow-panel sm:inset-x-5 sm:bottom-5"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-fg">
                      Camera unavailable
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {cameraError}
                    </p>
                    <Button
                      className="mt-3"
                      icon={CameraIcon}
                      onClick={requestCamera}
                    >
                      Try camera again
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Video source:
                - tracker running  -> annotated MJPEG stream from Python
                - otherwise        -> local browser preview */}
            {trackingActive ? (
              <img
                key="backend-feed"
                src={`${API_URL}/video-feed?key=${encodeURIComponent(API_KEY)}`}
                alt="Live webcam preview with hand tracking"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : cameraStream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                aria-label="Live webcam preview"
                className="absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E16] text-xs text-muted">
                Camera is being handed to the hand tracker...
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,14,22,0.58)_0%,transparent_25%,transparent_68%,rgba(11,14,22,0.7)_100%)]"
            />

            {/* Top HUD */}
            <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4 sm:p-5">
              <span className="glass inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">
                <CameraIcon className="h-3.5 w-3.5 text-lime" />
                Live camera
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`glass inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                    trackingActive
                      ? "border-lime/40 text-lime"
                      : backendConnected
                        ? "border-amber/40 text-amber"
                        : "border-coral/40 text-coral"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      trackingActive
                        ? "animate-pulse bg-lime"
                        : backendConnected
                          ? "bg-amber"
                          : "bg-coral"
                    }`}
                  />
                  {trackingActive
                    ? "Python connected"
                    : backendConnected
                      ? "Waiting for tracker"
                      : "Backend disconnected"}
                </span>

                <span className="glass inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">
                  Confidence
                  <span className="font-mono">
                    {gestureConfidence !== null &&
                    gestureConfidence !== undefined
                      ? `${gestureConfidence}%`
                      : "—"}
                  </span>
                </span>
              </div>
            </div>

            {/* Live gesture label */}
            <div className="absolute left-4 top-16 z-10 max-w-[75%] sm:left-5 sm:top-20">
              <div className="glass rounded-2xl border border-line px-4 py-3 shadow-panel">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <HandIcon className="h-4 w-4 text-lime" />
                  GESTURE PREDICTION
                </div>
                <p className="mt-1 break-words text-lg font-bold text-white">
                  {gesture}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Head:{" "}
                  {trackingActive ? liveData?.head_direction ?? "—" : "—"}
                </p>
              </div>
            </div>

            {/* Bottom HUD */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
              <span className="glass inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">
                <CrosshairIcon className="h-3.5 w-3.5 text-cyan" />
                {handDetected
                  ? `${landmarkCount} landmarks received`
                  : "Looking for your hand"}
              </span>

              <div className="hidden md:block">
                <PointerMinimap active={trackingActive} />
              </div>
            </div>

            {/* Backend errors */}
            {backendError && (
              <div
                role="alert"
                className="absolute inset-x-4 bottom-16 z-20 rounded-xl border border-coral/40 bg-[#17121B]/95 p-3 text-xs text-white sm:inset-x-5"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangleIcon className="h-4 w-4 shrink-0 text-coral" />
                  <span>{backendError}</span>
                  <button
                    type="button"
                    className="ml-auto shrink-0 text-muted underline"
                    onClick={() => {
                      setBackendError(null);
                      void callBackend("/start");
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Status overlays (hidden while tracking works) */}
            <AnimatePresence mode="wait">
              {overlay && (
                <motion.div
                  key={view}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center px-4"
                >
                  <div
                    role="status"
                    className={`glass pointer-events-auto w-[min(24rem,88vw)] rounded-3xl border border-line p-5 text-center ring-1 ${toneRing[overlay.tone]}`}
                  >
                    <overlay.icon
                      className="mx-auto h-7 w-7"
                      aria-hidden="true"
                    />

                    <p className="mt-3 font-display text-base font-semibold text-fg">
                      {overlay.title}
                    </p>

                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {overlay.body}
                    </p>

                    {view === "idle" && (
                      <Button
                        className="mt-4"
                        icon={PlayIcon}
                        onClick={start}
                        disabled={!canStart}
                      >
                        Start session
                      </Button>
                    )}

                    {view === "paused" && (
                      <Button
                        className="mt-4"
                        icon={PlayIcon}
                        onClick={start}
                        disabled={!canStart}
                      >
                        Resume session
                      </Button>
                    )}

                    {view === "voice-only" && (
                      <Button
                        className="mt-4"
                        variant="secondary"
                        icon={ScanFaceIcon}
                        onClick={() => setHeadTracking(true)}
                      >
                        Enable hand tracking
                      </Button>
                    )}

                    {view === "waiting-model" && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <p className="text-xs font-medium text-amber">
                          {backendError ??
                            (!backendConnected
                              ? "Connecting to Python backend..."
                              : liveData?.phase === "loading-models"
                                ? "Loading hand and face models..."
                                : liveData?.phase === "opening-camera"
                                  ? "Opening webcam..."
                                  : liveData?.running
                                    ? "Starting video stream..."
                                    : "Starting tracker...")}
                        </p>
                        <Button
                          variant="secondary"
                          icon={RefreshCwIcon}
                          onClick={() => {
                            setBackendError(null);
                            void callBackend("/start");
                          }}
                        >
                          Reconnect tracker
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
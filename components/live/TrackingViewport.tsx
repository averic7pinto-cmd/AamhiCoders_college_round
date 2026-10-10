import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangleIcon, CameraIcon, CrosshairIcon, MicIcon, PauseIcon, PlayIcon, ScanFaceIcon, BoxIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { FaceWireframe } from "./FaceWireframe";
import { PointerMinimap } from "./PointerMinimap";
import { CameraPermissionState } from "./CameraPermissionState";
import { useSession } from "../../contexts/SessionContext";
type ViewState = 'permission' | 'lost' | 'idle' | 'paused' | 'voice-only' | 'tracking';
interface OverlayCopy {
  icon: typeof BoxIcon;
  title: string;
  body: string;
  tone: 'neutral' | 'warning' | 'error';
}
const overlayCopy: Partial<Record<ViewState, OverlayCopy>> = {
  idle: {
    icon: ScanFaceIcon,
    title: 'Preview ready',
    body: 'Head tracking starts when you start the session.',
    tone: 'neutral'
  },
  paused: {
    icon: PauseIcon,
    title: 'Session paused',
    body: 'Tracking is on hold. Your pointer stays where it is.',
    tone: 'warning'
  },
  'voice-only': {
    icon: MicIcon,
    title: 'Head tracking is off',
    body: 'Voice commands are still active. Turn tracking on below.',
    tone: 'neutral'
  },
  lost: {
    icon: AlertTriangleIcon,
    title: 'Tracking lost',
    body: 'Move back into the frame and face the screen. The pointer is frozen until your face is found.',
    tone: 'error'
  }
};
const toneRing = {
  neutral: 'ring-line text-cyan',
  warning: 'ring-amber/50 text-amber',
  error: 'ring-coral/60 text-coral'
};
export function TrackingViewport() {
  const {
    status,
    cameraState,
    headTracking,
    confidence,
    start,
    recenter,
    grantCamera,
    setHeadTracking,
    canStart
  } = useSession();
  const view: ViewState = cameraState === 'permission' ? 'permission' : cameraState === 'lost' ? 'lost' : status === 'idle' ? 'idle' : status === 'paused' ? 'paused' : !headTracking ? 'voice-only' : 'tracking';
  const tracking = view === 'tracking';
  const overlay = overlayCopy[view];
  return <section aria-label="Camera tracking preview" className={`luminous relative overflow-hidden rounded-4xl bg-[#0B0E16] shadow-panel ${view === 'lost' ? 'ring-2 ring-coral/50' : ''}`}>
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] 2xl:aspect-video">
        <div aria-hidden="true" className="absolute inset-0 bg-grid" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(66,99,255,0.14)_0%,transparent_45%,#0B0E16_100%)]" />

        {view === 'permission' ? <CameraPermissionState onGrant={grantCamera} onVoiceOnly={() => setHeadTracking(false)} /> : <>
            <FaceWireframe state={view === 'lost' ? 'lost' : tracking ? 'tracking' : 'idle'} />
            {tracking && <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="h-1/3 animate-scan bg-[linear-gradient(180deg,transparent,rgba(49,215,255,0.08),transparent)]" />
              </div>}

            {/* Top HUD */}
            <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4 sm:p-5">
              <span className="glass inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">
                <CameraIcon className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />
                Simulated preview
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`glass inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${tracking ? 'border-lime/40 text-lime' : view === 'lost' ? 'border-coral/50 text-coral' : 'border-line text-muted'}`}>
                  <span className={`h-2 w-2 rounded-full ${tracking ? 'bg-lime' : view === 'lost' ? 'bg-coral' : 'bg-muted'}`} aria-hidden="true" />
                  {tracking ? 'Face locked' : view === 'lost' ? 'No face found' : 'Standby'}
                </span>
                <span className="glass inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">
                  Confidence
                  <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-ink-4" aria-hidden="true">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#31D7FF,#C5FF4A)] transition-[width] duration-300 ease-out" style={{
                  width: `${confidence ?? 0}%`
                }} />
                  </span>
                  <span className="font-mono">{confidence !== null ? `${confidence}%` : '—'}</span>
                </span>
              </div>
            </div>

            {/* Bottom HUD */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
              <span className="glass inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">
                <CrosshairIcon className={`h-3.5 w-3.5 ${tracking ? 'text-lime' : 'text-muted'}`} aria-hidden="true" />
                {tracking ? 'Centered · within 3°' : 'Center reference'}
              </span>
              <div className="hidden md:block">
                <PointerMinimap active={tracking} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {overlay && <motion.div key={view} initial={{
            opacity: 0,
            scale: 0.96
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.96
          }} transition={{
            duration: 0.2,
            ease: [0.23, 1, 0.32, 1]
          }} className={`pointer-events-none absolute inset-0 flex items-center px-4 ${view === 'lost' ? 'justify-start sm:pl-8' : 'justify-center'}`}>
                  <div role="status" className={`glass pointer-events-auto w-[min(22rem,80vw)] rounded-3xl border border-line p-5 text-center ring-1 ${toneRing[overlay.tone]}`}>
                    <overlay.icon className="mx-auto h-7 w-7" aria-hidden="true" />
                    <p className="mt-3 font-display text-base font-semibold text-fg">{overlay.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{overlay.body}</p>
                    {view === 'idle' && <Button className="mt-4" icon={PlayIcon} onClick={start} disabled={!canStart}>
                        Start tracking
                      </Button>}
                    {view === 'paused' && <Button className="mt-4" icon={PlayIcon} onClick={start}>
                        Resume
                      </Button>}
                    {view === 'voice-only' && <Button className="mt-4" variant="secondary" icon={ScanFaceIcon} onClick={() => setHeadTracking(true)}>
                        Turn on head tracking
                      </Button>}
                    {view === 'lost' && <Button className="mt-4" variant="danger" icon={CrosshairIcon} onClick={recenter}>
                        Re-center tracking
                      </Button>}
                  </div>
                </motion.div>}
            </AnimatePresence>
          </>}
      </div>
    </section>;
}
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, LightbulbIcon, MicIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CalibrationStepper } from '../components/calibration/calibrationStepper';
import { PositionStep } from '../components/calibration/PositionStep';
import { DirectionStage, type HeadPose } from '../components/calibration/DirectionStage';
import { SensitivityStep } from '../components/calibration/SensitivityStep';
import TestArea from '../components/calibration/TestArea';
import { CompleteStep } from '../components/calibration/CompleteStep';
import { TrackerFeed } from '../components/calibration/TrackerFeed';
import { DeviceReadiness } from '../components/session/DeviceReadiness';
import { calibrationDirections, calibrationSteps, testTargets } from '../data/calibration';
import { useSession } from '../contexts/SessionContext';
import { post, useTracker } from '../hooks/useTracker';
import type { Direction } from '../types/calibration';
import { useScreenInit } from '../useScreenInit.js';

/** Shows the error instead of a blank screen if a step crashes. */
class StepBoundary extends React.Component<
  { children: React.ReactNode; resetKey: number },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[calibration] step crashed:', error);
  }

  componentDidUpdate(prev: { resetKey: number }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="rounded-2xl border border-coral/40 bg-coral/10 p-5 text-sm">
          <p className="font-semibold text-coral">This step ran into an error</p>
          <p className="mt-2 break-words text-muted">{this.state.error.message}</p>
          <p className="mt-2 text-muted">Open the browser console (F12) for details, then go Back and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Calibration() {
  const navigate = useNavigate();
  const { status, cameraState, sensitivity, smoothing, dwellMs, start } = useSession();
  const screenInit = useScreenInit() as { calibrationStep?: number };
  const initialStep = screenInit.calibrationStep ?? 0;
  const [step, setStep] = useState(initialStep);
  const [doneDirs, setDoneDirs] = useState<Direction[]>(
    initialStep > 2 ? calibrationDirections.map((d) => d.id) : initialStep === 2 ? ['center', 'left'] : [],
  );
  const [hits, setHits] = useState<number[]>(initialStep > 4 ? testTargets.map((_, i) => i) : initialStep === 4 ? [0, 2] : []);

  // The tracker runs from the camera step until the test step ends.
  const calibrating = step >= 1 && step <= 4 && cameraState === 'ready';
  const tracker = useTracker(calibrating);
  const { live, active } = tracker;

  const samples = useRef<Partial<Record<Direction, HeadPose>>>({});
  const keepTracker = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  const pose = useMemo<HeadPose | null>(
    () =>
      active && live?.face_detected
        ? { yaw: live.head_yaw ?? 0, pitch: live.head_pitch ?? 0 }
        : null,
    [active, live?.face_detected, live?.head_yaw, live?.head_pitch],
  );

  const capture = useCallback((d: Direction, capturedPose?: HeadPose) => {
    if (capturedPose) samples.current[d] = capturedPose;
    setDoneDirs((prev) => (prev.includes(d) ? prev : [...prev, d]));
  }, []);

  const retry = useCallback((d: Direction) => {
    delete samples.current[d];
    setDoneDirs((prev) => prev.filter((x) => x !== d));
  }, []);

  const resetAll = () => {
    samples.current = {};
    setStep(0);
    setDoneDirs([]);
    setHits([]);
  };

  // Turn head-turn clicks / voice typing / head scrolling OFF before the tracker
  // starts, so turning your head to calibrate cannot click or open dictation.
  // They are turned back on when calibration ends.
  useEffect(() => {
    if (!calibrating) return;
    void post('/calibration', { head_actions: false });
    return () => {
      void post('/calibration', { head_actions: true, cursor_control: true });
    };
  }, [calibrating]);

  // The hand only moves the real cursor on the sensitivity and test steps.
  useEffect(() => {
    if (calibrating) void post('/calibration', { cursor_control: step >= 3 });
  }, [calibrating, step]);

  // Sliders on the sensitivity step change the real cursor.
  useEffect(() => {
    if (calibrating) void post('/calibration', { sensitivity, smoothing });
  }, [calibrating, sensitivity, smoothing]);

  // When all directions are captured, send the real thresholds to Python.
  useEffect(() => {
    if (!active || doneDirs.length !== calibrationDirections.length) return;

    const center = samples.current.center;
    if (!center) return;

    const spans = [samples.current.left, samples.current.right]
      .filter((p): p is HeadPose => Boolean(p))
      .map((p) => Math.abs(p.yaw - center.yaw));

    const yaw_threshold = spans.length
      ? Math.min(0.3, Math.max(0.06, Math.min(...spans) * 0.6))
      : undefined;

    void post('/calibration', {
      yaw_center: center.yaw,
      pitch_center: center.pitch,
      yaw_threshold,
    });
  }, [active, doneDirs]);

  // Leaving without starting a session releases the camera.
  useEffect(
    () => () => {
      if (!keepTracker.current && statusRef.current !== 'running') {
        void post('/stop');
      }
    },
    [],
  );

  // Back on the permissions step: release the camera so the browser can use it.
  useEffect(() => {
    if (step === 0 && statusRef.current !== 'running') {
      void post('/stop');
    }
  }, [step]);

  const canContinue = [
    cameraState === 'ready',
    cameraState === 'ready' && active && Boolean(live?.face_detected),
    doneDirs.length === calibrationDirections.length,
    true,
    hits.length === testTargets.length,
  ][step];

  const blockedReason = [
    'Allow camera access to continue.',
    'Center your face in the frame to continue.',
    'Capture all five directions to continue.',
    '',
    'Hit every target, or skip the test.',
  ][step];

  const isLast = step === calibrationSteps.length - 1;
  const showFeed = step >= 2 && step <= 4;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <CalibrationStepper current={step} />

      <div className="grid gap-6 xl:grid-cols-12">
        <section aria-label={calibrationSteps[step].label} className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8 xl:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <StepBoundary resetKey={step}>
                {step === 0 && (
                  <div>
                    <h3 className="font-display text-2xl font-semibold">Let’s set up hands-free control</h3>
                    <p className="mt-2 max-w-xl text-muted">
                      This takes about two minutes. First, check that HANDSFREE can use your camera and microphone.
                    </p>
                    <div className="mt-7 max-w-xl">
                      <DeviceReadiness />
                    </div>
                  </div>
                )}
                {step === 1 && <PositionStep tracker={tracker} />}
                {step === 2 && (
                  <DirectionStage
                    done={doneDirs}
                    onCapture={capture}
                    onRetry={retry}
                    pose={pose}
                    center={samples.current.center ?? null}
                  />
                )}
                {step === 3 && <SensitivityStep />}
                {step === 4 && <TestArea hits={hits} onHit={(i: number) => setHits((p) => (p.includes(i) ? p : [...p, i]))} dwellMs={dwellMs} />}
                {step === 5 && (
                  <CompleteStep
                    summary={[
                      { label: 'Directions', value: `${doneDirs.length} / 5` },
                      { label: 'Sensitivity', value: `${sensitivity} / 10` },
                      { label: 'Smoothing', value: `${smoothing}%` },
                    ]}
                    onStart={() => {
                      keepTracker.current = true;
                      start();
                      navigate('/live');
                    }}
                    onRestart={resetAll}
                  />
                )}
              </StepBoundary>
            </motion.div>
          </AnimatePresence>

          {!isLast && (
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Button size="lg" variant="ghost" icon={ArrowLeftIcon} onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
                Back
              </Button>
              <div className="ml-auto flex flex-wrap items-center gap-3">
                {!canContinue && blockedReason && <p className="text-sm font-semibold text-amber">{blockedReason}</p>}
                {step === 1 && !canContinue && (
                  <Button size="lg" variant="secondary" onClick={() => setStep(2)}>
                    Skip camera check
                  </Button>
                )}
                {step === 4 && !canContinue && (
                  <Button size="lg" variant="secondary" onClick={() => setStep(5)}>
                    Skip test
                  </Button>
                )}
                <Button size="lg" iconRight={ArrowRightIcon} onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6 xl:col-span-4">
          {showFeed && <TrackerFeed tracker={tracker} />}

          <section aria-labelledby="guide-heading" className="rounded-4xl border border-cyan/30 bg-ink-2 bg-[linear-gradient(200deg,rgba(49,215,255,0.14)_0%,rgba(25,30,43,0)_50%)] p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/10 text-cyan ring-1 ring-inset ring-cyan/30">
                <LightbulbIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 id="guide-heading" className="font-display text-base font-semibold">
                {calibrationSteps[step].label}
              </h2>
            </div>
            <p className="mt-4 text-base leading-relaxed text-fg/90">{calibrationSteps[step].tip}</p>
            <p className="mt-5 flex items-start gap-2 rounded-2xl bg-ink-3/70 p-4 text-sm text-muted">
              <MicIcon className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft" aria-hidden="true" />
              <span>
                You can also say <span className="font-bold text-fg">“Next”</span>, <span className="font-bold text-fg">“Back”</span> or{' '}
                <span className="font-bold text-fg">“Repeat”</span>.
              </span>
            </p>
          </section>

          <section aria-labelledby="reset-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
            <h2 id="reset-heading" className="font-display text-base font-semibold">
              Start over
            </h2>
            <p className="mt-2 text-sm text-muted">Clears captured directions and test results. Your sensitivity settings are kept.</p>
            <Button className="mt-4" variant="danger" fullWidth icon={RotateCcwIcon} onClick={resetAll}>
              Reset calibration
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
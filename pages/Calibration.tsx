import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, LightbulbIcon, MicIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CalibrationStepper } from '../components/calibration/calibrationStepper';
import { PositionStep } from '../components/calibration/PositionStep';
import { DirectionStage } from '../components/calibration/DirectionStage';
import { SensitivityStep } from '../components/calibration/SensitivityStep';
import TestArea from '../components/calibration/TestArea';
import { CompleteStep } from '../components/calibration/CompleteStep';
import { DeviceReadiness } from '../components/session/DeviceReadiness';
import { calibrationDirections, calibrationSteps, testTargets } from '../data/calibration';
import { useSession } from '../contexts/SessionContext';
import type { Direction } from '../types/calibration';
import { useScreenInit } from '../useScreenInit.js';

export function Calibration() {
  const navigate = useNavigate();
  const { cameraState, sensitivity, smoothing, dwellMs, start } = useSession();
  const screenInit = useScreenInit() as { calibrationStep?: number };
  const initialStep = screenInit.calibrationStep ?? 0;
  const [step, setStep] = useState(initialStep);
  const [doneDirs, setDoneDirs] = useState<Direction[]>(
    initialStep > 2 ? calibrationDirections.map((d) => d.id) : initialStep === 2 ? ['center', 'left'] : [],
  );
  const [hits, setHits] = useState<number[]>(initialStep > 4 ? testTargets.map((_, i) => i) : initialStep === 4 ? [0, 2] : []);

  const capture = useCallback((d: Direction) => setDoneDirs((prev) => (prev.includes(d) ? prev : [...prev, d])), []);
  const retry = useCallback((d: Direction) => setDoneDirs((prev) => prev.filter((x) => x !== d)), []);

  const resetAll = () => {
    setStep(0);
    setDoneDirs([]);
    setHits([]);
  };

  const canContinue = [
    cameraState === 'ready',
    cameraState === 'ready',
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
              {step === 1 && <PositionStep />}
              {step === 2 && <DirectionStage done={doneDirs} onCapture={capture} onRetry={retry} />}
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
                    start();
                    navigate('/live');
                  }}
                  onRestart={resetAll}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {!isLast && (
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Button size="lg" variant="ghost" icon={ArrowLeftIcon} onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
                Back
              </Button>
              <div className="ml-auto flex flex-wrap items-center gap-3">
                {!canContinue && blockedReason && <p className="text-sm font-semibold text-amber">{blockedReason}</p>}
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

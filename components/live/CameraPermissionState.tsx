import React from 'react';
import { CameraOffIcon, LockIcon, MicIcon, ShieldCheckIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface CameraPermissionStateProps {
  onGrant: () => void;
  onVoiceOnly: () => void;
}

export function CameraPermissionState({ onGrant, onVoiceOnly }: CameraPermissionStateProps) {
  return (
    <div className="absolute inset-0 grid place-items-center p-6">
      <div className="max-w-md text-center">
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-violet/50" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full bg-violet/15 ring-1 ring-violet/50" aria-hidden="true" />
          <CameraOffIcon className="relative h-9 w-9 text-violet-soft" aria-hidden="true" />
        </div>
        <h2 className="mt-6 font-display text-xl font-semibold sm:text-2xl">Camera access needed</h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          The live preview appears here after you allow camera access in Chrome. Nothing is tracked or recorded until then.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button size="lg" icon={ShieldCheckIcon} onClick={onGrant}>
            Allow camera
          </Button>
          <Button size="lg" variant="secondary" icon={MicIcon} onClick={onVoiceOnly}>
            Use voice only
          </Button>
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Chrome shows the prompt near the address bar. Frames stay on this device.
        </p>
      </div>
    </div>
  );
}

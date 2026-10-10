import React from "react";
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, BoxIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { useSession } from "../../contexts/SessionContext";
interface DeviceReadinessProps {
  variant?: 'default' | 'compact';
  showDetail?: boolean;
}
type DeviceTone = 'success' | 'warning' | 'error';
interface Device {
  key: string;
  label: string;
  icon: typeof BoxIcon;
  tone: DeviceTone;
  status: string;
  detail: string;
  action: {
    label: string;
    onClick: () => void;
  } | null;
}
const toneText: Record<DeviceTone, string> = {
  success: 'text-lime',
  warning: 'text-amber',
  error: 'text-coral'
};
const toneDot: Record<DeviceTone, string> = {
  success: 'bg-lime',
  warning: 'bg-amber',
  error: 'bg-coral'
};
const toneTile: Record<DeviceTone, string> = {
  success: 'bg-lime/10 text-lime ring-lime/30',
  warning: 'bg-amber/10 text-amber ring-amber/30',
  error: 'bg-coral/10 text-coral ring-coral/35'
};
export function DeviceReadiness({
  variant = 'default',
  showDetail = true
}: DeviceReadinessProps) {
  const {
    cameraState,
    micState,
    grantCamera,
    recenter,
    retryMic
  } = useSession();
  const devices: Device[] = [{
    key: 'camera',
    label: 'Camera',
    icon: cameraState === 'permission' ? CameraOffIcon : CameraIcon,
    tone: cameraState === 'ready' ? 'success' : cameraState === 'permission' ? 'warning' : 'error',
    status: cameraState === 'ready' ? 'Ready' : cameraState === 'permission' ? 'Permission needed' : 'Tracking lost',
    detail: cameraState === 'ready' ? 'HD webcam · 30 fps' : cameraState === 'permission' ? 'Allow access to enable head tracking' : 'Move back into the frame',
    action: cameraState === 'permission' ? {
      label: 'Allow',
      onClick: grantCamera
    } : cameraState === 'lost' ? {
      label: 'Re-center',
      onClick: recenter
    } : null
  }, {
    key: 'mic',
    label: 'Microphone',
    icon: micState === 'ready' ? MicIcon : MicOffIcon,
    tone: micState === 'ready' ? 'success' : 'error',
    status: micState === 'ready' ? 'Ready' : 'Unavailable',
    detail: micState === 'ready' ? 'Default input · clear signal' : 'No input detected',
    action: micState === 'unavailable' ? {
      label: 'Retry',
      onClick: retryMic
    } : null
  }];
  if (variant === 'compact') {
    return <ul className="mt-3 space-y-2.5">
        {devices.map(d => <li key={d.key} className="flex items-center gap-2.5 text-sm">
            <d.icon className="h-4 w-4 text-muted" aria-hidden="true" />
            <span className="flex-1 font-semibold text-fg">{d.label}</span>
            <span className={`flex items-center gap-1.5 text-xs font-bold ${toneText[d.tone]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${toneDot[d.tone]}`} aria-hidden="true" />
              {d.status}
            </span>
          </li>)}
      </ul>;
  }
  return <ul className="grid grid-cols-2 gap-3">
      {devices.map(d => <li key={d.key} className="flex flex-col rounded-2xl border border-line bg-ink-3/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset ${toneTile[d.tone]}`}>
              <d.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            {d.action && <Button size="sm" variant="secondary" onClick={d.action.onClick}>
                {d.action.label}
              </Button>}
          </div>
          <p className="mt-3 text-sm font-semibold text-fg">{d.label}</p>
          <p className={`mt-0.5 flex items-center gap-1.5 text-sm font-bold ${toneText[d.tone]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${toneDot[d.tone]}`} aria-hidden="true" />
            {d.status}
          </p>
          {showDetail && <p className="mt-1 text-xs text-muted">{d.detail}</p>}
        </li>)}
    </ul>;
}
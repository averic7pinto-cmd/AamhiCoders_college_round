import type { CameraState, MicState, SessionStatus } from '../types/session';
import type { StatusTone } from '../types/ui';

interface StatusInfo {
  tone: StatusTone;
  label: string;
}

export function getSystemStatus(camera: CameraState, mic: MicState): StatusInfo {
  if (camera === 'lost') return { tone: 'error', label: 'Tracking lost' };
  if (camera === 'permission') return { tone: 'warning', label: 'Camera permission needed' };
  if (mic === 'unavailable') return { tone: 'warning', label: 'Microphone unavailable' };
  return { tone: 'success', label: 'All systems ready' };
}

export function getSessionLabel(status: SessionStatus): StatusInfo {
  if (status === 'running') return { tone: 'live', label: 'Live' };
  if (status === 'paused') return { tone: 'warning', label: 'Paused' };
  return { tone: 'neutral', label: 'Idle' };
}

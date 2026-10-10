import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

export function useGlobalShortcuts(): void {
  const navigate = useNavigate();
  const { toggle } = useSession();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.code === 'KeyS') {
        e.preventDefault();
        toggle();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        navigate('/calibration');
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        navigate('/live');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, navigate]);
}

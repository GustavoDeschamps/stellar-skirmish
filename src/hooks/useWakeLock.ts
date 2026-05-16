import { useEffect, useRef } from 'react';

export function useWakeLock(active: boolean) {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let cancelled = false;

    async function request() {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
        wakeLock.current.addEventListener('release', () => {
          wakeLock.current = null;
        });
      } catch {
        // Wake Lock not supported or denied
      }
    }

    request();

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && !cancelled) {
        request();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      wakeLock.current?.release();
      wakeLock.current = null;
    };
  }, [active]);
}

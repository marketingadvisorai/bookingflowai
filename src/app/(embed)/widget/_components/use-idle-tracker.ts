'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tracks idle time (seconds since last user interaction).
 * Resets on mousemove, click, keydown, touchstart.
 */
export function useIdleTracker(enabled: boolean = true) {
  const [idleSeconds, setIdleSeconds] = useState(0);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) {
      setIdleSeconds(0);
      return;
    }

    function resetIdle() {
      lastActivityRef.current = Date.now();
      setIdleSeconds(0);
    }

    // Listen to all user activity
    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('click', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });
    window.addEventListener('touchstart', resetIdle, { passive: true });
    window.addEventListener('scroll', resetIdle, { passive: true });

    // Update idle counter every second
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      setIdleSeconds(elapsed);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('click', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      clearInterval(interval);
    };
  }, [enabled]);

  return { idleSeconds };
}

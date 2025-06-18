// useFPS.ts
import { useState, useRef, useEffect } from "react";

export function useFPS(): number {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let rafId: number;

    const loop = () => {
      frameCount.current += 1;
      const now = performance.now();
      const delta = now - lastTime.current;

      // обновлять раз в секунду (или близко к этому)
      if (delta >= 1000) {
        // округляем до целого
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
}

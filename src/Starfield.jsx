
import { useEffect, useRef } from "react";

/**
 * Starfield — small stars, video-like slow drift
 * - 3 parallax layers (far/ mid/ near) ⇒ depth feeling
 * - tiny star size (0.5px–1.4px) like the video
 * - stars move from all directions (wrap-around at edges)
 * - mobile/hiDPI safe
 */
// Starfield.jsx — key changes
export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    let curW = window.innerWidth;
    let curH = window.innerHeight;

    const clampDpr = () => Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    // build layers function stays same...
    const bg = "#0b0f17";
    const layersCfg = [
      { density: 0.00005, speed: 0.04, sizeMin: 0.5, sizeMax: 0.9, alpha: 0.55 },
      { density: 0.00007, speed: 0.07, sizeMin: 0.6, sizeMax: 1.1, alpha: 0.7  },
      { density: 0.00008, speed: 0.10, sizeMin: 0.8, sizeMax: 1.4, alpha: 0.85 },
    ];
    const twinkle = true, tPhase = 0.02;

    const W = () => curW;
    const H = () => curH;

    function makeLayer(cfg) {
      const count = Math.max(60, Math.floor(W() * H() * cfg.density));
      const arr = new Array(count).fill(0).map(() => {
        const angle = Math.random() * Math.PI * 2;
        const speed = cfg.speed * (0.8 + Math.random() * 0.6);
        return {
          x: Math.random() * W(),
          y: Math.random() * H(),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
          a: cfg.alpha * (0.85 + Math.random() * 0.3),
          phase: Math.random() * Math.PI * 2
        };
      });
      return { cfg, stars: arr };
    }

    let field = layersCfg.map(makeLayer);

    const setSize = () => {
      const dpr = clampDpr();
      const newW = window.innerWidth;
      const newH = window.innerHeight;

      // CSS size for viewport fit
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";

      // Backing store size
      canvas.width  = Math.floor(newW * dpr);
      canvas.height = Math.floor(newH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // scale existing stars to new size (prevents “one-side empty” look)
      const sx = newW / curW;
      const sy = newH / curH;
      if (isFinite(sx) && isFinite(sy) && sx > 0 && sy > 0) {
        for (const layer of field) {
          for (const s of layer.stars) {
            s.x *= sx;
            s.y *= sy;
          }
        }
      } else {
        // fallback: rebuild if numbers look weird
        field = layersCfg.map(makeLayer);
      }

      curW = newW;
      curH = newH;
    };

    setSize();
    window.addEventListener("resize", setSize);

    let raf = 0, last = performance.now();
    function tick(now) {
      const dt = Math.min(40, now - last);
      last = now;
      const f = dt / 16.67;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W(), H());

      for (const layer of field) {
        for (const s of layer.stars) {
          s.x += s.vx * f;
          s.y += s.vy * f;

          if (s.x < -2) s.x = W() + 2;
          if (s.x > W() + 2) s.x = -2;
          if (s.y < -2) s.y = H() + 2;
          if (s.y > H() + 2) s.y = -2;

          if (twinkle) { s.phase += tPhase * f; }

          const alpha = twinkle ? s.a * (0.85 + 0.15 * Math.sin(s.phase)) : s.a;
          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",    // ← 100%
        height: "100vh",   // ← 100%
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
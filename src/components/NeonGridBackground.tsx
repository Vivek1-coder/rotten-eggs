"use client";

import { useEffect, useRef, useCallback } from "react";

export default function NeonGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    timeRef.current += 0.008;
    const t = timeRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    ctx.clearRect(0, 0, w, h);

    // Dark radial vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.85);
    vignette.addColorStop(0, "rgba(10, 10, 30, 0.0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.7)");

    const spacing = 55;
    const interactRadius = 220;
    const glowRadius = 160;

    // ── Grid lines ──────────────────────────────────
    // Vertical lines
    for (let x = 0; x <= w; x += spacing) {
      const dx = mx - x;
      const distToMouse = Math.abs(dx);
      const mouseInfluence = Math.max(0, 1 - distToMouse / interactRadius);
      const wave = Math.sin(t * 2 + x * 0.008) * 0.3 + 0.7;

      // Base alpha + mouse boost
      const alpha = 0.06 + mouseInfluence * 0.35 + wave * 0.04;

      // Color shift near mouse
      const r = Math.floor(0 + mouseInfluence * 255);
      const g = Math.floor(255 - mouseInfluence * 200);
      const b = 255;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.lineWidth = 0.5 + mouseInfluence * 1.8;

      // Slight wave distortion
      for (let y = 0; y <= h; y += 4) {
        const waveOffset = Math.sin(t * 1.5 + y * 0.01 + x * 0.005) * (2 + mouseInfluence * 6);
        if (y === 0) ctx.moveTo(x + waveOffset, y);
        else ctx.lineTo(x + waveOffset, y);
      }
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= h; y += spacing) {
      const dy = my - y;
      const distToMouse = Math.abs(dy);
      const mouseInfluence = Math.max(0, 1 - distToMouse / interactRadius);
      const wave = Math.sin(t * 2 + y * 0.008) * 0.3 + 0.7;

      const alpha = 0.06 + mouseInfluence * 0.35 + wave * 0.04;

      const r = Math.floor(255 * mouseInfluence);
      const g = Math.floor(0 + mouseInfluence * 50);
      const b = Math.floor(255 - mouseInfluence * 50);

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.lineWidth = 0.5 + mouseInfluence * 1.8;

      for (let x = 0; x <= w; x += 4) {
        const waveOffset = Math.sin(t * 1.5 + x * 0.01 + y * 0.005) * (2 + mouseInfluence * 6);
        if (x === 0) ctx.moveTo(x, y + waveOffset);
        else ctx.lineTo(x, y + waveOffset);
      }
      ctx.stroke();
    }

    // ── Intersection node dots ──────────────────────
    for (let x = 0; x <= w; x += spacing) {
      for (let y = 0; y <= h; y += spacing) {
        const dx = mx - x;
        const dy = my - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - dist / glowRadius);
        const pulse = Math.sin(t * 3 + x * 0.02 + y * 0.02) * 0.5 + 0.5;

        if (mouseInfluence > 0.01) {
          // Glow halo
          const glowSize = 8 + mouseInfluence * 18 + pulse * 4;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          const hue = (x * 0.5 + y * 0.3 + t * 40) % 360;
          grad.addColorStop(0, `hsla(${hue}, 100%, 65%, ${mouseInfluence * 0.6})`);
          grad.addColorStop(0.5, `hsla(${hue}, 100%, 50%, ${mouseInfluence * 0.2})`);
          grad.addColorStop(1, `hsla(${hue}, 100%, 40%, 0)`);
          ctx.fillStyle = grad;
          ctx.fillRect(x - glowSize, y - glowSize, glowSize * 2, glowSize * 2);
        }

        // Dot
        const dotAlpha = 0.15 + mouseInfluence * 0.7 + pulse * 0.1;
        const dotSize = 1 + mouseInfluence * 2.5 + pulse * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = mouseInfluence > 0.3
          ? `rgba(255, 0, 255, ${dotAlpha})`
          : `rgba(0, 255, 255, ${dotAlpha})`;
        ctx.fill();
      }
    }

    // ── Floating neon orbs ──────────────────────────
    const orbs = [
      { cx: w * 0.2, cy: h * 0.3, color: "0, 255, 255", phase: 0 },
      { cx: w * 0.8, cy: h * 0.6, color: "255, 0, 255", phase: 2 },
      { cx: w * 0.5, cy: h * 0.8, color: "57, 255, 20", phase: 4 },
      { cx: w * 0.15, cy: h * 0.7, color: "255, 0, 68", phase: 1 },
      { cx: w * 0.85, cy: h * 0.2, color: "0, 200, 255", phase: 3 },
    ];

    for (const orb of orbs) {
      const ox = orb.cx + Math.sin(t * 0.4 + orb.phase) * 80;
      const oy = orb.cy + Math.cos(t * 0.3 + orb.phase) * 60;
      const orbSize = 100 + Math.sin(t + orb.phase) * 30;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orbSize);
      grad.addColorStop(0, `rgba(${orb.color}, 0.08)`);
      grad.addColorStop(0.5, `rgba(${orb.color}, 0.03)`);
      grad.addColorStop(1, `rgba(${orb.color}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(ox - orbSize, oy - orbSize, orbSize * 2, orbSize * 2);
    }

    // ── Mouse glow ring ─────────────────────────────
    if (mx > 0 && my > 0) {
      const ringRadius = 80 + Math.sin(t * 4) * 15;
      const grad = ctx.createRadialGradient(mx, my, ringRadius * 0.3, mx, my, ringRadius);
      grad.addColorStop(0, "rgba(0, 255, 255, 0.05)");
      grad.addColorStop(0.6, "rgba(255, 0, 255, 0.03)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(mx - ringRadius, my - ringRadius, ringRadius * 2, ringRadius * 2);

      // Thin ring
      ctx.beginPath();
      ctx.arc(mx, my, ringRadius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.08 + Math.sin(t * 5) * 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Vignette overlay
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const loop = () => {
      draw(ctx, window.innerWidth, window.innerHeight);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="neon-grid-bg" />;
}

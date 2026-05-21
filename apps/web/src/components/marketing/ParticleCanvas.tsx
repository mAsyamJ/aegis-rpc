"use client";

import { useEffect, useRef } from "react";

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    const mouse = { x: null as number | null, y: null as number | null };

    const config = {
      particleCount: 120,
      mouseRadius: 180,
    };

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      size = 1;
      baseAlpha = 0.2;
      currentAlpha = 0.2;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5;
        this.baseAlpha = Math.random() * 0.4 + 0.1;
        this.currentAlpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < config.mouseRadius) {
            this.currentAlpha = Math.min(this.baseAlpha + 0.5, 1);
            ctx!.beginPath();
            ctx!.strokeStyle = "rgba(34, 211, 238, 0.15)";
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(this.x, this.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
            ctx!.fillStyle = "rgba(34, 211, 238, 0.85)";
          } else {
            this.currentAlpha = this.baseAlpha;
            ctx!.fillStyle = "rgba(255,255,255,0.25)";
          }
        } else {
          this.currentAlpha = this.baseAlpha;
          ctx!.fillStyle = "rgba(255,255,255,0.25)";
        }
      }

      draw() {
        ctx!.globalAlpha = this.currentAlpha;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = window.innerWidth < 768 ? 60 : config.particleCount;
      particles = Array.from({ length: count }, () => new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      if (mouse.x != null && mouse.y != null) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400);
        gradient.addColorStop(0, "rgba(34, 211, 238, 0.08)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
      for (const p of particles) {
        p.update();
        p.draw();
      }
      raf = requestAnimationFrame(animate);
    }

    resize();
    animate();

    const onResize = () => resize();
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[15] hidden motion-safe:block"
    />
  );
}

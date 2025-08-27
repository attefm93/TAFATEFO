import React, { useEffect, useRef } from 'react';

type Shape = 'circle' | 'triangle' | 'square';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
  shape: Shape;
}

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    const deviceMem = (navigator as any).deviceMemory || 4;
    const isLowPower = deviceMem <= 3;
    const isMobileMode = isSmallScreen || isLowPower;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobileMode ? 1 : 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createNodes = () => {
      if (prefersReducedMotion) {
        nodesRef.current = [];
        return;
      }

      // Mobile-friendly: far fewer nodes, lighter motion
      const baseCount = Math.min(240, Math.floor((canvas.width * canvas.height) / 8500));
      const maxForSmallScreens = isMobileMode ? 32 : 180;
      const nodeCount = Math.min(maxForSmallScreens, baseCount);
      nodesRef.current = [];

      for (let i = 0; i < nodeCount; i++) {
        const r = Math.random();
        const shape: Shape = r < 0.34 ? 'circle' : r < 0.67 ? 'triangle' : 'square';
        // Pixels per second speeds for consistent motion regardless of FPS
        const minSpeed = isMobileMode ? 60 : 110;
        const maxSpeed = isMobileMode ? 120 : 200;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        const angle = Math.random() * Math.PI * 2;
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          connections: [],
          shape,
        });
      }
    };

    const updateNodes = (dt: number) => {
      nodesRef.current.forEach(node => {
        node.x += node.vx * dt;
        node.y += node.vy * dt;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });
    };

    const drawConnections = () => {
      // Skip heavy O(n^2) lines on mobile mode or when too many nodes
      if (isMobileMode) return;
      if (nodesRef.current.length > 120) return;
      const maxDistance = 220;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.5;
            ctx.strokeStyle = `rgba(59,130,246,${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      }
    };

    const drawNodes = () => {
      nodesRef.current.forEach(node => {
        // Neon blue palette
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
        gradient.addColorStop(0, 'rgba(191, 219, 254, 1)');    // blue-100 core
        gradient.addColorStop(0.4, 'rgba(96, 165, 250, 0.9)');  // blue-400 ring
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.18)');   // blue-500 falloff

        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
        ctx.shadowBlur = 14;

        const size = 4;
        ctx.beginPath();
        if (node.shape === 'circle') {
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        } else if (node.shape === 'triangle') {
          const h = size * 2;
          ctx.moveTo(node.x, node.y - h * 0.6);
          ctx.lineTo(node.x - size, node.y + h * 0.4);
          ctx.lineTo(node.x + size, node.y + h * 0.4);
          ctx.closePath();
        } else {
          ctx.rect(node.x - size, node.y - size, size * 2, size * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    let last = 0;
    const animate = (ts = 0) => {
      if (last === 0) last = ts || performance.now();
      const dt = Math.min(Math.max((ts - last) / 1000, 0), 0.033); // cap to ~33ms
      last = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!prefersReducedMotion) {
        updateNodes(dt || 1/60);
        drawConnections();
        drawNodes();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createNodes();
    if (!prefersReducedMotion) {
      animate();
    }

    const handleResize = () => {
      resizeCanvas();
      createNodes();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      } else if (document.visibilityState === 'visible') {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      role="presentation"
      style={{ zIndex: 1 }}
    />
  );
};

export default AnimatedBackground;
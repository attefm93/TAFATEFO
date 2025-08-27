import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
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
      // Cap DPR to reduce GPU load
      const dpr = Math.min(window.devicePixelRatio || 1, isMobileMode ? 1 : 1.5);
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
      const baseCount = Math.min(220, Math.floor((canvas.width * canvas.height) / 11000));
      const maxForSmallScreens = isMobileMode ? 26 : 160;
      const nodeCount = Math.min(maxForSmallScreens, baseCount);
      nodesRef.current = [];

      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // Moderate movement speed for better performance
          vx: (Math.random() - 0.5) * (isMobileMode ? 1.2 : 2.6),
          vy: (Math.random() - 0.5) * (isMobileMode ? 1.2 : 2.6),
          connections: []
        });
      }
    };

    const updateNodes = () => {
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });
    };

    const drawConnections = () => {
      // Skip heavy O(n^2) lines on mobile or when too many nodes
      if (isMobileMode) return;
      if (nodesRef.current.length > 120) return;
      const maxDistance = 200;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            const t = (1 - distance / maxDistance);
            const opacity = t * 0.55;
            // Neon blue links (reduced glow for performance)
            ctx.strokeStyle = `rgba(96,165,250,${opacity})`;
            ctx.lineWidth = 1.0 + t * 0.6;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      }
    };

    const drawNodes = () => {
      const time = performance.now() * 0.0032;
      nodesRef.current.forEach(node => {
        const pulse = (Math.sin(time + (node.x + node.y) * 0.002) + 1) * 0.5; // 0..1
        const radius = 2.6 + pulse * 1.6;
        const glow = 10 + pulse * 12;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12 + pulse * 8);
        // Neon blue palette
        gradient.addColorStop(0, 'rgba(191, 219, 254, 1)');    // blue-100 core
        gradient.addColorStop(0.4, 'rgba(96, 165, 250, 0.9)');  // blue-400 ring
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.18)');   // blue-500 falloff

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Neon glow in blue (reduced for performance)
        ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
        ctx.shadowBlur = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(2, radius * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    let last = 0;
    const animate = (ts = 0) => {
      // 30fps throttle on mobile
      if (isMobileMode) {
        const dt = ts - last;
        if (dt < 33) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        last = ts;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!prefersReducedMotion) {
        updateNodes();
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
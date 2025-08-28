import React, { useEffect, useRef } from 'react';

type Panel = { src: string; alt: string };

interface Props {
  panels: Panel[];
  onSelect?: (index: number) => void;
}

/**
 * Vanilla DOM/CSS implementation of a holographic semi-circle gallery adapted for React.
 * Mirrors the shared snippet: cards distributed on an arc, neon cyan edges, parallax orbit,
 * click-to-focus brings the card forward.
 */
export default function VanillaHologramAbout({ panels, onSelect }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gallery = galleryRef.current!;
    const root = rootRef.current!;
    const stage = root.querySelector('.vhg-stage') as HTMLDivElement;
    // Cleanup any previous
    gallery.innerHTML = '';
    // Remove any prior center card
    const prevCenter = stage.querySelector('.vhg-center');
    if (prevCenter) prevCenter.remove();

    // Build center card (first image) if available
    if (panels.length > 0) {
      const p = panels[0];
      const center = document.createElement('figure');
      center.className = 'vhg-card vhg-center';
      (center as any).dataset.index = '0';

      const inner = document.createElement('div');
      inner.className = 'vhg-inner';
      inner.style.animationDelay = `0s`;

      const img = document.createElement('img');
      img.src = p.src;
      img.alt = p.alt || 'Center Image';
      img.loading = 'lazy';

      const shadow = document.createElement('div');
      shadow.className = 'vhg-shadow';

      inner.appendChild(img);
      center.appendChild(inner);
      center.appendChild(shadow);
      // position in center with slight tilt
      center.style.transform = 'translate(-50%, -50%) rotateX(-8deg) translateZ(0px)';
      stage.appendChild(center);
    }

    // Build orbit cards (remaining images)
    const orbitPanels = panels.slice(1);
    orbitPanels.forEach((p, i) => {
      const card = document.createElement('figure');
      card.className = 'vhg-card';
      (card as any).dataset.index = String(i + 1);

      const inner = document.createElement('div');
      inner.className = 'vhg-inner';
      inner.style.animationDelay = `${(i + 1) * 0.08}s`;

      const img = document.createElement('img');
      img.src = p.src;
      img.alt = p.alt || `Image ${i + 2}`;
      img.loading = 'lazy';

      const shadow = document.createElement('div');
      shadow.className = 'vhg-shadow';

      inner.appendChild(img);
      card.appendChild(inner);
      card.appendChild(shadow);
      gallery.appendChild(card);
    });

    // Layout cards on a full 360° carousel around the center
    const layoutCards = () => {
      const cards = Array.from(gallery.querySelectorAll<HTMLElement>('.vhg-card'));
      const N = cards.length || 1; // orbit count only
      const rect = gallery.getBoundingClientRect();
      const w = Math.min(rect.width, rect.height) || window.innerWidth; // ring fits the square
      const isNarrow = w < 520;
      const radius = w * (isNarrow ? 0.36 : 0.42);
      const spreadY = isNarrow ? 6 : 10;
      const maxBlur = isNarrow ? 2.2 : 2.8; // depth of field amount
      cards.forEach((card, i) => {
        const t = N === 0 ? 0 : i / N; // 0..(N-1)/N
        const angle = t * 360; // distribute evenly
        const rad = (angle * Math.PI) / 180;
        const y = Math.sin(t * Math.PI * 2) * spreadY;
        const z = radius;
        // closeness to camera when facing front (angle ≈ 0 or 360)
        const closeness = Math.cos(rad);
        const blur = Math.max(0, (1 - Math.abs(closeness)) * maxBlur);
        card.style.setProperty('--vhg-blur', `${blur.toFixed(2)}px`);
        card.style.transform = `translate(-50%, -50%) rotateX(-8deg) rotateY(${angle}deg) translateZ(${z}px) translateY(${y}px) rotateY(${-angle}deg)`;
      });
    };
    layoutCards();

    // Parallax orbit on pointer move
    const state = { rx: 0, ry: 0, trx: 0, try: 0, orbit: 0 };
    const damp = 0.06;
    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = gallery.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      state.try = (x - 0.5) * 32;
      state.trx = -(y - 0.5) * 10;
    };
    const onPointerMoveEvt = (e: PointerEvent) => onPointerMove(e.clientX, e.clientY);
    const onTouchMoveEvt = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onPointerMove(t.clientX, t.clientY);
    };

    // Click focus toggle
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest('.vhg-card') as HTMLElement | null;
      if (!card) return;
      const idxStr = (card as any).dataset?.index as string | undefined;
      const idx = idxStr ? parseInt(idxStr, 10) : -1;
      const focused = gallery.querySelector('.vhg-card.is-focus') as HTMLElement | null;
      if (focused && focused !== card) focused.classList.remove('is-focus');
      card.classList.toggle('is-focus');
      card.style.transition = 'transform .35s cubic-bezier(.2,.9,.2,1)';
      const t = card.style.transform.replace(') translateZ(', ')  translateZ(');
      const boost = card.classList.contains('is-focus') ? 120 : 0;
      const m = /translateZ\(([-\d.]+)px\)/.exec(t);
      const baseZ = m ? parseFloat(m[1]) : 0;
      card.style.transform = t.replace(/translateZ\(([-\d.]+)px\)/, `translateZ(${baseZ + boost}px)`);
      window.setTimeout(() => (card.style.transition = ''), 400);
      if (onSelect && idx >= 0) onSelect(idx);
    };

    const raf = () => {
      state.ry += (state.try - state.ry) * damp;
      state.rx += (state.trx - state.rx) * damp;
      state.orbit = (state.orbit + 0.10) % 360; // الدوران المستمر
      gallery.style.transform = `rotateY(${state.ry + state.orbit}deg) rotateX(${state.rx}deg)`;
      requestAnimationFrame(raf);
    };

    // Listeners bound to rootRef to keep scope local
    root.addEventListener('pointermove', onPointerMoveEvt);
    root.addEventListener('touchmove', onTouchMoveEvt, { passive: true });
    root.addEventListener('click', onClick);
    window.addEventListener('resize', layoutCards);
    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      root.removeEventListener('pointermove', onPointerMoveEvt);
      root.removeEventListener('touchmove', onTouchMoveEvt as any);
      root.removeEventListener('click', onClick);
      window.removeEventListener('resize', layoutCards);
      const c = stage.querySelector('.vhg-center');
      if (c) c.remove();
    };
  }, [panels]);

  return (
    <div ref={rootRef} className="relative">
      <div className="vhg-stage">
        <div ref={galleryRef} className="vhg-gallery" aria-label="3D floating image gallery" />
      </div>
    </div>
  );
}


import React from 'react';

type Panel = {
  src: string;
  alt: string;
  text: string;
};

interface Props {
  panels: [Panel, Panel, Panel];
}

export default function HologramTriptych({ panels }: Props) {
  const offsets = [-220, 0, 220];
  const rots = [-10, 0, 10];
  return (
    <div className="relative">
      <div className="holo-bg-blur" aria-hidden="true" />
      <div className="holo-stage holo-stage-compact">
        {panels.map((p, i) => (
          <div
            key={i}
            className="holo-panel"
            style={{ transform: `translate3d(${offsets[i]}px, 0px, ${i===1?0:-80}px) rotateX(-8deg) rotateY(${rots[i]}deg)`, animationDelay: `${i*0.12}s` }}
          >
            <div className="holo-panel-glow" />
            <img src={p.src} alt={p.alt} className="holo-img" loading="lazy" />
            <div className="holo-reflection" aria-hidden="true" />
            <div className="holo-border" aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid md:grid-cols-3 gap-4 md:gap-6">
        {panels.map((p, i) => (
          <div key={i} className="card-neon p-4">
            <p className="text-white/90 text-sm md:text-base leading-7">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


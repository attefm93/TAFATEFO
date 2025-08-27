import React, { useEffect, useState } from 'react';
import NavNeonButton from './NavNeonButton';
import LogoMark from './LogoMark';

type Variant = 'green' | 'pink' | 'blue';

interface NavItem {
  label: string;
  to: string;
}

const baseItems: NavItem[] = [
  { label: 'HOME', to: '/' },
  { label: 'OUR WORKS', to: '/works' },
  { label: 'SKILLS', to: '/skills' },
  { label: 'ABOUT', to: '/about' },
  { label: 'CONTACT', to: '/contact' },
  { label: 'LOGIN', to: '/login' },
];

const variants: Variant[] = ['green', 'pink', 'blue'];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [modeIdx, setModeIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setModeIdx((i) => (i + 1) % variants.length);
    }, 1500); // rotate between green, pink, blue every 1.5s
    return () => clearInterval(id);
  }, []);

  const mode = variants[modeIdx];

  return (
    <nav className="fixed top-0 inset-x-0 z-30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <LogoMark />

            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current mt-1.5" />
              <span className="block w-5 h-0.5 bg-current mt-1.5" />
            </button>

            <ul className="hidden md:flex items-center gap-3 text-sm font-semibold">
              {baseItems.map((item) => (
                <li key={item.to}>
                  <NavNeonButton to={item.to} variant={mode as Variant}>{item.label}</NavNeonButton>
                </li>
              ))}
            </ul>
          </div>

          {open && (
            <div className="md:hidden px-4 pb-4">
              <ul className="grid gap-2">
                {baseItems.map((item) => (
                  <li key={item.to}>
                    <NavNeonButton to={item.to} variant={mode as Variant} className="w-full justify-center" onClick={() => setOpen(false)}>
                      {item.label}
                    </NavNeonButton>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
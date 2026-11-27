"use client";
import { useEffect, useState } from "react";

const links = [
  ['#floor-plan', 'The building'], ['#site-area', 'The site'], ['#elevation', 'Drawings'],
  ['#site-dev', 'Timeline'], ['#process', 'Process'], ['#specifications', 'Materials'],
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive('#' + entry.target.id); });
    }, { rootMargin: '-15% 0px -60% 0px' });
    links.forEach(([href]) => { const section = document.querySelector(href); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('nav-hamburger')?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);
  return (
    <header className="coastal-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-6 h-20">
          <a href="#hero" className="flex items-center gap-3" aria-label="NGC architecture, back to top" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M6 29V13L20 6l14 7v16M12 29V17l8-4 8 4v12M6 34h28M20 13v21" stroke="currentColor" strokeWidth="1.4" /></svg></span>
            <span className="text-stone-100 text-sm tracking-[0.18em] font-semibold">NGC<span className="block text-[9px] tracking-[0.2em] font-normal text-stone-500 mt-1">ARCHITECTURE</span></span>
          </a>
          <div className="hidden lg:flex items-center gap-6">{links.map(([href,label]) => <a key={href} href={href} aria-current={active === href ? 'location' : undefined} className={`nav-link ${active === href ? 'is-active' : ''}`}>{label}</a>)}</div>
          <a href="#floor-plan" className="hidden lg:inline-flex coastal-secondary text-xs">Explore in 3D <span aria-hidden="true">↗</span></a>
          <button id="nav-hamburger" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(value => !value)} className="lg:hidden border border-stone-700 rounded-full px-4 py-2 text-sm text-stone-200">{menuOpen ? 'Close ×' : 'Menu ☰'}</button>
        </div>
        <div id="mobile-navigation" hidden={!menuOpen} className="lg:hidden pb-5 border-t border-stone-800"><div className="grid grid-cols-2 gap-2 pt-4">{links.map(([href,label]) => <a key={href} href={href} className={`nav-link p-3 rounded-lg ${active === href ? 'is-active bg-stone-900' : ''}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</div></div>
      </nav>
    </header>
  );
}

"use client";
import { useRef, useState } from "react";
import { elevationDrawings } from "@/lib/elevationDrawings";

export default function ElevationSection() {
  const [active, setActive] = useState('front');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 500, y: 115.52 });
  const [detail, setDetail] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const view = elevationDrawings.find(item => item.id === active)!;
  const height = view.height / view.width * 1000;
  const move = (x: number, y: number) => setCenter({ x: Math.max(0, Math.min(1000, x)), y: Math.max(0, Math.min(height, y)) });
  const reset = () => { setZoom(1); setCenter({ x: 500, y: height / 2 }); setDetail(null); };
  const changeZoom = (factor: number) => setZoom(value => Math.max(1, Math.min(5, value * factor)));
  return (
    <section id="elevation" className="py-24 bg-stone-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-architect-500 text-xs uppercase tracking-[0.3em] mb-3">03 — Elevations & sections · A06–A08</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-serif text-4xl md:text-5xl text-stone-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              Architectural Elevations
              <span className="block text-architect-400 italic text-3xl mt-1">Outside and Through the Building</span>
            </h2>
            <p className="max-w-sm text-stone-400 text-sm leading-relaxed">Explore all four exterior faces, then look through the building with two section cuts. Zoom in to follow the windows, entrances, stairs, and room details.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Choose an elevation or section">
          {elevationDrawings.map(item => <button key={item.id} aria-pressed={active === item.id} onClick={() => {
            setActive(item.id); setZoom(1); setCenter({ x: 500, y: item.height / item.width * 500 }); setDetail(null);
          }} className={`px-4 py-3 text-xs border transition-colors ${active === item.id ? 'bg-architect-600 border-architect-600 text-stone-950 font-semibold' : 'border-stone-700 text-stone-300 hover:border-architect-500'}`}>{item.label}</button>)}
        </div>
        <div className="border border-stone-800 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-900">
            <div><h3 className="text-stone-100 font-medium">{view.label}</h3><p className="text-xs text-stone-400 mt-1">Sheet {view.sheet} · Source scale 1:250</p></div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 border border-stone-600 text-stone-100 disabled:opacity-30" aria-label="Zoom out drawing" disabled={zoom <= 1} onClick={() => changeZoom(1 / 1.4)}>−</button>
              <span className="w-12 text-center text-xs text-stone-300" aria-live="polite">{Math.round(zoom * 100)}%</span>
              <button className="w-10 h-10 border border-stone-600 text-stone-100 disabled:opacity-30" aria-label="Zoom in drawing" disabled={zoom >= 5} onClick={() => changeZoom(1.4)}>+</button>
              <button className="h-10 px-3 border border-stone-600 text-sm text-stone-100" onClick={reset}>Fit drawing</button>
            </div>
          </div>
          <svg role="img" aria-label={`${view.label}, architectural drawing from sheet ${view.sheet}. Use the zoom buttons and drag to pan.`}
            tabIndex={0} className={`block w-full h-[300px] sm:h-[460px] bg-stone-900 touch-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-architect-400 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            viewBox={`${center.x - 500 / zoom} ${center.y - height / zoom / 2} ${1000 / zoom} ${height / zoom}`}
            onPointerDown={event => {
              if (event.button !== 0) return;
              drag.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true);
            }}
            onPointerMove={event => {
              if (!drag.current) return;
              const matrix = event.currentTarget.getScreenCTM();
              if (!matrix) return;
              const dx = (event.clientX - drag.current.x) / matrix.a;
              const dy = (event.clientY - drag.current.y) / matrix.d;
              drag.current = { x: event.clientX, y: event.clientY };
              setCenter(previous => ({ x: Math.max(0, Math.min(1000, previous.x - dx)), y: Math.max(0, Math.min(height, previous.y - dy)) }));
            }}
            onPointerUp={event => { drag.current = null; setDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerCancel={() => { drag.current = null; setDragging(false); }}
            onKeyDown={event => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'].includes(event.key)) event.preventDefault();
              if (event.key === 'ArrowLeft') move(center.x - 50 / zoom, center.y);
              if (event.key === 'ArrowRight') move(center.x + 50 / zoom, center.y);
              if (event.key === 'ArrowUp') move(center.x, center.y - 30 / zoom);
              if (event.key === 'ArrowDown') move(center.x, center.y + 30 / zoom);
              if (event.key === '+' || event.key === '=') changeZoom(1.4);
              if (event.key === '-') changeZoom(1 / 1.4);
              if (event.key === 'Home') reset();
            }}>
            <title>{`${view.label} — New Government Center, E. B. Magalona`}</title>
            <image href={`/drawings/elevations/${view.id}.png`} x="0" y="0" width="1000" height={height} />
            {detail !== null && <circle cx={view.details[detail].x * 10} cy={view.details[detail].y / 100 * height} r={12 / zoom} fill="none" stroke="#286e72" strokeWidth={3 / zoom} />}
          </svg>
          <p className="px-4 py-3 text-xs text-stone-400 border-t border-stone-800">Drag to pan. Use + and − to zoom, or select a detail below. Keyboard controls: arrow keys, + / −, and Home to fit.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="text-sm leading-relaxed text-stone-400"><p>{view.description}</p><p className="text-xs mt-4 text-stone-500">Original architectural drawing, cropped from sheet {view.sheet}. Dimensions and level markers are preserved. Screen zoom changes the displayed scale.</p></div>
          <div className="lg:col-span-2 grid sm:grid-cols-3 gap-3">
            {view.details.map((item, index) => <button key={item.title} aria-pressed={detail === index} onClick={() => {
              setDetail(index); setZoom(2.4); setCenter({ x: item.x * 10, y: item.y / 100 * height });
            }} className={`text-left p-4 border transition-colors ${detail === index ? 'border-architect-500 bg-architect-600/10' : 'border-stone-800 hover:border-stone-600'}`}>
              <span className="text-xs text-architect-400">0{index + 1} · Inspect detail ↗</span>
              <span className="block text-sm text-stone-100 mt-2 mb-2">{item.title}</span><span className="block text-xs leading-relaxed text-stone-400">{item.text}</span>
            </button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

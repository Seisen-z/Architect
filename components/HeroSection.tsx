import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero" className="coastal-hero">
      <div className="max-w-7xl mx-auto px-6 pt-36 pb-16 lg:pt-44 lg:pb-24">
        <div className="flex items-center justify-between gap-4 mb-10 text-xs text-stone-500">
          <span className="uppercase tracking-[0.22em]">Architecture thesis / Civic design</span>
          <span className="hidden sm:block">E. B. Magalona, Negros Occidental</span>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-4 items-center">
          <div className="lg:col-span-5 relative z-10">
            <p className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-architect-500 mb-6"><span className="w-8 h-px bg-architect-500" /> A place for the community</p>
            <h1 className="hero-title">New Government<br /><em>Center.</em></h1>
            <p className="text-lg text-stone-400 mt-5">Enrique B. Magalona</p>
            <p className="max-w-md text-sm sm:text-base text-stone-500 leading-relaxed mt-6">Explore a civic space designed around public service. Walk through the building, read the drawings, and discover how the proposal comes together.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a className="coastal-primary" href="#floor-plan">Explore the building <span aria-hidden="true">↗</span></a>
              <a className="coastal-secondary" href="#elevation">View the drawings <span aria-hidden="true">↓</span></a>
            </div>
            <div className="mt-10 pt-6 border-t border-stone-800 max-w-md flex flex-wrap gap-x-8 gap-y-4 text-xs text-stone-500">
              <div><span className="block text-[10px] uppercase tracking-widest mb-1">Design by</span><span className="text-stone-200">Erica Mae D. Pancho</span></div>
              <div><span className="block text-[10px] uppercase tracking-widest mb-1">Academic adviser</span><span className="text-stone-200">Ar. Gary Peter L. Bello, UAP</span></div>
            </div>
          </div>
          <figure className="hero-visual lg:col-span-7">
            <div className="hero-orbit" aria-hidden="true" />
            <span className="hero-watermark" aria-hidden="true">NGC</span>
            <div className="relative aspect-[1.3] sm:aspect-[1.5] w-full">
              <Image src="/images/ngc-model.png" alt="Three-dimensional model of the Government Center showing its courtyard, curved entrance canopy, parking and landscaping" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain mix-blend-multiply" />
            </div>
            <figcaption className="relative flex items-center justify-between gap-4 px-5 pb-5 text-[11px] text-stone-500"><span><span className="inline-block w-1.5 h-1.5 rounded-full bg-architect-500 mr-2" />The proposal in perspective</span><a href="#floor-plan" className="text-architect-500 underline underline-offset-4">Open 360° model ↗</a></figcaption>
          </figure>
        </div>
        <div className="hero-facts grid grid-cols-2 lg:grid-cols-4 mt-12 lg:mt-16">
          {[
            ['37,581', 'm² site area', 'Space for civic life'],
            ['03', 'building levels', 'Connected by a central courtyard'],
            ['06', 'elevations & sections', 'Read the building from every side'],
            ['360°', 'interactive model', 'Explore at your own pace'],
          ].map(([value,label,note]) => <div key={label} className="p-5 sm:p-7"><div className="flex items-baseline gap-2"><span className="font-serif text-3xl sm:text-4xl text-stone-100">{value}</span><span className="text-xs text-stone-500">{label}</span></div><p className="text-xs text-stone-500 mt-2">{note}</p></div>)}
        </div>
      </div>
    </section>
  );
}

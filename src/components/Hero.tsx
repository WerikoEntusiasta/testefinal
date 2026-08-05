import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Flame, Shield, Award, Wrench } from 'lucide-react';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic CMS state
  const [title, setTitle] = useState('Menos Café no Chão. Mais Economia de Diesel. Mais Lucro na Colheita.');
  const [description, setDescription] = useState(
    'Não somos estreantes. A AgroPasi carrega 60 anos de indústria familiar para dentro do campo. Cada implemento que fabricamos nasce com um objetivo claro: trabalhar mais com menos combustível — e deixar menos café no chão.'
  );
  const [badge, setBadge] = useState('FAMÍLIA INDUSTRIAL DESDE 1960');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1600'
  );

  const loadCmsData = () => {
    try {
      const stored = localStorage.getItem('agropasi_cms_hero');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.badge) setBadge(data.badge);
        if (data.photoUrl) setPhotoUrl(data.photoUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCmsData();

    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    const handleCmsUpdate = () => {
      loadCmsData();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('storage_updated', handleCmsUpdate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage_updated', handleCmsUpdate);
    };
  }, []);

  const renderHighlightedTitle = (text: string) => {
    const target = 'Mais Economia de Diesel.';
    if (text.includes(target)) {
      const parts = text.split(target);
      return (
        <>
          {parts[0]}<span className="text-[#d48743]">{target}</span>{parts[1]}
        </>
      );
    }
    return text;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section 
      id="inicio" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[85vh] flex items-center bg-zinc-950 text-zinc-150 overflow-hidden py-16"
    >
      {/* Immersive Editorial background with dual-gradient overlays for high contrast with white theme */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-75 ease-out select-none pointer-events-none"
        style={{
          transform: `translateY(${Math.min(scrollY * 0.35, 300)}px) scale(${1 + Math.min(scrollY * 0.0005, 0.15)})`
        }}
      >
        <img
          src={photoUrl}
          alt="Trator trabalhando no campo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-[0.25] filter grayscale contrast-125 brightness-105"
        />
        {/* Horizontal gradient to keep left (text) side clean and white, while letting image show on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/20" />
        {/* Vertical gradient to fade out at the bottom transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main message */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#262b3f]/10 border border-[#262b3f]/20 px-3 py-1.5 rounded-full text-[#d48743] text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-zinc-100 leading-tight whitespace-pre-line">
              {title.includes('\n') ? (
                <>
                  {title.split('\n')[0]} <br />
                  <span className="text-[#d48743]">{title.split('\n').slice(1).join('\n')}</span>
                </>
              ) : (
                renderHighlightedTitle(title)
              )}
            </h1>

            <p className="text-zinc-350 text-base sm:text-lg max-w-xl leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#produtos"
                className="inline-flex items-center justify-center bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-sm font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-900/20 cursor-pointer"
                id="hero-products-btn"
              >
                VER IMPLEMENTOS PARA CAFÉ
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="#calculadora"
                className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 py-3.5 px-6 rounded-xl transition-all text-sm font-bold uppercase tracking-wider cursor-pointer"
                id="hero-calc-btn"
              >
                Calcular Economia RPM
              </a>
            </div>

            {/* Value pillars indicators */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800/60 max-w-lg">
              <div>
                <span className="block text-xl font-bold font-mono text-[#d48743]">DESDE 1960</span>
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">NA INDÚSTRIA</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-[#d48743]">-20%</span>
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">CONSUMO DE DIESEL</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-zinc-200" style={{ color: '#d48743' }}>100%</span>
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">FABRICAÇÃO PRÓPRIA</span>
              </div>
            </div>
          </div>

          {/* Graphical badge / Promo space with Mouse Interactive Parallax Tilt */}
          <div 
            className="lg:col-span-5 flex justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg) translateY(${Math.min(scrollY * 0.1, 80)}px)`
            }}
          >
            <div className="relative w-full max-w-md bg-zinc-900/60 border border-zinc-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-[#d48743] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                Lançamento Rancheiro
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#d48743] tracking-wider">Principal Equipamento</span>
                <h3 className="text-xl font-bold text-zinc-100 font-display">VarreFort-S</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Engrenagens tratadas termicamente em nossa própria metalúrgica. Feito para trabalhar com baixo RPM do trator e colher toda a riqueza que fica no chão do cafezal.
                </p>
              </div>

              {/* Miniature Technical Spec Grid */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/80">
                <div className="flex items-center space-x-2 text-xs">
                  <Wrench className="w-4 h-4 text-[#d48743] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-zinc-500">Acoplamento</span>
                    <strong className="text-zinc-200">3 Pontos Cat II</strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <Flame className="w-4 h-4 text-[#d48743] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-zinc-500">Operação</span>
                    <strong className="text-zinc-200 font-mono">1300-1500 RPM</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#produtos"
                  className="w-full inline-flex items-center justify-center bg-zinc-150 hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg border border-zinc-800 transition"
                >
                  Ver Ficha e Manual Técnico
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

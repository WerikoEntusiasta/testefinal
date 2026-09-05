import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Flame, Shield, Award, Wrench, Calculator } from 'lucide-react';

interface HeroProps {
  onSelectProduct?: (id: string) => void;
  onNavigate?: (hash?: string) => void;
}

export default function Hero({ onSelectProduct, onNavigate }: HeroProps) {
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
      {/* Immersive Editorial background */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main message */}
          <div className="lg:col-span-7 space-y-6">
            {/* Badge positioned above the title */}
            <div className="inline-flex items-center space-x-2 bg-[#d48743]/15 border border-[#d48743]/30 px-3.5 py-1.5 rounded-full text-[#d48743] text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>{badge || 'LANÇAMENTO: ARRUADOR VARREFORT-S'}</span>
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
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('#produtos');
                  } else {
                    const el = document.getElementById('produtos');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-sm font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-900/20 cursor-pointer"
                id="hero-products-btn"
              >
                VER IMPLEMENTOS PARA CAFÉ
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              
              <button
                onClick={() => {
                  if (onSelectProduct) {
                    onSelectProduct('varrefort-s');
                  } else if (onNavigate) {
                    onNavigate('#contato');
                  } else {
                    const el = document.getElementById('contato');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 py-3.5 px-6 rounded-xl transition-all text-sm font-bold uppercase tracking-wider cursor-pointer"
                id="hero-calc-btn"
              >
                <Calculator className="w-4 h-4 mr-2 text-[#d48743]" />
                Calcular Economia RPM
              </button>
            </div>

            {/* Value pillars indicators (Corrigido: 100% Nacional) */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800/60 max-w-lg">
              <div>
                <span className="block text-xl font-bold font-mono text-[#d48743]">DESDE 1960</span>
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">TRADIÇÃO INDUSTRIAL</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-[#d48743]">-20%</span>
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">CONSUMO DE DIESEL</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-[#d48743]">100%</span>
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">NACIONAL</span>
              </div>
            </div>
          </div>

          {/* Graphical Card do VarreFort-S — Foto real em campo como protagonista com ficha sobreposta */}
          <div 
            className="lg:col-span-5 flex justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg) translateY(${Math.min(scrollY * 0.1, 80)}px)`
            }}
          >
            <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl transition hover:border-zinc-700">
              
              {/* Foto Real de Campo como Protagonista */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-zinc-950">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800"
                  alt="Arruador de Café VarreFort-S operando na lavoura cafeeira"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                
                {/* Badges superiores flutuantes */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="bg-zinc-950/80 backdrop-blur-md border border-zinc-700 text-[#d48743] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full font-mono">
                    Implemento em Ação
                  </span>
                  <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full shadow-lg tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Pronta Entrega
                  </span>
                </div>

                {/* Ficha Técnica Semi-transparente sobreposta no canto inferior da imagem */}
                <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/90 p-3 rounded-xl grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-[#d48743]/20 text-[#d48743] rounded-lg shrink-0">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-400 uppercase font-semibold">Acoplamento</span>
                      <strong className="text-zinc-100 text-xs">3 Pontos Cat II</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-[#d48743]/20 text-[#d48743] rounded-lg shrink-0">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-400 uppercase font-semibold">Baixa Rotação</span>
                      <strong className="text-[#d48743] text-xs font-mono">1.300 - 1.500 RPM</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Complementares e Ação */}
              <div className="p-5 sm:p-6 space-y-4 bg-zinc-900/60">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-zinc-100 font-sans tracking-tight">Arruador VarreFort-S</h3>
                    <span className="text-xs font-mono font-bold text-[#d48743] bg-[#d48743]/10 px-2.5 py-0.5 rounded border border-[#d48743]/20">
                      Até -20% Diesel
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Engrenagens tratadas termicamente em nossa própria metalúrgica. Feito para trabalhar com baixo RPM do trator e aproveitar os grãos que ficam no chão do cafezal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct('varrefort-s');
                    } else if (onNavigate) {
                      onNavigate('#produtos');
                    }
                  }}
                  className="w-full inline-flex items-center justify-center bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition cursor-pointer shadow-md active:scale-[0.99]"
                >
                  Ver Ficha e Manual Técnico
                  <ArrowRight className="w-4 h-4 ml-1.5 text-zinc-900" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

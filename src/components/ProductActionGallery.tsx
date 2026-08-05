import React, { useState, useEffect } from 'react';
import { Play, Eye, X, Compass, Clock, Award, Sliders, MonitorPlay } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'video' | 'photo' | 'factory';
  categoryLabel: string;
  mediaUrl: string;
  description: string;
  location?: string;
  duration?: string;
  videoUrl?: string;
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'act_vid_1',
    title: 'Arruador de Café AgroPasi Operando em Declive',
    category: 'video',
    categoryLabel: 'Vídeo Operacional',
    mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
    description: 'Veja o varredor limpando as linhas sob os cafeeiros no espalhado, organizando grãos e operando a 1.400 RPM com trator comum.',
    location: 'Alta Mogiana - Franca/SP',
    duration: '01:45'
  },
  {
    id: 'act_vid_2',
    title: 'Drone: Enleiramento Rápido de Grãos',
    category: 'video',
    categoryLabel: 'Vídeo Aéreo',
    mediaUrl: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=600',
    description: 'Imagens aéreas mostrando o alinhamento central uniforme obtido em uma lavoura de café adensada de 4 anos.',
    location: 'Sul de Minas - Varginha/MG',
    duration: '00:58'
  },
  {
    id: 'act_pic_1',
    title: 'Acréscimo de Linha: Zero Perda na Varrição',
    category: 'photo',
    categoryLabel: 'Fotografia de Campo',
    mediaUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
    description: 'Grãos perfeitamente varridos e acumulados longe das saias das árvores, desobstruindo a passagem dos colhedores manuais.',
    location: 'Cerrado Mineiro - Patrocínio/MG'
  },
  {
    id: 'act_fac_1',
    title: 'Corte Laser de Chapa de Aço ASTM-36',
    category: 'factory',
    categoryLabel: 'Estrutura Industrial',
    mediaUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=605',
    description: 'Chassis estruturais do arruador recortados com precisão micrométrica sobre tecnologia laser de fibra ótica de alta potência.',
    location: 'Metalúrgica AgroPasi - Catanduva/SP'
  },
  {
    id: 'act_fac_2',
    title: 'Acabamento e Engenharia Mecânica de Precisão',
    category: 'factory',
    categoryLabel: 'Estrutura Industrial',
    mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    description: 'Nossa equipe de engenharia revisando as engrenagens de transmissão tratadas contra corrosão e desgaste mecânico severo.',
    location: 'Central Fabril - Catanduva/SP'
  },
  {
    id: 'act_pic_2',
    title: 'Acoplamento no Terceiro Ponto Traseiro',
    category: 'photo',
    categoryLabel: 'Fotografia de Campo',
    mediaUrl: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&q=80&w=600',
    description: 'Detalhe do engate robusto universal que facilita o trabalho de manobra em passagens estreitas de cafezal.',
    location: 'Norte Pioneiro - Paraná'
  }
];

export default function ProductActionGallery() {
  const [filter, setFilter] = useState<'all' | 'video' | 'photo' | 'factory'>('all');
  const [activeMedia, setActiveMedia] = useState<GalleryItem | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [simulatedTime, setSimulatedTime] = useState<number>(0);
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);

  // Load items from localStorage
  const loadGalleryItems = () => {
    const stored = localStorage.getItem('agropasi_cms_gallery');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          let migrated = false;
          const updated = parsed.map(item => {
            if (item.mediaUrl && item.mediaUrl.includes('1605000797439-75a1500dd8b8')) {
              migrated = true;
              return {
                ...item,
                mediaUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600'
              };
            }
            return item;
          });
          if (migrated) {
            localStorage.setItem('agropasi_cms_gallery', JSON.stringify(updated));
          }
          setItems(updated);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setItems(GALLERY_ITEMS);
  };

  useEffect(() => {
    loadGalleryItems();
    window.addEventListener('storage_updated', loadGalleryItems);
    return () => window.removeEventListener('storage_updated', loadGalleryItems);
  }, []);

  // Playback timer simulation
  useEffect(() => {
    let interval: any;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setSimulatedTime(prev => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 1.5;
        });
      }, 250);
    } else {
      setSimulatedTime(0);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying]);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const openPlayer = (item: GalleryItem) => {
    setActiveMedia(item);
    if (item.category === 'video') {
      setIsVideoPlaying(true);
    }
  };

  const closePlayer = () => {
    setActiveMedia(null);
    setIsVideoPlaying(false);
    setSimulatedTime(0);
  };

  return (
    <section id="galeria" className="py-20 bg-zinc-950 text-white scroll-mt-10 relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-950/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              Imagens Reais do Campo
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
              Galeria <span className="text-[#d48743]">"Produto em Ação"</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
              Confira com seus próprios olhos o VarreFort-S trabalhando nas lavouras e o rigor industrial adotado em cada etapa da nossa fabricação.
            </p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-1.5 self-start">
            {[
              { id: 'all', label: 'Tudo' },
              { id: 'video', label: 'Vídeos de Campo' },
              { id: 'photo', label: 'Fotos Reais' },
              { id: 'factory', label: 'Estrutura Própria' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                type="button"
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer border ${
                  filter === tab.id
                    ? 'bg-[#d48743] text-white border-[#d48743] shadow-md shadow-black/20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:border-[#d48743]/30 hover:text-[#d48743]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden group hover:border-zinc-700 transition duration-300"
            >
              {/* Media Container Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-neutral-950">
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                
                {/* Visual Cover Indicators */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-all flex items-center justify-center">
                  {item.category === 'video' ? (
                    <button
                      onClick={() => openPlayer(item)}
                      type="button"
                      className="p-4 bg-[#d48743] hover:bg-[#c27a41] text-white rounded-full shadow-lg shadow-black/40 hover:scale-110 transition duration-300 flex items-center justify-center cursor-pointer"
                      title="Assista ao vídeo"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={() => openPlayer(item)}
                      type="button"
                      className="p-3 bg-black/85 text-white rounded-full opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition duration-300 flex items-center justify-center cursor-pointer"
                      title="Ampliar Imagem"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Duration Badge for Videos */}
                {item.category === 'video' && item.duration && (
                  <span className="absolute bottom-3 right-3 bg-black/85 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                    {item.duration} MIN
                  </span>
                )}

                {/* YouTube indicator */}
                {item.category === 'video' && item.videoUrl && (
                  <span className="absolute bottom-3 left-3 bg-red-600/95 border border-red-750 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                    YouTube
                  </span>
                )}

                {/* Category tag */}
                <span className="absolute top-3 left-3 bg-black/80 border border-white/10 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                  {item.categoryLabel}
                </span>
              </div>

              {/* Text metadata */}
              <div className="p-5 space-y-2">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-400">
                  <Compass className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{item.location}</span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-[#d48743] transition line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* Dynamic Video & Image Pop-up Player Modal (Iframe constraint friendly!) */}
        {activeMedia && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative">
              
              {/* Close Button badge */}
              <button
                onClick={closePlayer}
                type="button"
                className="absolute top-4 right-4 p-2 bg-zinc-950/80 hover:bg-zinc-950 text-zinc-400 hover:text-[#d48743] rounded-full transition border border-zinc-800 z-10 cursor-pointer"
                title="Fechar reprodutor"
                id="close-player-modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Player Body */}
              <div className="relative bg-zinc-950 aspect-video">
                
                {/* If standard image */}
                {activeMedia.category !== 'video' ? (
                  <img
                    src={activeMedia.mediaUrl}
                    alt={activeMedia.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                ) : getYouTubeId(activeMedia.videoUrl) ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeId(activeMedia.videoUrl)}?autoplay=1&rel=0`}
                    title={activeMedia.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  /* Customized Interactive Video Simulator (Avoids third-party cookies or blockages inside sandboxed iframes) */
                  <div className="absolute inset-0 flex flex-col justify-between p-6">
                    {/* Background screen looping photo with filter and blur */}
                    <div className="absolute inset-0 -z-10">
                      <img
                        src={activeMedia.mediaUrl}
                        alt="Background loop"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter brightness-75 blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-emerald-950/20 mix-blend-overlay" />
                    </div>

                    {/* Top title */}
                    <div className="bg-zinc-950/50 backdrop-blur-sm rounded-lg p-3 self-start max-w-md border border-zinc-850">
                      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Simulador de Vídeo AgroPasi HD</span>
                      <h4 className="text-xs font-bold text-white leading-tight mt-0.5">{activeMedia.title}</h4>
                    </div>

                    {/* Visual overlay dynamic play/pause indicator */}
                    <div className="flex items-center justify-center absolute inset-0">
                      {!isVideoPlaying ? (
                        <button
                          onClick={() => setIsVideoPlaying(true)}
                          type="button"
                          className="p-5 bg-emerald-600 text-zinc-950 rounded-full shadow-lg cursor-pointer"
                        >
                          <Play className="w-6 h-6 fill-current" />
                        </button>
                      ) : (
                        <div className="text-center bg-zinc-950/80 backdrop-blur-sm rounded-xl py-3 px-5 border border-zinc-850 animate-pulse">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">Implemento Operando no Cafezal</span>
                          <span className="text-xs text-zinc-300">RPM Motor: 1.350 | Velocidade: 4.8 km/h</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom controls panel */}
                    <div className="bg-zinc-950/90 backdrop-blur-md rounded-xl p-3 border border-zinc-800 space-y-1.5 z-15 mt-auto">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-ping" />
                          AO VIVO (CAMPO)
                        </span>
                        <span>{Math.round(simulatedTime)}% Processado ({activeMedia.duration || '01:00'} min)</span>
                      </div>

                      {/* Progress Bar interactive slider */}
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${simulatedTime}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-semibold">
                        <button
                          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                          type="button"
                          className="text-emerald-600 hover:text-[#d48743] transition"
                        >
                          {isVideoPlaying ? 'PAUSAR DEMONSTRAÇÃO' : 'RETOMAR REPRODUÇÃO'}
                        </button>
                        <span className="text-zinc-500">Filtrado Contra Vibrações</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Metadatas Details */}
              <div className="p-6 bg-zinc-900 border-t border-zinc-805 space-y-2">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>{activeMedia.location}</span>
                  {activeMedia.category === 'video' && <span>• Vídeo Técnico</span>}
                </div>
                <h3 className="text-lg font-bold text-zinc-150">{activeMedia.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {activeMedia.description}
                </p>
                
                <div className="pt-3 border-t border-zinc-850 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-sans">© 2026 AgroPasi Implementos Agrícolas Ltda.</span>
                  <a
                    href="#contato"
                    onClick={closePlayer}
                    className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs px-4 py-1.5 rounded-lg transition"
                  >
                    Quero Saber Preço
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

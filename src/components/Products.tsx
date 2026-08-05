import React, { useState, useEffect } from 'react';
import { PackageOpen, ArrowRight, Settings, Sparkles, ShieldCheck, Factory, HardHat } from 'lucide-react';
import { sanitizeOverrides } from '../lib/api';

export interface CustomProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  specs?: string[];
}

interface ProductsProps {
  onSelectProduct: (id: string) => void;
}

export default function Products({ onSelectProduct }: ProductsProps) {
  // Custom products state (from Admin Portal)
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [mainOverrides, setMainOverrides] = useState<Record<string, any>>({});

  const loadCustomProducts = () => {
    try {
      const stored = localStorage.getItem('agropasi_custom_products');
      if (stored) {
        setCustomProducts(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMainOverrides = () => {
    try {
      const stored = localStorage.getItem('agropasi_main_products_overrides');
      if (stored) {
        setMainOverrides(sanitizeOverrides(JSON.parse(stored)));
      } else {
        setMainOverrides({});
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCustomProducts();
    loadMainOverrides();
    const handleUpdate = () => {
      loadCustomProducts();
      loadMainOverrides();
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  // Three core main products
  const mainProducts = [
    {
      id: 'varrefort-s',
      name: mainOverrides['varrefort-s']?.name || 'VarreFort-S',
      description: mainOverrides['varrefort-s']?.description || 'O arruador soprador projetado para trabalhar em baixa rotação — 1.300 a 1.500 RPM — garantindo ventilação máxima, zero perdas na varrição e menos diesel a cada hora de trabalho.',
      availability: 'Pronta Entrega / Sob Consulta',
      image: mainOverrides['varrefort-s']?.image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
      badge: mainOverrides['varrefort-s']?.badge !== undefined ? mainOverrides['varrefort-s']?.badge : 'Destaque de Vendas',
      tag: mainOverrides['varrefort-s']?.tag || 'Alta Performance',
      specs: ['Baixo Giro (1300 RPM)', 'Turbina Balanceada', 'Economia de Diesel']
    },
    {
      id: 'varremax-x',
      name: mainOverrides['varremax-x']?.name || 'Recolhedora de Café AgroPasi',
      description: mainOverrides['varremax-x']?.description || 'Planejada sob o mesmo processo industrial que originou o VarreFort-S — testada, validada em campo e construída para durar. Uma máquina concebida para o cafeicultor que não aceita perda de performance na recolha.',
      availability: 'Pré-Lançamento (Breve Disponível)',
      image: mainOverrides['varremax-x']?.image || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600',
      badge: mainOverrides['varremax-x']?.badge !== undefined ? mainOverrides['varremax-x']?.badge : 'Próximo Lançamento AgroPasi',
      tag: mainOverrides['varremax-x']?.tag || 'Colheita Mecanizada',
      specs: ['Peneira Vibratória', 'Turbina Sucção Dupla', 'Basculante 1500L']
    },
    {
      id: 'pasiparts',
      name: mainOverrides['pasiparts']?.name || 'Peças de Reposição & Suporte Técnico',
      description: mainOverrides['pasiparts']?.description || 'Deixamos de lado esperas burocráticas por peças sob encomenda. Por termos estrutura industrial própria, garantimos disponibilidade imediata de engrenagens, eixos vedados e rolamentos — prontos para despacho rápido.',
      availability: 'Usinagem Própria / Envio em 24h',
      image: mainOverrides['pasiparts']?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      badge: mainOverrides['pasiparts']?.badge !== undefined ? mainOverrides['pasiparts']?.badge : 'Original de Fábrica',
      tag: mainOverrides['pasiparts']?.tag || 'Peças Genuínas',
      specs: ['Engrenagens Próprias', 'Aço Certificado', 'Rolamentos Genuínos']
    }
  ];

  return (
    <section id="produtos" className="py-20 bg-zinc-900 text-zinc-150 scroll-mt-10 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-[#d48743] border border-[#d48743] text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
            Nosso Portfólio Industrial
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-zinc-100 mb-4">
            Implementos Desenvolvidos para <span className="text-[#d48743]">Render no Campo</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Equipamentos robustos construídos sob rígido controle industrial próprio, configurados para entregar economia de combustível, facilidade na manutenção e altíssima produtividade.
          </p>
        </div>

        {/* 3 Core Highlighted Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {mainProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className="group flex flex-col bg-zinc-950 border border-zinc-800 hover:border-[#d48743] rounded-3xl overflow-hidden transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[#d48743]/5"
              id={`product-card-${product.id}`}
            >
              {/* Product Photo */}
              <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Photo Overlays & Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[9px] font-mono uppercase tracking-wider py-1 px-2.5 rounded-md">
                  {product.tag}
                </div>
                {product.badge && (
                  <div className="absolute top-4 right-4 bg-[#d48743] text-white text-[9px] font-extrabold uppercase py-1 px-2.5 rounded shadow-lg">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Availability Field */}
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono"
                      style={product.id === 'varrefort-s' ? { color: '#ffffff' } : undefined}
                    >
                      Disponibilidade:
                    </span>
                    <span className="text-[10px] font-extrabold text-[#d48743] uppercase tracking-wider font-mono">{product.availability}</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-bold text-zinc-100 group-hover:text-[#d48743] transition-colors font-sans tracking-tight">
                    {product.name}
                  </h3>

                  {/* Product Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* Technical highlights block */}
                {product.specs && product.specs.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {product.specs.map((spec, sidx) => {
                      const isMain = sidx === 0;
                      return (
                        <span 
                          key={sidx} 
                          className={
                            isMain 
                              ? "bg-[#d48743] border border-[#d48743] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm animate-pulse-slow"
                              : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-500 text-[9px] font-mono px-2 py-0.5 rounded"
                          }
                          style={
                            isMain 
                              ? { backgroundColor: '#d48743', color: '#ffffff', borderColor: '#d48743' }
                              : { backgroundColor: '#18181b', color: '#71717a', borderColor: '#27272a' }
                          }
                        >
                          {spec}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Footer Action Click Trigger */}
                <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-semibold text-[#d48743] group-hover:text-amber-400 transition-colors">
                  <span>
                    {product.id === 'varrefort-s' 
                      ? 'Ver Ficha Técnica & Simular Economia' 
                      : product.id === 'varremax-x' 
                        ? 'Quero ser Notificado do Lançamento' 
                        : 'Consultar Peças & Disponibilidade'}
                  </span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Owner-added Custom Products Section (Equipamentos Adicionais) */}
        {customProducts.length > 0 && (
          <div className="mt-20 mb-10 space-y-6">
            <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
              <PackageOpen className="w-5 h-5 text-[#d48743] shrink-0" />
              <h3 className="text-base font-bold uppercase tracking-wider text-zinc-100 font-mono">Equipamentos Adicionais Publicados</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customProducts.map((prod) => (
                <div key={prod.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:border-zinc-700 transition group animate-fadeIn">
                  <div className="space-y-3">
                    <div className="w-full aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 relative">
                      <img 
                        src={prod.image || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400"} 
                        alt={prod.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      {prod.badge && (
                        <div className="absolute top-2.5 right-2.5 bg-[#d48743] text-zinc-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                          {prod.badge}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Disponibilidade:</span>
                        <span className="text-[9px] font-extrabold text-[#d48743] uppercase tracking-wider font-mono">Sob Encomenda</span>
                      </div>
                      <h4 className="font-bold text-zinc-100 text-base">{prod.title}</h4>
                      <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">{prod.description}</p>
                    </div>

                    {prod.specs && prod.specs.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {prod.specs.map((spec, sidx) => {
                          const isMain = sidx === 0;
                          return (
                            <span 
                              key={sidx} 
                              className={
                                isMain 
                                  ? "bg-[#d48743]/10 border border-[#d48743]/40 text-[#d48743] text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm"
                                  : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-500 text-[9px] font-mono px-2 py-0.5 rounded"
                              }
                            >
                              {spec}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-900 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">Ref ID: {prod.id.slice(-6).toUpperCase()}</span>
                    <a 
                      href="#contato"
                      className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-[#d48743] hover:text-zinc-150 border border-zinc-800 py-1.5 px-3.5 rounded-lg text-xs font-semibold transition"
                    >
                      Solicitar Orçamento
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

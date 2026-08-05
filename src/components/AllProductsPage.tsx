import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight, Sparkles, Star, Package, Check, Phone } from 'lucide-react';
import { CustomProduct } from './Products';
import { sanitizeOverrides } from '../lib/api';
import CepLocator from './CepLocator';

interface AllProductsPageProps {
  onSelectProduct: (id: string) => void;
  onBackToHome: () => void;
}

export default function AllProductsPage({ onSelectProduct, onBackToHome }: AllProductsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [mainOverrides, setMainOverrides] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load custom products and main overrides
    try {
      const storedCustom = localStorage.getItem('agropasi_custom_products');
      if (storedCustom) {
        setCustomProducts(JSON.parse(storedCustom));
      }
      const storedOverrides = localStorage.getItem('agropasi_main_products_overrides');
      if (storedOverrides) {
        setMainOverrides(sanitizeOverrides(JSON.parse(storedOverrides)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Standard factory products
  const mainProducts = [
    {
      id: 'varrefort-s',
      name: mainOverrides['varrefort-s']?.name || 'VarreFort-S',
      description: mainOverrides['varrefort-s']?.description || 'O arruador soprador projetado para trabalhar em baixa rotação — 1.300 a 1.500 RPM — garantindo ventilação máxima, zero perdas na varrição e menos diesel a cada hora de trabalho.',
      availability: 'Pronta Entrega / Sob Consulta',
      image: mainOverrides['varrefort-s']?.image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
      badge: mainOverrides['varrefort-s']?.badge !== undefined ? mainOverrides['varrefort-s']?.badge : 'Destaque de Vendas',
      tag: 'Arruador',
      specs: ['Baixo Giro (1300 RPM)', 'Turbina Balanceada', 'Economia de Diesel', 'Sapata Dupla Antichoque']
    },
    {
      id: 'varremax-x',
      name: mainOverrides['varremax-x']?.name || 'Recolhedora de Café AgroPasi',
      description: mainOverrides['varremax-x']?.description || 'Planejada sob o mesmo processo industrial que originou o VarreFort-S — testada, validada em campo e construída para durar. Uma máquina concebida para o cafeicultor que não aceita perda de performance na recolha.',
      availability: 'Pré-Lançamento (Breve Disponível)',
      image: mainOverrides['varremax-x']?.image || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600',
      badge: mainOverrides['varremax-x']?.badge !== undefined ? mainOverrides['varremax-x']?.badge : 'Próximo Lançamento AgroPasi',
      tag: 'Recolhedora',
      specs: ['Depósito Basculante 1500L', 'Turbina Dupla de Sucção', 'Capacidade 2500 kg/h', 'Roda Baixa Compactação']
    },
    {
      id: 'pasiparts',
      name: mainOverrides['pasiparts']?.name || 'Peças de Reposição & Suporte Técnico',
      description: mainOverrides['pasiparts']?.description || 'Deixamos de lado esperas burocráticas por peças sob encomenda. Por termos estrutura industrial própria, garantimos disponibilidade imediata de engrenagens, eixos vedados e rolamentos — prontos para despacho rápido.',
      availability: 'Usinagem Própria / Envio em 24h',
      image: mainOverrides['pasiparts']?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      badge: mainOverrides['pasiparts']?.badge !== undefined ? mainOverrides['pasiparts']?.badge : 'Original de Fábrica',
      tag: 'Peças',
      specs: ['Garantia de Encaixe', 'Eixos Temperados', 'Rolamentos Genuínos', 'Despacho Rápido']
    }
  ];

  // Convert custom products to unified format
  const mappedCustom = customProducts.map(p => ({
    id: p.id,
    name: p.title,
    description: p.description,
    availability: 'Sob Encomenda / Direto de Fábrica',
    image: p.image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
    badge: p.badge || undefined,
    tag: 'Adicionais',
    specs: p.specs || []
  }));

  const allProducts = [...mainProducts, ...mappedCustom];

  // Filter categories
  const categories = [
    { id: 'todos', label: 'Todos os Equipamentos' },
    { id: 'arruador', label: 'Arruadores' },
    { id: 'recolhedora', label: 'Recolhedoras' },
    { id: 'pecas', label: 'Peças Originais' },
    { id: 'adicionais', label: 'Outros Equipamentos' },
  ];

  const filteredProducts = allProducts.filter(product => {
    // Search match
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.tag.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category match
    let matchesCategory = true;
    if (selectedCategory !== 'todos') {
      if (selectedCategory === 'arruador') {
        matchesCategory = product.tag === 'Arruador';
      } else if (selectedCategory === 'recolhedora') {
        matchesCategory = product.tag === 'Recolhedora';
      } else if (selectedCategory === 'pecas') {
        matchesCategory = product.tag === 'Peças';
      } else if (selectedCategory === 'adicionais') {
        matchesCategory = product.tag === 'Adicionais';
      }
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-zinc-950 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="border-b border-zinc-200/80 pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-[#d48743] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar ao Início
            </button>

            <div>
              <span className="inline-flex text-[11px] font-mono font-bold text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-850">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'implemento encontrado' : 'implementos disponíveis'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-150">
              Portfólio de Implementos <span className="text-[#d48743]">AgroPasi</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Explore o catálogo completo de soluções agrícolas para a cafeicultura moderna. De arruadores sopradores de alta eficiência a recolhedoras robustas de alta produtividade.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-12">
          {/* Search box - Flex inline */}
          <div className="lg:col-span-5 flex items-center bg-zinc-900/60 border border-zinc-850 rounded-xl px-4 py-3 focus-within:border-[#d48743] transition duration-200">
            <Search className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Buscar por implemento, peça ou modelo de trator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-xs text-zinc-150 placeholder-zinc-500 focus:outline-none focus:ring-0 font-mono"
            />
          </div>

          {/* Categories Horizontal Pills */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider mr-2 hidden xl:inline-block">Filtrar:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-[#d48743] text-white font-extrabold shadow-lg shadow-[#d48743]/10'
                      : 'bg-zinc-900/50 hover:bg-zinc-850 text-zinc-400 border border-zinc-850 hover:text-zinc-150'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/30 border border-zinc-850 rounded-3xl space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
              <Package className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-200">Nenhum equipamento corresponde à busca</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Tente redefinir os filtros ou digite termos diferentes como "arruador", "peças" ou "recolhedora".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('todos');
              }}
              className="text-xs font-bold text-[#d48743] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredProducts.map((product) => {
              const isCustom = product.tag === 'Adicionais';
              
              return (
                <div
                  key={product.id}
                  onClick={() => !isCustom && onSelectProduct(product.id)}
                  className={`group flex flex-col justify-between bg-zinc-900/30 border border-zinc-850 hover:border-[#d48743] rounded-3xl overflow-hidden transition-all duration-300 shadow-xl ${
                    !isCustom ? 'cursor-pointer hover:shadow-[#d48743]/5' : ''
                  }`}
                >
                  <div>
                    {/* Media display */}
                    <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                      
                      {/* Badge and tag overlay */}
                      <div className="absolute top-4 left-4 flex gap-1.5 items-center">
                        <span className="bg-zinc-950/85 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[9px] font-mono uppercase tracking-wider py-1 px-2.5 rounded-md">
                          {product.tag}
                        </span>
                      </div>

                      {product.badge && (
                        <div className="absolute top-4 right-4 bg-[#d48743] text-zinc-950 text-[9px] font-extrabold uppercase py-1 px-2.5 rounded shadow">
                          {product.badge}
                        </div>
                      )}
                    </div>

                    {/* Specifications Body */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Disponibilidade:</span>
                          <span className="text-[9px] font-extrabold text-[#d48743] uppercase tracking-wider font-mono">{product.availability}</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-[#d48743] transition-colors font-sans tracking-tight leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                          {product.description}
                        </p>
                      </div>

                      {/* Technical bullets if available */}
                      {product.specs && product.specs.length > 0 && (
                        <div className="pt-2 space-y-1.5 border-t border-zinc-900">
                          <span className="block text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider">Destaques Técnicos:</span>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            {product.specs.slice(0, 4).map((spec, sIdx) => {
                              const isMain = sIdx === 0;
                              return (
                                <div 
                                  key={sIdx} 
                                  className={`flex items-start text-[10px] font-sans ${
                                    isMain ? 'text-[#d48743] font-bold' : 'text-zinc-500'
                                  }`}
                                >
                                  <Check className={`w-3 h-3 mr-1.5 shrink-0 mt-0.5 ${
                                    isMain ? 'text-[#d48743]' : 'text-zinc-600'
                                  }`} />
                                  <span className="truncate">{spec}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer CTAs */}
                  <div className="p-6 pt-0 mt-auto">
                    {isCustom ? (
                      <a
                        href="#contato"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById('contato');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full inline-flex items-center justify-center bg-zinc-950 hover:bg-[#d48743] text-[#d48743] hover:text-zinc-950 border border-zinc-800 hover:border-transparent py-2.5 px-4 rounded-xl text-xs font-bold transition duration-300"
                      >
                        <Phone className="w-3.5 h-3.5 mr-2 shrink-0" />
                        Solicitar Orçamento de Fábrica
                      </a>
                    ) : (
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Representative CepLocator Regional Widget */}
        <div className="mt-16 sm:mt-24">
          <CepLocator variant="dark-compact" />
        </div>

        {/* Quality commitment ribbon */}
        <div className="mt-20 p-8 sm:p-10 bg-zinc-900/40 border border-zinc-850 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <h3 className="text-lg font-bold text-zinc-100 font-sans">Compromisso e Garantia de Fábrica AgroPasi</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Todos os nossos implementos contam com chassi reforçado com proteção anticorrosiva dupla, assistência técnica remota em tempo recorde de safra e amplo estoque de componentes de reposição imediata.
            </p>
          </div>
          <a
            href="https://wa.me/5517991066796?text=Olá,%20gostaria%20de%20solicitar%20uma%20cotação%20para%20a%20minha%20fazenda!"
            target="_blank"
            referrerPolicy="no-referrer"
            className="bg-[#d48743] hover:bg-[#c27a41] text-white px-6 py-3 rounded-xl text-xs font-bold transition flex items-center whitespace-nowrap shrink-0"
          >
            Falar com Engenheiro de Campo
          </a>
        </div>

      </div>
    </div>
  );
}

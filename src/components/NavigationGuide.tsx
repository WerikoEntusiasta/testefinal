import React from 'react';
import { 
  Users, 
  Settings2, 
  Calculator, 
  CheckCircle2, 
  PlayCircle, 
  HelpCircle, 
  Newspaper, 
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function NavigationGuide() {
  const guideSections = [
    {
      id: 'sobre-btn',
      title: 'Sobre Nós',
      href: '#sobre',
      icon: Users,
      accentColor: 'text-[#d48743]',
      bgColor: 'bg-[#d48743]/5 border-[#d48743]/10',
    },
    {
      id: 'produtos-btn',
      title: 'Produtos & Manuais',
      href: '#produtos',
      icon: Settings2,
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/5 border-emerald-500/10',
    },
    {
      id: 'calculadora-btn',
      title: 'Simulador de Economia',
      href: '#calculadora',
      icon: Calculator,
      accentColor: 'text-[#d48743]',
      bgColor: 'bg-[#d48743]/5 border-[#d48743]/10',
    },

    {
      id: 'galeria-btn',
      title: 'Vídeos & Demonstrações',
      href: '#galeria',
      icon: PlayCircle,
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/5 border-emerald-500/10',
    },
    {
      id: 'faq-btn',
      title: 'Dúvidas Frequentes',
      href: '#faq',
      icon: HelpCircle,
      accentColor: 'text-[#d48743]',
      bgColor: 'bg-[#d48743]/5 border-[#d48743]/10',
    },
    {
      id: 'blog-btn',
      title: 'Blog do Cafezal',
      href: '#blog',
      icon: Newspaper,
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/5 border-emerald-500/10',
    },
    {
      id: 'contato-btn',
      title: 'Encontrar Representante na Minha Região',
      href: '#contato',
      icon: MapPin,
      accentColor: 'text-[#d48743]',
      bgColor: 'bg-[#d48743]/5 border-[#d48743]/10',
    },
  ];

  return (
    <section className="bg-zinc-950/80 border-b border-zinc-900 py-10 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Elegant Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d48743]">
            Navegação Rápida
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mt-1">
            O que você está buscando hoje?
          </h2>
        </div>

        {/* Dynamic Compact Nav Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {guideSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <a
                key={section.id}
                id={section.id}
                href={section.href}
                className="group flex items-center justify-between p-3.5 bg-zinc-900/30 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-emerald-500/30 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Styled Icon */}
                  <div className={`p-2 rounded-lg border transition-all shrink-0 ${section.bgColor} group-hover:bg-zinc-900`}>
                    <IconComponent className={`w-4 h-4 ${section.accentColor}`} />
                  </div>
                  
                  {/* Clean text label */}
                  <span className="text-[12px] sm:text-[13px] font-semibold text-zinc-150 group-hover:text-zinc-100 transition-colors duration-200 truncate">
                    {section.title}
                  </span>
                </div>

                {/* Micro chevron arrow trigger */}
                <ChevronRight className="w-4 h-4 text-zinc-650 group-hover:text-[#d48743] group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}

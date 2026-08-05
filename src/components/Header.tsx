import React, { useState } from 'react';
import { Menu, X, Landmark, Sliders, Smartphone, Lock, ShieldCheck } from 'lucide-react';
import AgroPasiLogo from './AgroPasiLogo';

interface HeaderProps {
  onNavigate?: (hash?: string) => void;
  logoUrl?: string;
}

export default function Header({ onNavigate, logoUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Início', href: '#inicio' },
    { label: 'Produtos', href: '#produtos' },
    { label: 'Peças', href: '#pecas' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contato', href: '#contato' },
  ];

  const handleLinkClick = (href: string) => {
    if (onNavigate) onNavigate(href);
  };

  const handleMobileLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and Brand */}
          <a href="#inicio" onClick={() => handleLinkClick('#inicio')} className="flex items-center space-x-3 group shrink-0">
            <AgroPasiLogo size="md" showSubtitle={true} logoUrl={logoUrl} />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center xl:space-x-0.5 min-[1360px]:space-x-1 2xl:space-x-2 shrink-1 min-w-0">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => handleLinkClick(item.href)}
                className="px-1.5 min-[1360px]:px-2.5 py-2 rounded-md xl:text-[10px] min-[1360px]:text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-[#d48743] hover:bg-zinc-900/50 transition-all whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden xl:flex items-center space-x-1.5 2xl:space-x-3 shrink-0">
            {/* Quick WhatsApp Link */}
            <a
              href="https://wa.me/5517991066796?text=Olá!%20Vi%20o%20VarreFort-S%20no%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20preços%20e%20condições."
              target="_blank"
              referrerPolicy="no-referrer"
              className="inline-flex items-center bg-[#d48743] hover:bg-[#c27a41] text-white xl:text-[10px] min-[1360px]:text-[11px] 2xl:text-xs font-bold px-2 min-[1360px]:px-3 2xl:px-4 py-2 rounded-lg transition-all shadow-md shadow-[#d48743]/10 whitespace-nowrap"
              id="header-whatsapp-cta"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1 2xl:mr-1.5 shrink-0" />
              WhatsApp Direto
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex xl:hidden items-center space-x-2">
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-zinc-950 border-b border-zinc-800 animate-slideDown">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => handleMobileLinkClick(item.href)}
                className="block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-zinc-300 hover:text-[#d48743] hover:bg-zinc-900/50 transition-all font-sans"
              >
                {item.label}
              </a>
            ))}
            
            <div className="pt-4 pb-2 border-t border-zinc-800 px-4 flex flex-col gap-3">
              <a
                href="https://wa.me/5517991066796?text=Olá!%20Vi%20o%20VarreFort-S%20no%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20preços%20e%20condições."
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full text-center bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg font-sans transition-all"
              >
                Falar com Vendedor
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

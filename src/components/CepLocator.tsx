import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, ShieldCheck, Check, Sparkles, Phone, MessageSquare } from 'lucide-react';
import { Representative } from '../types';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm5.836 14.28c-.244.688-1.428 1.354-1.968 1.41-.539.057-1.222.253-3.953-.872-3.284-1.351-5.383-4.708-5.548-4.928-.165-.22-1.326-1.764-1.326-3.365 0-1.601.838-2.389 1.135-2.712.298-.323.648-.404.864-.404.216 0 .432.002.621.011.2.008.473-.076.738.56.27.648.918 2.241.998 2.403.08.162.135.351.027.567-.108.216-.162.351-.324.541-.162.189-.341.422-.487.567-.162.162-.33.338-.142.661.189.323.839 1.378 1.802 2.238 1.238 1.103 2.28 1.444 2.604 1.606.324.162.513.135.702-.081.189-.216.811-.945 1.027-1.27.216-.324.432-.27.729-.162.297.108 1.892.892 2.216 1.054.324.162.54.243.621.378.081.135.081.783-.163 1.471z" />
  </svg>
);

export const REPRESENTATIVES: Representative[] = [
  {
    id: 'rep_hq',
    name: 'José (Vendas & Atendimento Fábrica)',
    region: 'São Paulo & Região Central',
    phone: '17996355842',
    email: 'jose.vendas@agropasi.com.br',
    coverCeps: ['0', '1'], // SP range (01xxx to 19xxx)
    avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rep_minas',
    name: 'Djalma (Cerrado & Sul de Minas)',
    region: 'Sul de Minas Gerais & Cerrado',
    phone: '35998993966',
    email: 'djalma.vendas@agropasi.com.br',
    coverCeps: ['3'], // MG range (30xxx to 39xxx)
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rep_es',
    name: 'Felipe Lourenço (Espírito Santo)',
    region: 'Espírito Santo & Caparaó',
    phone: '17996355842',
    email: 'felipe.l@agropasi.com.br',
    coverCeps: ['2'], // RJ / ES range (20xxx to 29xxx)
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rep_sul',
    name: 'Ronaldo (Região Sul & Demais Estados)',
    region: 'Paraná, Santa Catarina & Demais Estados',
    phone: '17996355842',
    email: 'ronaldo.s@agropasi.com.br',
    coverCeps: ['8', '9', '4', '5', '6', '7'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

const INTEREST_OPTIONS = [
  { id: 'varrefort', label: 'Arruador VarreFort-S', itemTitle: 'Arruador VarreFort-S' },
  { id: 'pecas', label: 'Peças de Reposição', itemTitle: 'Peças de Reposição' },
  { id: 'recolhedora', label: 'Recolhedora de Café', itemTitle: 'Recolhedora de Café' },
  { id: 'outro', label: 'Outro Assunto / Dúvidas', itemTitle: 'Outro Assunto/Dúvidas' }
];

interface CepLocatorProps {
  variant?: 'full' | 'dark-compact';
}

export default function CepLocator({ variant = 'full' }: CepLocatorProps) {
  const [selectedInterest, setSelectedInterest] = useState<string>('varrefort');
  const [cep, setCep] = useState<string>('');
  const [reps, setReps] = useState<Representative[]>(REPRESENTATIVES);
  const [detectedRep, setDetectedRep] = useState<Representative>(REPRESENTATIVES[0]);
  const [regionIdentified, setRegionIdentified] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('agropasi_cms_reps');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReps(parsed);
          setDetectedRep(parsed[0]);
          return;
        }
      } catch (err) {}
    }
    setReps(REPRESENTATIVES);
    setDetectedRep(REPRESENTATIVES[0]);
  }, []);

  // Format and route CEP dynamically
  const handleCepChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 8);
    let formatted = clean;
    if (clean.length > 5) {
      formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`;
    }
    setCep(formatted);

    if (clean.length >= 1) {
      const firstDigit = clean[0];
      const twoDigits = clean.slice(0, 2);

      // CEP Routing rules
      if (firstDigit === '3') {
        // Minas Gerais
        const mgRep = reps.find(r => r.id === 'rep_minas' || r.phone.includes('35')) || reps[1] || reps[0];
        setDetectedRep(mgRep);
        setRegionIdentified('Minas Gerais (Atendimento Djalma)');
      } else if (firstDigit === '0' || firstDigit === '1') {
        // São Paulo
        const spRep = reps.find(r => r.id === 'rep_hq' || r.id === 'rep_mogiana' || r.phone.includes('17')) || reps[0];
        setDetectedRep(spRep);
        setRegionIdentified('São Paulo & Região (Atendimento José)');
      } else if (twoDigits.startsWith('29')) {
        // Espírito Santo
        const esRep = reps.find(r => r.id === 'rep_es' || r.id === 'rep_vitoria') || reps[0];
        setDetectedRep(esRep);
        setRegionIdentified('Espírito Santo (Atendimento Especializado)');
      } else {
        // Demais regiões / Central
        const generalRep = reps[0];
        setDetectedRep(generalRep);
        setRegionIdentified('Atendimento Direto de Fábrica');
      }
    } else {
      setRegionIdentified('');
      setDetectedRep(reps[0]);
    }
  };

  const handleOpenWhatsApp = () => {
    const selectedObj = INTEREST_OPTIONS.find(o => o.id === selectedInterest) || INTEREST_OPTIONS[0];
    const msg = `Olá! Vim através do site da AgroPasi.\nTenho interesse em: ${selectedObj.itemTitle}\nGostaria de receber mais informações.`;

    const cleanPhone = detectedRep.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="contato" className="py-20 bg-zinc-950 text-zinc-100 scroll-mt-10 relative overflow-hidden border-t border-zinc-900">
      <div className="absolute inset-0 bg-gradient-to-b from-[#d48743]/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3.5 py-1.5 bg-[#d48743]/15 border border-[#d48743]/30 text-[#d48743] text-xs font-bold rounded-full uppercase tracking-wider">
            Atendimento Direto & Rápido
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-100">
            Fale Direto com Nossos Especialistas
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Selecione seu interesse e receba atendimento imediato no WhatsApp com o consultor técnico da sua região.
          </p>
        </div>

        {/* Simplified Single Flow Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
          
          {/* 1. Chips de Interesse */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              1. Qual o seu principal interesse?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map((item) => {
                const isSelected = selectedInterest === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedInterest(item.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#d48743]/15 border-[#d48743] text-white shadow-md shadow-[#d48743]/10' 
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ml-2 ${
                      isSelected 
                        ? 'bg-[#d48743] border-[#d48743] text-white' 
                        : 'border-zinc-700 bg-zinc-900 text-transparent'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Campo de CEP (para roteamento regional) */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                2. Seu CEP ou Cidade (Opcional - Roteia para o consultor da sua região)
              </label>
              {regionIdentified && (
                <span className="text-[11px] font-bold text-emerald-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {regionIdentified}
                </span>
              )}
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: 15800-000 ou 37000-000"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 px-4 pl-11 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#d48743] font-mono transition"
                id="contact-cep-input"
              />
              <MapPin className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* 3. Botão Único WhatsApp */}
          <div className="pt-2">
            <button
              onClick={handleOpenWhatsApp}
              type="button"
              id="contact-whatsapp-submit-btn"
              className="w-full py-4 px-6 bg-[#d48743] hover:bg-[#c27a41] !text-white rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#d48743]/20 hover:shadow-[#d48743]/30 cursor-pointer uppercase tracking-wider active:scale-[0.99]"
            >
              <WhatsAppIcon className="w-6 h-6 text-white shrink-0" />
              <span className="text-white font-bold tracking-wide">Falar no WhatsApp</span>
              <ArrowRight className="w-5 h-5 text-white shrink-0" />
            </button>
          </div>

        </div>

        {/* Informações de Atendimento Direto — Fora do retângulo do formulário */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 px-2 sm:px-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#d48743]" />
            <span>WhatsApp & Atendimento Fábrica: <strong className="text-zinc-200 font-mono">(17) 99635-5842</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Atendimento Direto de Fábrica (Seg a Sex 07h às 17h30)</span>
          </div>
        </div>

      </div>
    </section>
  );
}

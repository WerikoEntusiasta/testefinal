import React, { useState, useEffect } from 'react';
import { Handshake, ShieldCheck, Heart, Warehouse } from 'lucide-react';

export default function CompanyAbout() {
  const [industrialPhoto, setIndustrialPhoto] = useState(
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800'
  );
  const [industrialTitle, setIndustrialTitle] = useState('Estrutura Industrial Própria');
  const [industrialText, setIndustrialText] = useState(
    'Cada peça passa pelo nosso processo. Nada é improvisado. Tudo é controlado.'
  );
  const [sectionBadge, setSectionBadge] = useState('Nossas Raízes');
  const [sectionTitle, setSectionTitle] = useState('Três gerações, três indústrias, o mesmo compromisso com qualidade.');
  const [sectionDesc1, setSectionDesc1] = useState(
    'Começamos com equipamentos para a gastronomia industrial. Décadas depois, investimos na construção civil. Hoje, chegamos ao agronegócio.'
  );
  const [sectionDesc2, setSectionDesc2] = useState(
    'Não expandimos por acaso. Expandimos porque uma família que vive de indústria aprende, a cada geração, a dominar um novo desafio com a mesma seriedade de sempre. A AgroPasi nasceu de 60 anos de indústria.'
  );

  const loadCmsData = () => {
    try {
      const stored = localStorage.getItem('agropasi_cms_about');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.industrialPhoto) setIndustrialPhoto(data.industrialPhoto);
        if (data.industrialTitle) setIndustrialTitle(data.industrialTitle);
        if (data.industrialText) setIndustrialText(data.industrialText);
        if (data.sectionBadge) setSectionBadge(data.sectionBadge);
        if (data.sectionTitle) setSectionTitle(data.sectionTitle);
        if (data.sectionDesc1) setSectionDesc1(data.sectionDesc1);
        if (data.sectionDesc2) setSectionDesc2(data.sectionDesc2);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCmsData();
    window.addEventListener('storage_updated', loadCmsData);
    return () => window.removeEventListener('storage_updated', loadCmsData);
  }, []);

  const values = [
    {
      icon: Handshake,
      title: 'Honestidade com o Produtor',
      description: 'Falamos com transparência sobre a capacidade das nossas máquinas. Entregamos eficiência real que se traduz no bolso do produtor e no rendimento da safra.'
    },
    {
      icon: ShieldCheck,
      title: 'Qualidade Sem Concessão',
      description: 'Antes de qualquer lançamento, nossas máquinas passam por ciclos intensos de teste em campo real. Só chega ao produtor o que já provou que funciona.'
    },
    {
      icon: Heart,
      title: 'Proximidade com o Campo',
      description: 'Desenvolvemos nossas soluções ouvindo quem lida com a colheita todos os dias. Nossa equipe passa safras no campo para entender as dores mecânicas reais e implementar melhorias imediatas.'
    }
  ];

  return (
    <section id="sobre" className="text-zinc-900 scroll-mt-10 bg-zinc-50 border-t border-zinc-200">
      
      {/* Nossas Raízes */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span 
                className="inline-block px-3.5 py-1.5 bg-[#d48743] text-white text-xs font-bold rounded-full uppercase tracking-wider"
              >
                {sectionBadge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-900">
                {sectionTitle}
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                {sectionDesc1}
              </p>
              <p className="text-zinc-700 text-sm sm:text-base font-semibold text-[#d48743] leading-relaxed">
                {sectionDesc2}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-white p-3.5 shadow-lg">
                <img
                  src={industrialPhoto}
                  alt="Serralheria industrial de tratores"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover rounded-xl"
                />
                <div className="absolute bottom-7 left-7 right-7 bg-zinc-950/85 backdrop-blur-md p-4 rounded-xl border border-zinc-800 flex items-center space-x-3.5">
                  <div className="p-2.5 bg-[#d48743] text-white rounded-lg shrink-0">
                    <Warehouse className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-100">{industrialTitle}</h4>
                    <p className="text-[11px] text-zinc-350 mt-0.5">{industrialText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Missão, Visão em Frases-Título + Valores Fundamentais */}
          <div className="pt-10 border-t border-zinc-200">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xs sm:text-sm uppercase font-mono font-bold tracking-wider text-[#d48743] bg-[#d48743]/10 px-3 py-1 rounded-lg border border-[#d48743]/20">
                  Fazer a lavoura lucrar mais
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-xs sm:text-sm uppercase font-mono font-bold tracking-wider text-[#d48743] bg-[#d48743]/10 px-3 py-1 rounded-lg border border-[#d48743]/20">
                  Ser a marca que o campo respeita
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-sans text-zinc-900 pt-1">
                O que guia cada máquina que fabricamos
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="bg-white border border-zinc-200 p-6 sm:p-7 rounded-2xl space-y-3.5 shadow-sm hover:shadow-md transition">
                    <div className="w-10 h-10 bg-[#d48743]/10 border border-[#d48743]/20 rounded-xl text-[#d48743] flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-zinc-900 font-sans text-base">{v.title}</h4>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{v.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}

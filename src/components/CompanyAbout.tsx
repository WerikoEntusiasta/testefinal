import React, { useState, useEffect } from 'react';
import { Target, Eye, Handshake, ShieldCheck, Heart, Warehouse } from 'lucide-react';

export default function CompanyAbout() {
  const [grandpaPhoto, setGrandpaPhoto] = useState(
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300'
  );
  const [grandpaTitle, setGrandpaTitle] = useState('O Rosto do Avô Pasiani: Legado, Autoridade e Confiança');
  const [grandpaText, setGrandpaText] = useState(
    'Este projeto de identidade visual busca resgatar a autoridade e a credibilidade estabelecidas pela família Pasiani, transformando o sobrenome em um selo de qualidade inquestionável. Ele representa o ponto de ancoragem emocional e simboliza a visão original e a qualidade artesanal.'
  );
  const [grandpaQuote, setGrandpaQuote] = useState(
    '"Esta empresa tem história, tem raízes e honra o compromisso de seus fundadores com o homem do campo."'
  );

  const [industrialPhoto, setIndustrialPhoto] = useState(
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800'
  );
  const [industrialTitle, setIndustrialTitle] = useState('Estrutura Industrial Própria');
  const [industrialText, setIndustrialText] = useState(
    'Cada peça passa pelo nosso processo. Nada é improvisado. Tudo é controlado.'
  );
  const [sectionBadge, setSectionBadge] = useState('Nossas Raízes');
  const [sectionTitle, setSectionTitle] = useState('Três gerações. Três indústrias. Uma obsessão que nunca mudou.');
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
        if (data.grandpaPhoto) setGrandpaPhoto(data.grandpaPhoto);
        if (data.grandpaTitle) setGrandpaTitle(data.grandpaTitle);
        if (data.grandpaText) setGrandpaText(data.grandpaText);
        if (data.grandpaQuote) setGrandpaQuote(data.grandpaQuote);
        
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
      description: 'Falamos a verdade sobre a capacidade de nossas máquinas. Não vendemos promessas teóricas de catálogo; entregamos eficiência que se traduz no bolso do produtor e no rendimento da safra.'
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
    <section id="sobre" className="text-zinc-900 scroll-mt-10">
      
      {/* Primeira Seção: Nossa História, Missão e Visão */}
      <div className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Intro Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-6 space-y-5">
              <span 
                className="inline-block px-3 py-1 bg-[#d48743] border border-[#d48743] text-white text-xs font-semibold rounded-full uppercase tracking-wider"
                style={{ color: '#ffffff' }}
              >
                {sectionBadge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-900">
                {sectionTitle}
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                {sectionDesc1}
              </p>
              <p className="text-zinc-650 text-sm sm:text-base font-semibold text-[#d48743] leading-relaxed">
                {sectionDesc2}
              </p>
            </div>

            {/* Side Illustration / Factory context */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-white p-4 shadow-lg">
                <img
                  src={industrialPhoto}
                  alt="Serralheria industrial de tratores"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 object-cover rounded-xl"
                />
                <div className="absolute bottom-8 left-8 right-8 bg-zinc-950/85 backdrop-blur-md p-5 rounded-xl border border-zinc-800 flex items-center space-x-4">
                  <div className="p-3 bg-[#d48743] text-white rounded-lg">
                    <Warehouse className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">{industrialTitle}</h4>
                    <p className="text-xs text-zinc-350 mt-0.5">{industrialText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 hover:shadow-md transition">
              <div className="w-10 h-10 bg-[#d48743] text-white rounded-lg flex items-center justify-center mb-5 border border-[#d48743]/20">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-sans text-zinc-900 mb-2">Nossa Missão</h3>
              <p className="text-xs font-bold text-[#262b3f] uppercase tracking-wider mb-3">Fazer a Lavoura Lucrar Mais</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Ser o parceiro estratégico do produtor de café e grãos, entregando tecnologia durável, assistência ágil de fácil acesso e excelente custo-benefício, permitindo que a lavoura produza o máximo com o menor desgaste mecânico possível.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 hover:shadow-md transition">
              <div className="w-10 h-10 bg-[#d48743] text-white rounded-lg flex items-center justify-center mb-5 border border-[#d48743]/20">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-sans text-zinc-900 mb-2">Nossa Visão</h3>
              <p className="text-xs font-bold text-[#d48743] uppercase tracking-wider mb-3">Ser a Marca que o Campo Respeita</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Consolidar-se nacionalmente como a principal marca de implementos concebidos para cafeicultores e produtores rurais que buscam durabilidade extrema no campo, inovando constantemente em soluções de baixo consumo e alta durabilidade.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Segunda Seção: Valores Fundamentais */}
      <div className="py-20 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white bg-[#d48743] px-2 py-1 rounded" style={{ color: '#ffffff' }}>Valores Fundamentais</span>
              <h3 className="text-2xl font-bold font-sans mt-3 text-zinc-900">
                O que guia cada máquina que fabricamos
              </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl space-y-4 shadow-sm hover:shadow-md transition">
                  <div className="w-10 h-10 bg-white border border-zinc-200 rounded-lg text-[#d48743] flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-zinc-900 font-sans text-base">{v.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}

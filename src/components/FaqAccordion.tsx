import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, FileQuestion, BookOpen } from 'lucide-react';
import { FaqItem } from '../types';

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq_1',
    category: 'RPM & Operação',
    question: 'Qual a rotação (RPM) ideal recomendada para trabalhar com o VarreFort-S?',
    answer: 'O VarreFort-S foi projetado para operar com baixo giro (1.300 a 1.500 RPM no trator). Isso reduz o esforço do motor e garante até 20% de economia de diesel por hora trabalhada, mantendo a ventilação e o enleiramento perfeitos sem desgastar desnecessariamente o trator.'
  },
  {
    id: 'faq_2',
    category: 'Acoplamento',
    question: 'Como é feito o acoplamento no trator? É universal?',
    answer: 'Sim, o VarreFort-S utiliza o sistema padrão de engate de três pontos (Categoria II). Ele é compatível com praticamente todos os tratores cafeeiros do mercado.'
  },
  {
    id: 'faq_3',
    category: 'Manutenção',
    question: 'De quanto em quanto tempo devo fazer a lubrificação das engrenagens?',
    answer: 'A lubrificação deve ser feita nas graxeiras indicadas a cada 12 horas de operação contínua. Usar graxa de boa qualidade para proteger os rolamentos contra poeira e terra.'
  },
  {
    id: 'faq_4',
    category: 'Lavoura e Relevo',
    question: 'O VarreFort-S funciona bem em terrenos inclinados?',
    answer: 'Sim. O VarreFort-S possui sapatas laterais reguláveis que deslizam sobre o solo, mantendo o alinhamento mesmo em terrenos irregulares ou declives.'
  },
  {
    id: 'faq_5',
    category: 'Garantia',
    question: 'Qual o prazo de garantia e procedência do equipamento?',
    answer: 'Garantia de 1 ano direto de fábrica contra qualquer defeito de fabricação. Além disso, garantimos suporte rápido e peças de reposição imediatas direto de nossa estrutura industrial.'
  }
];

export default function FaqAccordion() {
  const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS);
  const [openId, setOpenId] = useState<string | null>('faq_1');

  const loadFaqs = () => {
    const stored = localStorage.getItem('agropasi_cms_faqs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFaqs(parsed);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setFaqs(INITIAL_FAQS);
  };

  useEffect(() => {
    loadFaqs();
    window.addEventListener('storage_updated', loadFaqs);
    return () => window.removeEventListener('storage_updated', loadFaqs);
  }, []);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-zinc-950 text-zinc-150 scroll-mt-10 relative">
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 bg-[#d48743] border border-[#d48743] text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Perguntas Frequentes
          </span>
          <h2 className="text-3xl font-sans font-bold text-zinc-100">
            Dúvidas Técnicas Respondidas pela Nossa Equipe
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Verifique as respostas da nossa equipe de engenharia agrícola sobre RPM, acoplamentos universais e procedimentos de manutenção do Arruador AgroPasi.
          </p>
        </div>

        {/* FAQ Accordeon List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-zinc-900/60 border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-[#d48743] bg-zinc-900' : 'border-zinc-800 hover:border-zinc-750'
                }`}
              >
                {/* Trigger Row */}
                <button
                  type="button"
                  id={`faq-trigger-${faq.id}`}
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left py-4.5 px-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#d48743] px-2 py-0.5 rounded border border-[#d48743] shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-zinc-100 font-sans tracking-tight leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div className="text-zinc-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-[#d48743]" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Content Panel */}
                {isOpen && (
                  <div className="px-6 pb-5 pt-1.5 border-t border-zinc-850 bg-zinc-950/40 text-zinc-300 leading-relaxed text-xs sm:text-sm animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help box */}
        <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-start">
            <BookOpen className="w-5 h-5 text-[#d48743] mr-3 mt-0.5 shrink-0" />
            <div>
              <h4 id="faq-help-heading" className="text-sm font-bold text-zinc-100" style={{ color: '#ffffff' }}>Tem outra dúvida técnica específica?</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Colocamos você em contato direto com nossa equipe de engenharia e aplicação de campo para responder qualquer dúvida específica da sua lavoura.
              </p>
            </div>
          </div>
          <a
            href="#contato"
            className="inline-flex items-center bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-semibold px-4 py-2 rounded-lg transition shrink-0"
          >
            Falar com Engenharia
          </a>
        </div>

      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Settings, ArrowDownToLine, Loader2, Calendar, 
  ShieldAlert, Sparkles, BookOpen, X, Phone, Mail, Check, Copy, HelpCircle, 
  Layers, ChevronRight, MessageSquare, Wrench, ShieldCheck, Play, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import SavingsCalculator from './SavingsCalculator';
import { REPRESENTATIVES } from './CepLocator';
import { sanitizeOverrides } from '../lib/api';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm5.836 14.28c-.244.688-1.428 1.354-1.968 1.41-.539.057-1.222.253-3.953-.872-3.284-1.351-5.383-4.708-5.548-4.928-.165-.22-1.326-1.764-1.326-3.365 0-1.601.838-2.389 1.135-2.712.298-.323.648-.404.864-.404.216 0 .432.002.621.011.2.008.473-.076.738.56.27.648.918 2.241.998 2.403.08.162.135.351.027.567-.108.216-.162.351-.324.541-.162.189-.341.422-.487.567-.162.162-.33.338-.142.661.189.323.839 1.378 1.802 2.238 1.238 1.103 2.28 1.444 2.604 1.606.324.162.513.135.702-.081.189-.216.811-.945 1.027-1.27.216-.324.432-.27.729-.162.297.108 1.892.892 2.216 1.054.324.162.54.243.621.378.081.135.081.783-.163 1.471z" />
  </svg>
);

const safeParseJson = (str: string) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      const decoded = str
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      return JSON.parse(decoded);
    } catch (innerError) {
      return null;
    }
  }
};

interface ProductDetailPageProps {
  productId: string;
  onClose: () => void;
  onSelectProduct: (id: string) => void;
}

export default function ProductDetailPage({ productId, onClose, onSelectProduct }: ProductDetailPageProps) {
  // Shared States
  const [downloadingCat, setDownloadingCat] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // VarreMax-X Teaser form states
  const [teaserEmail, setTeaserEmail] = useState('');
  const [teaserSuccess, setTeaserSuccess] = useState(false);

  // Form States
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCep, setFormCep] = useState('');
  const [formTractor, setFormTractor] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<string | null>('faq_1');

  // Video modal state
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Data Overrides
  const [mainOverrides, setMainOverrides] = useState<Record<string, any>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    try {
      const stored = localStorage.getItem('agropasi_main_products_overrides');
      if (stored) {
        setMainOverrides(sanitizeOverrides(JSON.parse(stored)));
      }
    } catch (e) {}

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('agropasi_main_products_overrides');
        if (stored) setMainOverrides(sanitizeOverrides(JSON.parse(stored)));
      } catch (e) {}
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  const handleDownload = (catalogName: string) => {
    setDownloadingCat(catalogName);
    setDownloadSuccess(null);
    setTimeout(() => {
      setDownloadingCat(null);
      setDownloadSuccess(catalogName);
      setSelectedCatalog(catalogName);
    }, 1000);
  };

  const handleTeaserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teaserEmail) return;
    setTeaserSuccess(true);
    setTeaserEmail('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    let rep = REPRESENTATIVES[0];
    const cleanCep = formCep.replace(/\D/g, '');
    if (cleanCep.startsWith('3')) {
      rep = REPRESENTATIVES[1] || REPRESENTATIVES[0];
    }

    const currentProductName = mainOverrides[productId]?.name || 
      (productId === 'varremax-x' ? 'Recolhedora RecolheFort-C' : productId === 'pasiparts' ? 'Peças de Reposição' : 'Arruador VarreFort-S');

    const msg = `Olá ${rep.name.split(' ')[0]}! Solicitação de cotação via site AgroPasi:\n` +
      `*Produto:* ${currentProductName}\n` +
      `*Nome:* ${formName}\n` +
      `*Telefone:* ${formPhone}\n` +
      `*CEP/Cidade:* ${formCep || 'Não informado'}\n` +
      (formTractor ? `*Trator:* ${formTractor}\n` : '') +
      (formMessage ? `*Mensagem:* ${formMessage}` : '');

    setFormSuccess(true);
    const waUrl = `https://wa.me/55${rep.phone}?text=${encodeURIComponent(msg)}`;
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCatalogFileContent = (catalogName: string) => {
    if (catalogName === 'Arruador VarreFort-S') {
      return `===========================================================
AGROPASI - IMPLEMENTOS AGRÍCOLAS
CATÁLOGO TÉCNICO OFICIAL: ARRUADOR DE CAFÉ VARREFORT-S
===========================================================

1. APRESENTAÇÃO:
Desenvolvido para entregar o máximo rendimento na varrição e organização de grãos de café na lavoura. O VarreFort-S une a robustez do aço metalúrgico próprio da AgroPasi à aerodinâmica avançada de sopro, proporcionando economia de combustível ao trator e desobstrução rápida das saias das árvores.

2. ESPECIFICAÇÕES TÉCNICAS:
- Capacidade de sopro: 180 m³/min (fluxo direcionado)
- Rotação requerida na TDP: 540 RPM (acoplamento direto)
- Rotação de Trabalho no Trator: 1.300 a 1.500 RPM (Baixo Giro)
- Diâmetro do rotor: 600mm balanceado dinamicamente
- Estrutura: Chassi monobloco em chapa de aço estrutural de alta durabilidade
- Peso total: 456 kg
- Acoplamento: Categoria II (três pontos)

3. BENEFÍCIOS DO PRODUTO:
- Economia de Combustível: Até 20% menos diesel por hora.
- Zero Perda na Varrição: Desloca todos os grãos longe do tronco.
- Suporte Pós-Venda Garantido: Peças 100% nacionais, prontas na fábrica.

-----------------------------------------------------------
AgroPasi - Tecnologia Fabril Aplicada ao Dia-a-Dia da Lavoura
Atendimento Comercial: (17) 99635-5842 | Catanduva-SP
===========================================================`;
    } else {
      return `===========================================================
AGROPASI - IMPLEMENTOS AGRÍCOLAS
TABELA DE SUPORTE E PEÇAS DE REPOSIÇÃO (GARANTIA DE ORIGEM)
===========================================================

1. SUPORTE AGROPASI:
Todas as nossas peças são usinadas internamente e cortadas a laser, garantindo reposição imediata e encaixe perfeito.

2. PEÇAS DE REPOSIÇÃO MAIS SOLICITADAS:
- Hélices Balanceadas Dinamicamente (Aço Carbono Especial) - Código: AP-HE-2026
- Eixo Tracionador Forjado e Cementado - Código: AP-EX-1029
- Jogo de Correias Sincronizadoras Gates 5V - Código: AP-CO-G5V
- Rolamentos Autocompensadores com Blindagem Dupla - Código: AP-RL-22212
- Bico Soprador Direcionador Ajustável - Código: AP-BC-360

3. CONTATO DE SUPORTE IMEDIATO DA FÁBRICA:
WhatsApp / Comercial: (17) 99635-5842
===========================================================`;
    }
  };

  // -------------------------------------------------------------
  // VARREFORT-S PRODUCT PAGE
  // -------------------------------------------------------------
  if (productId === 'varrefort-s') {
    const saved = mainOverrides['varrefort-s'] || {};
    let specsObj = {
      larguraAberto: '2,18 m',
      larguraFechado: '1,98 m',
      comprimento: '1,80 m',
      alturaTotal: '1,40 m',
      pesoLiquido: '456 kg',
      potenciaMinima: '50 cv',
      vazaoHidraulica: '30 L/min',
      rotacaoTdp: '540 rpm',
      acoplamento: '3 Pontos Cat. II'
    };

    if (saved.specsJson) {
      const parsed = safeParseJson(saved.specsJson);
      if (parsed) specsObj = { ...specsObj, ...parsed };
    }

    const varreFortFaqs = [
      {
        id: 'faq_1',
        q: 'Qual a rotação (RPM) ideal recomendada para trabalhar com o VarreFort-S?',
        a: 'O VarreFort-S foi projetado para operar com baixo giro (1.300 a 1.500 RPM no trator). Isso reduz o esforço do motor e garante até 20% de economia de diesel por hora trabalhada, mantendo a ventilação e o enleiramento perfeitos sem desgastar desnecessariamente o trator.'
      },
      {
        id: 'faq_2',
        q: 'Como é feito o acoplamento no trator? É universal?',
        a: 'Sim, o VarreFort-S utiliza o sistema padrão de engate de três pontos (Categoria II). Ele é compatível com praticamente todos os tratores cafeeiros do mercado nacional.'
      },
      {
        id: 'faq_3',
        q: 'O VarreFort-S funciona bem em terrenos inclinados ou declives?',
        a: 'Sim. Possui sapatas laterais reguláveis que deslizam suavemente sobre o solo, mantendo o alinhamento uniforme mesmo em lavouras de montanha ou terrenos irregulares.'
      },
      {
        id: 'faq_4',
        q: 'Qual o prazo de entrega e disponibilidade de peças de reposição?',
        a: 'O VarreFort-S está em regime de Pronta Entrega na fábrica. Como fabricamos 100% das peças internamente, enviamos qualquer componente de reposição em até 24 horas.'
      }
    ];

    const varreFortMedia = [
      {
        id: 'med_1',
        title: 'VarreFort-S em Operação de Campo',
        desc: 'Varrição e alinhamento de grãos em lavoura adensada operando a 1.400 RPM.',
        img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'med_2',
        title: 'Alinhamento Perfeito das Linhas',
        desc: 'Grãos centralizados sem perdas junto às saias dos cafeeiros.',
        img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'med_3',
        title: 'Usinagem Industrial e Corte Laser',
        desc: 'Chassis estruturais cortados a laser com precisão micrométrica.',
        img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600'
      }
    ];

    return (
      <div className="py-20 bg-zinc-950 text-zinc-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
          
          {/* Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <button 
              onClick={onClose}
              className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-[#d48743] transition gap-2 border border-zinc-800 px-3.5 py-2 rounded-xl bg-zinc-900 cursor-pointer self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para Página Inicial
            </button>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
              <span>Produtos</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-300 font-semibold">{saved.name || 'VarreFort-S'}</span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Visual Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="w-full h-64 sm:h-80 flex items-center justify-center relative select-none bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
                  <img 
                    src={saved.image || '/cafezal.jpg'} 
                    alt={saved.name || "Arruador de Café VarreFort-S"} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Turbina CNC</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Vazão focalizada de 180 m³/min</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Tubo Flexível</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Direcionamento de sopro ajustável</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Vassouras</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Alinhamento preciso sem cavar solo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Column */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-[#d48743] uppercase tracking-widest px-3 py-1 rounded font-mono">
                    Sob Consulta
                  </span>
                  <span className="text-[10px] font-bold text-[#d48743] bg-[#d48743]/15 border border-[#d48743]/30 uppercase tracking-widest px-3 py-1 rounded font-mono">
                    100% Nacional
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-100">
                  {saved.name || 'Arruador de Café VarreFort-S'}
                </h1>
                
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  {saved.description || `O VarreFort-S é o arruador soprador de café projetado especificamente para trabalhar em baixas rotações (1.300 a 1.500 RPM no motor do trator), entregando até 20% de economia direta de diesel e um café 100% enfileirado e limpo.`}
                </p>
              </div>

              {/* Specs Table */}
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-4">
                <h4 className="text-xs uppercase font-bold text-[#d48743] tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#d48743]" /> Ficha Técnica de Fábrica
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="block text-[9px] text-zinc-500 uppercase font-bold">Largura (Aberto)</span>
                    <strong className="text-xs text-zinc-100 font-mono block mt-1">{specsObj.larguraAberto}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="block text-[9px] text-zinc-500 uppercase font-bold">Comprimento</span>
                    <strong className="text-xs text-zinc-100 font-mono block mt-1">{specsObj.comprimento}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="block text-[9px] text-zinc-500 uppercase font-bold">Peso Líquido</span>
                    <strong className="text-xs text-[#d48743] font-mono block mt-1">{specsObj.pesoLiquido}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="block text-[9px] text-zinc-500 uppercase font-bold">Potência Mínima</span>
                    <strong className="text-xs text-[#d48743] font-mono block mt-1">{specsObj.potenciaMinima}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="block text-[9px] text-zinc-500 uppercase font-bold">Rotação TDP</span>
                    <strong className="text-xs text-zinc-100 font-mono block mt-1">{specsObj.rotacaoTdp}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="block text-[9px] text-zinc-500 uppercase font-bold">Acoplamento</span>
                    <strong className="text-xs text-zinc-100 font-mono block mt-1">{specsObj.acoplamento}</strong>
                  </div>
                </div>
              </div>

              {/* Download Brochure Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => handleDownload('Arruador VarreFort-S')}
                  disabled={downloadingCat !== null}
                  className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {downloadingCat === 'Arruador VarreFort-S' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#d48743]" />
                      Baixando Ficha Técnica...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4 mr-2 text-[#d48743]" />
                      {downloadSuccess === 'Arruador VarreFort-S' ? 'Ficha Técnica Aberta ✓' : 'Baixar Folder Técnico em PDF'}
                    </>
                  )}
                </button>

                <a
                  href="#cotacao-varrefort"
                  className="inline-flex items-center justify-center bg-[#d48743] hover:bg-[#c27a41] text-white px-5 py-3 rounded-xl text-xs font-bold transition uppercase tracking-wider"
                >
                  Solicitar Cotação Direta
                </a>
              </div>

            </div>
          </div>

          {/* Calculator Section */}
          <div className="border-t border-b border-zinc-900 bg-zinc-950 py-8">
            <SavingsCalculator productId="varrefort-s" />
          </div>

          {/* Gallery / Photos & Videos in action */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#d48743] tracking-widest">Galeria de Campo</span>
                <h3 className="text-xl font-bold font-sans text-zinc-100 mt-1">O VarreFort-S em Trabalho Real</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {varreFortMedia.map((m) => (
                <div key={m.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden group">
                  <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                    <img src={m.img} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {m.videoUrl && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#d48743] text-white flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="text-xs font-bold text-zinc-200">{m.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrated Product FAQ */}
          <div className="space-y-6 pt-6 border-t border-zinc-900">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-[#d48743] tracking-widest">Dúvidas Técnicas</span>
              <h3 className="text-xl font-bold font-sans text-zinc-100">Perguntas Frequentes sobre o VarreFort-S</h3>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {varreFortFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden transition">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-850/40"
                    >
                      <span className="text-xs sm:text-sm font-bold text-zinc-200">{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#d48743] shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-850/60 bg-zinc-950/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quotation & WhatsApp Contact Direct */}
          <div id="cotacao-varrefort" className="pt-8 border-t border-zinc-900">
            <div className="bg-[#1a1e2c] border border-zinc-800 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="max-w-xl space-y-2">
                <span className="inline-block px-3 py-1 bg-[#d48743]/15 text-[#d48743] text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
                  Cotação Direta de Fábrica
                </span>
                <h3 className="text-2xl font-bold font-sans text-white">
                  Garanta Condições Especiais no VarreFort-S
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Fale diretamente com nossos consultores de fábrica no WhatsApp para receber proposta comercial com frete para a sua região e opções de pagamento direto.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/5517996355842?text=Olá!%20Vim%20através%20do%20site%20da%20AgroPasi.%0ATenho%20interesse%20em:%20Arruador%20VarreFort-S%0AGostaria%20de%20receber%20mais%20informações."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#d48743] hover:bg-[#c27a41] text-white px-8 py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-lg transition"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Falar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Modal PDF Viewer */}
        {selectedCatalog && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col">
              <div className="p-6 border-b border-zinc-900 flex justify-between items-start bg-zinc-900/40">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#d48743] font-mono tracking-widest flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Ficha Técnica Oficial
                  </span>
                  <h3 className="text-lg font-bold font-sans text-zinc-100 mt-1">Catálogo: {selectedCatalog}</h3>
                </div>
                <button onClick={() => setSelectedCatalog(null)} className="p-2 text-zinc-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-[50vh] overflow-y-auto font-mono text-xs text-zinc-400 bg-zinc-900/20">
                <pre className="whitespace-pre-wrap leading-relaxed">{getCatalogFileContent(selectedCatalog)}</pre>
              </div>
              <div className="p-4 border-t border-zinc-900 flex justify-end">
                <button onClick={() => setSelectedCatalog(null)} className="bg-[#d48743] text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARREMAX-X (RECOLHEDORA DE CAFÉ) PRODUCT PAGE
  // -------------------------------------------------------------
  if (productId === 'varremax-x') {
    const saved = mainOverrides['varremax-x'] || {};
    let specsObj = {
      capacidadeCarga: '1.500 Litros',
      rendimentoEstimado: 'Até 2.500 kg/hora',
      larguraAberto: '1,50 m a 2,00 m',
      potenciaMinima: 'Mínimo 60 cv',
      sistemaSeparador: 'Turbina de sucção dupla com peneira vibratória autolimpante'
    };

    if (saved.specsJson) {
      const parsed = safeParseJson(saved.specsJson);
      if (parsed) specsObj = { ...specsObj, ...parsed };
    }

    return (
      <div className="py-20 bg-zinc-950 text-zinc-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
          
          {/* Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <button 
              onClick={onClose}
              className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-[#d48743] transition gap-2 border border-zinc-800 px-3.5 py-2 rounded-xl bg-zinc-900 cursor-pointer self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para Página Inicial
            </button>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
              <span>Produtos</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-300 font-semibold">{saved.name || 'Recolhedora de Café'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-[#d48743] text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded font-mono shadow-md">
                  Pré-Lançamento
                </div>

                <div className="w-full h-64 sm:h-80 flex items-center justify-center relative select-none bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden mt-4">
                  <img 
                    src={saved.image || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=1200'} 
                    alt={saved.name || "Recolhedora de Café"} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Turbina Dupla</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Sucção autolimpante</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Rendimento</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">2.500 kg/hora</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Depósito</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">1.500L Basculante</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-[#d48743] uppercase tracking-widest px-3 py-1 rounded font-mono">
                    Linha Pesada
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest px-3 py-1 rounded font-mono">
                    Pré-Lançamento Oficial
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-100">
                  {saved.name || 'Recolhedora de Café AgroPasi'}
                </h1>

                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  Cadastre seu e-mail para receber em primeira mão as especificações técnicas completas, vídeos de testes na colheita e condições exclusivas de pré-reserva.
                </p>

                {!teaserSuccess ? (
                  <form onSubmit={handleTeaserSubmit} className="flex flex-col sm:flex-row gap-2 mt-4">
                    <input 
                      type="email" 
                      required
                      placeholder="Digite seu e-mail" 
                      value={teaserEmail}
                      onChange={(e) => setTeaserEmail(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#d48743] flex-grow"
                    />
                    <button 
                      type="submit" 
                      className="bg-[#d48743] hover:bg-[#c27a41] text-white px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
                    >
                      Avisar Lançamento
                    </button>
                  </form>
                ) : (
                  <div className="bg-emerald-950/45 border border-emerald-900/50 rounded-xl p-4 text-emerald-400 text-xs font-semibold">
                    ✓ E-mail cadastrado com sucesso! Você será o primeiro a receber novidades do lote inicial.
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-4">
                <h4 className="text-xs uppercase font-bold text-[#d48743] tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#d48743]" /> Especificações Estimadas
                </h4>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold">Capacidade de Carga</span>
                    <strong className="text-zinc-200 font-mono block mt-1">{specsObj.capacidadeCarga}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold">Rendimento</span>
                    <strong className="text-zinc-200 font-mono block mt-1">{specsObj.rendimentoEstimado}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold">Largura de Trabalho</span>
                    <strong className="text-zinc-200 font-mono block mt-1">{specsObj.larguraAberto}</strong>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[9px] uppercase font-bold">Potência Requerida</span>
                    <strong className="text-zinc-200 font-mono block mt-1">{specsObj.potenciaMinima}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PASIPARTS SPARE PARTS PAGE (SIMPLIFICADA)
  // -------------------------------------------------------------
  return (
    <div className="py-20 bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
        
        {/* Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <button 
            onClick={onClose}
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-[#d48743] transition gap-2 border border-zinc-800 px-3.5 py-2 rounded-xl bg-zinc-900 cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Página Inicial
          </button>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
            <span>Produtos</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-300 font-semibold">Peças de Reposição & Suporte</span>
          </div>
        </div>

        {/* Simplified Direct Support Banner */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 sm:p-12 space-y-8 text-center sm:text-left">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#d48743]/15 border border-[#d48743]/30 px-3.5 py-1.5 rounded-full text-[#d48743] text-xs font-bold uppercase tracking-wider font-mono">
              <Wrench className="w-3.5 h-3.5" />
              <span>100% Fabricação Própria & Reposição Rápida</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-sans font-extrabold text-zinc-100 tracking-tight">
              Peças Genuínas Direto de Fábrica & Projetos Sob Medida
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Como possuímos parque fabril próprio com corte a laser e usinagem de precisão, mantemos estoque de engrenagens, eixos, rolamentos e bicos para pronta reposição e envio ágil para todo o Brasil. Também fabricamos implementos customizados para a sua lavoura.
            </p>
          </div>

          {/* 3 Pillars of Parts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-2">
              <span className="text-[#d48743] font-bold text-xs uppercase font-mono block">Pronta Reposição</span>
              <p className="text-xs text-zinc-400 leading-relaxed">Estoque contínuo de componentes para que a sua colheita nunca fique parada.</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-2">
              <span className="text-[#d48743] font-bold text-xs uppercase font-mono block">Aço Certificado</span>
              <p className="text-xs text-zinc-400 leading-relaxed">Usinagem própria em aço ASTM-36 com balanceamento dinâmico.</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-2">
              <span className="text-[#d48743] font-bold text-xs uppercase font-mono block">Sob Medida</span>
              <p className="text-xs text-zinc-400 leading-relaxed">Engenharia adaptável para o espaçamento específico da sua plantação.</p>
            </div>
          </div>

          {/* WhatsApp Direct Action */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 block font-mono">Diga qual componente precisa ou tire dúvidas técnicas:</span>
              <strong className="text-sm text-zinc-100">Atendimento imediato no WhatsApp</strong>
            </div>

            <a
              href="https://wa.me/5517996355842?text=Olá!%20Preciso%20de%20peças%20de%20reposição%20ou%20suporte%20técnico%20da%20AgroPasi."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#d48743] hover:bg-[#c27a41] text-white px-8 py-4 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-xl cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Solicitar Peças no WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}

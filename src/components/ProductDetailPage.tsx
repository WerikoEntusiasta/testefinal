import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Settings, ArrowDownToLine, Loader2, Calendar, 
  ShieldAlert, Sparkles, BookOpen, X, Phone, Mail, Check, Copy, HelpCircle, 
  Layers, ChevronRight, MessageSquare, Wrench, ShieldCheck
} from 'lucide-react';
import SavingsCalculator from './SavingsCalculator';
import CepLocator, { REPRESENTATIVES } from './CepLocator';
import { sanitizeOverrides } from '../lib/api';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm5.836 14.28c-.244.688-1.428 1.354-1.968 1.41-.539.057-1.222.253-3.953-.872-3.284-1.351-5.383-4.708-5.548-4.928-.165-.22-1.326-1.764-1.326-3.365 0-1.601.838-2.389 1.135-2.712.298-.323.648-.404.864-.404.216 0 .432.002.621.011.2.008.473-.076.738.56.27.648.918 2.241.998 2.403.08.162.135.351.027.567-.108.216-.162.351-.324.541-.162.189-.341.422-.487.567-.162.162-.33.338-.142.661.189.323.839 1.378 1.802 2.238 1.238 1.103 2.28 1.444 2.604 1.606.324.162.513.135.702-.081.189-.216.811-.945 1.027-1.27.216-.324.432-.27.729-.162.297.108 1.892.892 2.216 1.054.324.162.54.243.621.378.081.135.081.783-.163 1.471z" />
  </svg>
);

const formatPhone = (phoneStr?: string) => {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phoneStr;
};

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
      throw e;
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
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);

  // VarreMax-X Teaser form states
  const [teaserEmail, setTeaserEmail] = useState('');
  const [teaserSuccess, setTeaserSuccess] = useState(false);

  // Contact/Inquiry Form States
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCep, setFormCep] = useState('');
  const [formTractor, setFormTractor] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Representative Lookup States
  const [repsList, setRepsList] = useState<any[]>([]);
  const [matchedRepState, setMatchedRepState] = useState<any | null>(null);

  // Parts filter state
  const [partsSearch, setPartsSearch] = useState('');
  const [mainOverrides, setMainOverrides] = useState<Record<string, any>>({});

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Check if lead captured
    const checkLeadStatus = () => {
      try {
        const storedLeads = localStorage.getItem('agropasi_leads');
        if (storedLeads) {
          const leads = JSON.parse(storedLeads);
          if (Array.isArray(leads) && leads.length > 0) {
            setIsLeadCaptured(true);
            return;
          }
        }
        setIsLeadCaptured(false);
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

    const loadRepresentatives = () => {
      try {
        const stored = localStorage.getItem('agropasi_cms_reps');
        let list = [];
        if (stored) {
          list = JSON.parse(stored);
        }
        if (!Array.isArray(list) || list.length === 0) {
          list = REPRESENTATIVES;
        }
        setRepsList(list);
      } catch (e) {
        console.error(e);
        setRepsList(REPRESENTATIVES);
      }
    };

    checkLeadStatus();
    loadMainOverrides();
    loadRepresentatives();
    const handleUpdate = () => {
      checkLeadStatus();
      loadMainOverrides();
      loadRepresentatives();
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, [productId]);

  // Dynamic representative matcher inside form
  useEffect(() => {
    const digitsOnly = formCep.replace(/\D/g, '');
    if (digitsOnly.length >= 2 && repsList.length > 0) {
      const prefix = digitsOnly.substring(0, 2);
      const matched = repsList.find((r: any) => {
        if (!r.coverCeps) return false;
        let ceps = r.coverCeps;
        if (typeof ceps === 'string') {
          try {
            ceps = JSON.parse(ceps);
          } catch (e) {
            ceps = [];
          }
        }
        return Array.isArray(ceps) && ceps.includes(prefix);
      });
      
      if (matched) {
        setMatchedRepState(matched);
      } else {
        // Fallback to headquarters (usually rep_hq or the first representative)
        const fallback = repsList.find((r: any) => r.id === 'rep_hq') || repsList[0];
        setMatchedRepState(fallback);
      }
    } else {
      setMatchedRepState(null);
    }
  }, [formCep, repsList]);

  const handleDownload = (catalogName: string) => {
    setDownloadingCat(catalogName);
    setDownloadSuccess(null);
    
    setTimeout(() => {
      setDownloadingCat(null);
      setDownloadSuccess(catalogName);
      setSelectedCatalog(catalogName); // Opens modal
    }, 1200);
  };

  const handleTeaserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teaserEmail) return;
    setTeaserSuccess(true);
    setTeaserEmail('');
  };

  // Form Submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formCep) return;

    const matchedRep = matchedRepState || repsList.find((r: any) => r.id === 'rep_hq') || repsList[0] || { id: 'rep_hq', name: 'José (Escritório Central / Vendas SP)', phone: '17991066796' };

    const currentProductName = mainOverrides[productId]?.name || 
      (productId === 'varremax-x' ? 'Recolhedora RecolheFort-C' : productId === 'pasiparts' ? 'Peças de Reposição & Suporte Técnico' : 'Arruador VarreFort-S');

    const newLead = {
      id: `lead_${Date.now()}`,
      name: formName,
      phone: formPhone,
      email: formEmail || 'Não informado',
      cep: formCep || 'Não informado',
      city: 'Simulado via CEP na página',
      state: 'SP',
      tractorModel: formTractor || 'Não informado',
      message: formMessage || `Interesse direto no produto ${currentProductName}`,
      representativeId: matchedRep.id,
      representativeName: matchedRep.name,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente'
    };

    try {
      const stored = localStorage.getItem('agropasi_leads');
      const existingLeads = stored ? JSON.parse(stored) : [];
      localStorage.setItem('agropasi_leads', JSON.stringify([newLead, ...existingLeads]));
      window.dispatchEvent(new Event('storage_updated'));
      setIsLeadCaptured(true);
      setFormSuccess(true);

      const isPreLaunch = productId === 'varrefort-s';
      const interestLabel = isPreLaunch ? `Pré-Lançamento: ${currentProductName}` : currentProductName;
      const messageLabel = formMessage || (isPreLaunch ? 'Tenho interesse no pré-lançamento do VarreFort-S.' : 'Solicito orçamento.');

      const waText = `Olá ${matchedRep.name}, enviei uma solicitação pelo site AgroPasi!\n\n` +
        `*Interesse:* ${interestLabel}\n` +
        `*Nome:* ${formName}\n` +
        `*Telefone:* ${formPhone}\n` +
        `*Região/CEP:* ${formCep || 'Não informado'}\n` +
        `*Modelo Trator:* ${formTractor || 'Não informado'}\n` +
        `*Mensagem:* ${messageLabel}`;

      const encodedText = encodeURIComponent(waText);
      const waUrl = `https://wa.me/55${matchedRep.phone}?text=${encodedText}`;
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  // Contacts lists
  const renderContactsSection = () => {
    const currentProductName = mainOverrides[productId]?.name || 
      (productId === 'varremax-x' ? 'Recolhedora RecolheFort-C' : productId === 'pasiparts' ? 'Peças de Reposição & Suporte Técnico' : 'Arruador VarreFort-S');

    return (
      <div className="bg-[#1a1e2c] border border-zinc-800 rounded-3xl p-8 sm:p-12 space-y-10">
        {isLeadCaptured ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h5 className="text-xs font-bold text-[#d48743] uppercase tracking-widest font-mono">
                Contatos de Fábrica Liberados
              </h5>
            </div>
            <h4 className="text-xl font-bold text-white font-sans">
              Fale direto com nossos especialistas técnicos autorizados:
            </h4>
            <p className="text-xs text-slate-300">
              Clique nos botões abaixo para abrir o WhatsApp oficial e negociar cotações, prazos e frete especial de fábrica:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <a 
                href={`https://wa.me/5535998993966?text=Olá%20Djalma,%20gostaria%20de%20saber%20mais%20sobre%20o%20${encodeURIComponent(currentProductName)}!`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between transition group cursor-pointer"
              >
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-wider">DJALMA (Vendas / Sul de Minas)</span>
                  <strong className="text-base text-white group-hover:text-[#e39a5e] transition font-mono">(35) 99899-3966</strong>
                  <span className="text-[10px] text-slate-300 block">Atendimento rápido e condições facilitadas</span>
                </div>
                <span className="text-xs font-bold text-white bg-[#d48743] hover:bg-[#c27a41] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-sm">
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </span>
              </a>

              <a 
                href={`https://wa.me/5517991066796?text=Olá%20José,%20gostaria%20de%20saber%20mais%20sobre%20o%20${encodeURIComponent(currentProductName)}!`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between transition group cursor-pointer"
              >
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-wider">JOSÉ (Atendimento Comercial SP)</span>
                  <strong className="text-base text-white group-hover:text-[#e39a5e] transition font-mono">(17) 99106-6796</strong>
                  <span className="text-[10px] text-slate-300 block">Orçamentos e especificações técnicas</span>
                </div>
                <span className="text-xs font-bold text-white bg-[#d48743] hover:bg-[#c27a41] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-sm">
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Info Column */}
            <div className="lg:col-span-5 space-y-4">
              {productId === 'varrefort-s' ? (
                <>
                  <span className="inline-block px-2.5 py-1 bg-[#d48743] border border-[#d48743] text-white text-[9px] font-bold rounded-full uppercase tracking-wider font-mono">
                    PRÉ-LANÇAMENTO EXCLUSIVO
                  </span>
                  <h4 className="text-2xl font-bold tracking-tight text-white">
                    Garanta sua Vaga no <span className="text-[#d48743]">Pré-Lançamento</span> do VarreFort-S
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Seja um dos primeiros a garantir o novo VarreFort-S com condições de fábrica altamente exclusivas. 
                    Inscreva-se hoje para assegurar prioridade máxima no primeiro lote, material técnico completo e descontos especiais antes do lançamento oficial no mercado.
                  </p>
                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle className="w-4.5 h-4.5 text-[#d48743]" />
                      <span>Prioridade absoluta de entrega no 1º lote</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle className="w-4.5 h-4.5 text-[#d48743]" />
                      <span>Desconto especial garantido para produtores inscritos</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle className="w-4.5 h-4.5 text-[#d48743]" />
                      <span>Ficha técnica antecipada e consultoria de engenharia</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="inline-block px-2.5 py-1 bg-[#d48743] border border-[#d48743] text-white text-[9px] font-bold rounded-full uppercase tracking-wider font-mono">
                    Solicitar Cotação Direta de Fábrica
                  </span>
                  <h4 className="text-2xl font-bold tracking-tight text-white">
                    Fale Conosco e Garanta <span className="text-[#d48743]">Condições Especiais</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Preencha os dados do formulário ao lado com as informações da sua propriedade rural. 
                    Nossa equipe comercial processará sua solicitação imediatamente e liberará os contatos diretos por WhatsApp e telefone para fecharmos o melhor negócio.
                  </p>
                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle className="w-4.5 h-4.5 text-[#d48743]" />
                      <span>Cotação rápida sem intermediários</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle className="w-4.5 h-4.5 text-[#d48743]" />
                      <span>Suporte e consultoria de engenharia de plantio</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle className="w-4.5 h-4.5 text-[#d48743]" />
                      <span>Planos de financiamento Agro direto de fábrica</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Standard Contact Form Column */}
            <form onSubmit={handleFormSubmit} className="lg:col-span-7 bg-slate-900/50 border border-slate-850 p-8 sm:p-10 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#d48743] text-white placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(00) 90000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#d48743] text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">E-mail (Opcional)</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="exemplo@agro.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#d48743] text-white placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">CEP da Propriedade *</label>
                  <input
                    type="text"
                    required
                    value={formCep}
                    onChange={(e) => setFormCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#d48743] text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic matched representative display inside the form */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#d48743] tracking-wider">
                    Consultor Técnico Regional AgroPasi
                  </span>
                  {matchedRepState ? (
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Consultor Atribuído ✓
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-800 text-slate-400 font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Aguardando CEP
                    </span>
                  )}
                </div>

                {matchedRepState ? (
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <img 
                        src={matchedRepState.avatarUrl} 
                        alt={matchedRepState.name} 
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-[#d48743]"
                      />
                      <div className="min-w-0 flex-1">
                        <strong className="block text-xs text-white leading-tight">{matchedRepState.name}</strong>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{matchedRepState.region}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] bg-[#d48743]/15 text-[#d48743] font-extrabold px-2 py-1 rounded uppercase tracking-wider border border-[#d48743]/35 block">
                          Venda Direta
                        </span>
                      </div>
                    </div>

                    {/* Direct WhatsApp & Email Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                      <a
                        href={`https://wa.me/55${matchedRepState.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${matchedRepState.name}, localizei seu contato pelo CEP no site AgroPasi!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span>WhatsApp ({formatPhone(matchedRepState.phone)})</span>
                      </a>

                      <a
                        href={`mailto:${matchedRepState.email}`}
                        className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-slate-800 transition truncate"
                        title={`Enviar e-mail para ${matchedRepState.email}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#d48743] shrink-0" />
                        <span className="truncate">{matchedRepState.email}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    O consultor ideal para o seu município será atribuído automaticamente assim que você digitar o CEP da sua propriedade acima.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Modelo de Trator que Possui (Opcional)</label>
                <input
                  type="text"
                  value={formTractor}
                  onChange={(e) => setFormTractor(e.target.value)}
                  placeholder="Ex: John Deere 5075E, Massey Ferguson 4275"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#d48743] text-white placeholder-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Mensagem / Observação (Opcional)</label>
                <textarea
                  rows={3}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={productId === 'varrefort-s' ? 'Diga suas principais dúvidas ou expectativas sobre o pré-lançamento' : 'Diga suas principais dúvidas sobre o implemento'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#d48743] text-white placeholder-slate-500 leading-relaxed transition-colors"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#d48743] hover:bg-[#c27a41] text-zinc-950 font-extrabold text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer shadow-lg shadow-[#d48743]/10"
                >
                  {productId === 'varrefort-s' ? 'RESERVAR MINHA VAGA NO PRÉ-LANÇAMENTO ✓' : 'Solicitar Cotação & Liberar WhatsApp ✓'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
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
- Diâmetro do rotor: 600mm balanceado dinamicamente
- Estrutura: Chassi monobloco em chapa de aço estrutural de alta durabilidade
- Peso total: 380 kg
- Acoplamento: Categoria II (três pontos)

3. BENEFÍCIOS DO PRODUTO:
- Economia de Combustível: Engenharia aerodinâmica otimizada.
- Zero Perda na Varrição: Desloca todos os grãos longe do tronco, facilitando colheita manual.
- Suporte Pós-Venda Garantido: Peças 100% nacionais, prontas na fábrica.

-----------------------------------------------------------
AgroPasi - Tecnologia Fabril Aplicada ao Dia-a-Dia da Lavoura
Atendimento Comercial: (17) 99106-6796 | Patrocínio/MG
===========================================================`;
    } else {
      return `===========================================================
AGROPASI - IMPLEMENTOS AGRÍCOLAS
TABELA DE SUPORTE E PEÇAS DE REPOSIÇÃO (GARANTIA DE ORIGEM)
===========================================================

1. SUPORTE AGROPASI:
A AgroPasi conta com mais de 20 anos de tradição industrial de alta precisão. Todas as nossas peças são usinadas internamente e cortadas a laser, garantindo reposição imediata e encaixe perfeito.

2. PEÇAS DE REPOSIÇÃO MAIS SOLICITADAS:
- Hélices Balanceadas Dinamicamente (Aço Carbono Especial) - Código: AP-HE-2026
- Eixo Tracionador Forjado e Cementado - Código: AP-EX-1029
- Jogo de Correias Sincronizadoras Gates 5V - Código: AP-CO-G5V
- Rolamentos Autocompensadores com Blindagem Dupla - Código: AP-RL-22212
- Bico Soprador Direcionador Ajustável - Código: AP-BC-360

3. CONTATO DE SUPORTE IMEDIATO DA FÁBRICA:
Telefone Comercial / Pós-Venda: (17) 99106-6796

-----------------------------------------------------------
AgroPasi - Peças Genuínas, Durabilidade Máxima.
===========================================================`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // RENDERING PRODUCT DETAILS BASED ON ID
  // -------------------------------------------------------------

  if (productId === 'varrefort-s') {
    const saved = mainOverrides['varrefort-s'] || {};

    // Dynamic specs parsing with fallbacks
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
      try {
        const parsed = safeParseJson(saved.specsJson);
        if (parsed) {
          specsObj = { ...specsObj, ...parsed };
        }
      } catch (e) {
        console.error('Error parsing specsJson for varrefort-s:', e);
      }
    }

    // Dynamic benefits parsing with fallbacks
    let benefitsList = [
      { title: 'Economia Direta de Diesel', desc: 'Multiplicadores de torque próprios permitem vento máximo em baixa rotação.' },
      { title: 'Preservação das Raízes', desc: 'Chassis leve de 456kg evita a compactação severa sob as copas.' },
      { title: 'Peças de Reposição 100% Prontas', desc: 'Todo o fornecimento é usinado internamente com envio em 24h.' },
      { title: 'Ajustes Rápidos e Seguros', desc: 'Defletores de sopro reguláveis ideais para planos e montanhas.' }
    ];

    if (saved.benefitsJson) {
      try {
        const parsed = safeParseJson(saved.benefitsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          benefitsList = parsed;
        }
      } catch (e) {
        console.error('Error parsing benefitsJson for varrefort-s:', e);
      }
    }

    return (
      <div className="py-20 bg-zinc-950 text-zinc-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
          
          {/* Breadcrumb & Back */}
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
              <span className="text-zinc-300">{saved.name || 'Arruador VarreFort-S'}</span>
            </div>
          </div>

          {/* Main Block Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Visual Blueprint SVG Section */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-[#d48743] border border-[#d48743] text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded font-mono">
                  Foto Oficial
                </div>
                <div className="absolute top-4 right-4 bg-[#262b3f]/30 border border-[#262b3f]/50 text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded font-mono">
                  Modelo 2026
                </div>

                {/* Product Image */}
                <div className="w-full h-64 sm:h-80 flex items-center justify-center relative select-none bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden mt-4">
                  <img 
                    src={saved.image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200'} 
                    alt={saved.name || "Arruador de Café VarreFort-S"} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Photo Overlay Badge */}
                  <div className="absolute bottom-4 right-4 flex flex-col space-y-1 text-right bg-zinc-950/85 p-2.5 rounded-lg border border-zinc-800 backdrop-blur-sm">
                    <span className="text-[10px] text-[#d48743] font-bold font-sans">Demonstração em Campo</span>
                    <span className="text-[8px] text-zinc-400 font-mono">AgroPasi {saved.name || 'VarreFort-S'}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Turbina CNC</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Alta vazão e vento focalizado (180 m³/min)</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Tubo Flexível</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Direcionamento de sopro ajustável</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Vassouras</span>
                    <span className="text-[10px] text-zinc-400 leading-tight">Alinhamento preciso de grãos sem cavar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Specifications Column */}
            <div className="lg:col-span-6 space-y-10 sm:space-y-12">
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-[#262b3f] border border-zinc-800 uppercase tracking-widest px-3 py-1 rounded font-mono">
                    Disponibilidade: Pronta Entrega
                  </span>
                  <span className="text-[10px] font-bold text-white bg-[#d48743] border border-[#d48743] uppercase tracking-widest px-3 py-1 rounded font-mono">
                    Controle Industrial Próprio
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-100">
                  {saved.name || 'Arruador de Café VarreFort-S'}
                </h1>
                
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  {saved.description || `O VarreFort-S é o arruador soprador de café projetado especificamente para trabalhar em baixas rotações (1.300 a 1.500 RPM no motor do trator), entregando até 20% de economia direta de diesel e um café 100% enfileirado e limpo sem agressões mecânicas ao solo.`}
                </p>
              </div>

              {/* Specs Table */}
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8 space-y-6">
                <h4 className="text-xs uppercase font-bold text-[#d48743] tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#d48743]" /> Ficha Técnica Oficial de Fábrica
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
                  {specsObj.larguraAberto && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Largura (Aberto)</span>
                      <strong className="text-sm text-zinc-100 font-mono block mt-1.5">{specsObj.larguraAberto}</strong>
                    </div>
                  )}
                  {specsObj.larguraFechado && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Largura (Fechado)</span>
                      <strong className="text-sm text-zinc-100 font-mono block mt-1.5">{specsObj.larguraFechado}</strong>
                    </div>
                  )}
                  {specsObj.comprimento && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Comprimento</span>
                      <strong className="text-sm text-zinc-100 font-mono block mt-1.5">{specsObj.comprimento}</strong>
                    </div>
                  )}
                  {specsObj.alturaTotal && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Altura Total</span>
                      <strong className="text-sm text-zinc-100 font-mono block mt-1.5">{specsObj.alturaTotal}</strong>
                    </div>
                  )}
                  {specsObj.pesoLiquido && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Peso Líquido</span>
                      <strong className="text-sm text-[#d48743] font-mono block mt-1.5">{specsObj.pesoLiquido}</strong>
                    </div>
                  )}
                  {specsObj.potenciaMinima && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Potência Mínima</span>
                      <strong className="text-sm text-[#d48743] font-mono block mt-1.5">{specsObj.potenciaMinima}</strong>
                    </div>
                  )}
                  {specsObj.vazaoHidraulica && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Vazão Hidráulica</span>
                      <strong className="text-sm text-zinc-100 font-mono block mt-1.5">{specsObj.vazaoHidraulica}</strong>
                    </div>
                  )}
                  {specsObj.rotacaoTdp && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Rotação TDP</span>
                      <strong className="text-sm text-zinc-100 font-mono block mt-1.5">{specsObj.rotacaoTdp}</strong>
                    </div>
                  )}
                  {specsObj.acoplamento && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850 col-span-2 sm:col-span-1">
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold">Acoplamento</span>
                      <strong className="text-xs text-zinc-100 block mt-2">{specsObj.acoplamento}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist Benefits */}
              <div className="space-y-5">
                <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Benefícios Exclusivos da Lâmina AgroPasi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {benefitsList.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3 text-xs">
                      <CheckCircle className="w-4 h-4 text-[#d48743] shrink-0 mt-0.5" />
                      <span className="text-zinc-300"><strong>{benefit.title}:</strong> {benefit.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Brochure Download */}
              <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-zinc-400 font-mono">Ficha técnica detalhada em PDF disponível</span>
                <button
                  onClick={() => handleDownload('Arruador VarreFort-S')}
                  disabled={downloadingCat !== null}
                  className="inline-flex items-center justify-center bg-[#262b3f] hover:bg-[#1a1e2c] text-white border-none px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  {downloadingCat === 'Arruador VarreFort-S' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-400" />
                      Baixando Ficha Técnica...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4 mr-2 text-[#d48743]" />
                      {downloadSuccess === 'Arruador VarreFort-S' ? 'Ficha Técnica Baixada ✓' : 'Baixar Folder Técnico PDF'}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div> {/* Close max-w-7xl */}

        {/* Integrated Savings Calculator for VarreFort-S */}
        <div className="border-t border-b border-zinc-900 bg-zinc-950 mt-16 sm:mt-24">
          <SavingsCalculator productId="varrefort-s" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28 mb-12 sm:mb-20">
          {/* Integrated Direct Contacts */}
          {renderContactsSection()}
        </div>

      </div>
    );
  }

  if (productId === 'varremax-x') {
    const saved = mainOverrides['varremax-x'] || {};

    // Dynamic specs parsing with fallbacks
    let specsObj = {
      capacidadeCarga: '1.500 Litros',
      rendimentoEstimado: 'Até 2.500 kg/hora',
      larguraAberto: '1,50 m a 2,00 m',
      potenciaMinima: 'Mínimo 60 cv',
      sistemaSeparador: 'Turbina de sucção dupla com peneira vibratória autolimpante'
    };

    if (saved.specsJson) {
      try {
        const parsed = safeParseJson(saved.specsJson);
        if (parsed) {
          specsObj = { ...specsObj, ...parsed };
        }
      } catch (e) {
        console.error('Error parsing specsJson for varremax-x:', e);
      }
    }

    // Dynamic benefits parsing with fallbacks
    let benefitsList = [
      { title: 'Peneiramento Vibratório de Alta Frequência', desc: 'Filtra terra e galhos finos antes do armazenamento no reservatório.' },
      { title: 'Reservatório com Basculamento Hidráulico', desc: 'Descarga direta e rápida na carreta de transbordo com menos esforço físico.' },
      { title: 'Baixa Compactação de Solo', desc: 'Eixos distribuidores de peso com pneus flutuantes largos para proteger as raízes superficiais.' }
    ];

    if (saved.benefitsJson) {
      try {
        const parsed = safeParseJson(saved.benefitsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          benefitsList = parsed;
        }
      } catch (e) {
        console.error('Error parsing benefitsJson for varremax-x:', e);
      }
    }

    return (
      <div className="py-20 bg-zinc-950 text-zinc-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
          
          {/* Breadcrumb & Back */}
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
              <span className="text-zinc-300">{saved.name || 'Recolhedora RecolheFort-C'}</span>
            </div>
          </div>

          {/* Main Block Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Visual Blueprint/Photo Section */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-[#d48743] border border-[#d48743] text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded font-mono">
                  Protótipo 3D
                </div>
                <div className="absolute top-4 right-4 bg-[#262b3f]/30 border border-[#262b3f]/50 text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded font-mono">
                  Modelo 2026
                </div>

                {/* Product Image */}
                <div className="w-full h-64 sm:h-80 flex items-center justify-center relative select-none bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden mt-4">
                  <img 
                    src={saved.image || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=1200'} 
                    alt={saved.name || "Recolhedora de Café RecolheFort-C"} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Photo Overlay Badge */}
                  <div className="absolute bottom-4 right-4 flex flex-col space-y-1 text-right bg-zinc-950/85 p-2.5 rounded-lg border border-zinc-800 backdrop-blur-sm">
                    <span className="text-[10px] text-[#d48743] font-bold font-sans">Modelo Conceitual 3D</span>
                    <span className="text-[8px] text-zinc-400 font-mono">AgroPasi {saved.name || 'RecolheFort-C'}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Turbina Dupla</span>
                    <span className="text-[10px] text-zinc-400 leading-tight font-sans">Alto poder de sucção autolimpante</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Capacidade</span>
                    <span className="text-[10px] text-zinc-400 leading-tight font-sans">2.500 kg/hora de recolhimento</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-bold mb-1">Depósito</span>
                    <span className="text-[10px] text-zinc-400 leading-tight font-sans">1.500 Litros com basculamento</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Specifications Column */}
            <div className="lg:col-span-6 space-y-10 sm:space-y-12">
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-[#d48743] border border-[#d48743] uppercase tracking-widest px-3 py-1 rounded font-mono">
                    Linha Pesada
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest px-3 py-1 rounded font-mono">
                    Lançamento Oficial
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-100">
                  {saved.name || 'Recolhedora de Café RecolheFort-C'}
                </h1>

                <div className="space-y-4">
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                    {saved.description || `Cadastre seu e-mail e receba em primeira mão as especificações técnicas, fotos de campo e condições especiais de pré-venda.`}
                  </p>
                  
                  {!teaserSuccess ? (
                    <form onSubmit={handleTeaserSubmit} className="flex flex-col sm:flex-row gap-2 mt-4 max-w-md">
                      <input 
                        type="email" 
                        required
                        placeholder="Digite seu e-mail de preferência" 
                        value={teaserEmail}
                        onChange={(e) => setTeaserEmail(e.target.value)}
                        className="bg-zinc-900 border border-zinc-850 text-xs text-zinc-150 placeholder:text-zinc-400 rounded-xl px-4 py-3 focus:outline-none focus:border-[#d48743] flex-grow font-sans"
                      />
                      <button 
                        type="submit" 
                        className="bg-[#d48743] hover:bg-[#c27a41] text-white px-5 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
                      >
                        Quero ser o Primeiro a Saber
                      </button>
                    </form>
                  ) : (
                    <div className="bg-emerald-950/45 border border-emerald-900/50 rounded-xl p-4 text-emerald-400 text-xs font-semibold">
                      ✓ Obrigado! Seu e-mail foi cadastrado com sucesso. Você receberá todas as novidades em primeira mão!
                    </div>
                  )}
                </div>
              </div>

              {/* Specs Grid */}
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8 space-y-6">
                <h4 className="text-xs uppercase font-bold text-[#d48743] tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#d48743]" /> Especificações Básicas Estimadas
                </h4>

                <div className="grid grid-cols-2 gap-5 sm:gap-6 text-xs">
                  {specsObj.capacidadeCarga && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold">Capacidade de Carga</span>
                      <strong className="text-zinc-200 font-mono block mt-1.5">{specsObj.capacidadeCarga}</strong>
                    </div>
                  )}
                  {specsObj.rendimentoEstimado && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold">Rendimento Estimado</span>
                      <strong className="text-zinc-200 font-mono block mt-1.5">{specsObj.rendimentoEstimado}</strong>
                    </div>
                  )}
                  {specsObj.larguraAberto && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold">Largura de Trabalho</span>
                      <strong className="text-zinc-200 font-mono block mt-1.5">{specsObj.larguraAberto}</strong>
                    </div>
                  )}
                  {specsObj.potenciaMinima && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850">
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold">Potência Requerida</span>
                      <strong className="text-zinc-200 font-mono block mt-1.5">{specsObj.potenciaMinima}</strong>
                    </div>
                  )}
                  {specsObj.sistemaSeparador && (
                    <div className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850 col-span-2">
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold">Sistema Separador de Impurezas</span>
                      <strong className="text-zinc-200 block mt-1.5 font-sans">{specsObj.sistemaSeparador}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits list */}
              <div className="space-y-5">
                <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Principais Recursos Projetados</h4>
                <div className="grid grid-cols-1 gap-y-4">
                  {benefitsList.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3 text-xs">
                      <CheckCircle className="w-4 h-4 text-[#d48743] shrink-0 mt-0.5" />
                      <span className="text-zinc-300"><strong>{benefit.title}:</strong> {benefit.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Brochure Download */}
              <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-zinc-400 font-mono">Ficha técnica detalhada em PDF disponível</span>
                <button
                  onClick={() => handleDownload('Recolhedora RecolheFort-C')}
                  disabled={downloadingCat !== null}
                  className="inline-flex items-center justify-center bg-[#262b3f] hover:bg-[#1a1e2c] text-white border-none px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  {downloadingCat === 'Recolhedora RecolheFort-C' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-400" />
                      Baixando Ficha Técnica...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4 mr-2 text-[#d48743]" />
                      {downloadSuccess === 'Recolhedora RecolheFort-C' ? 'Ficha Técnica Baixada ✓' : 'Baixar Folder Técnico PDF'}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div> {/* Close max-w-7xl */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28 mb-12 sm:mb-20">
          {/* Integrated Direct Contacts */}
          {renderContactsSection()}
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // PASIPARTS SPARE PARTS SUPPORT DETAIL PAGE
  // -------------------------------------------------------------
  
  // Filtering local database parts
  const PARTS_LIST = [
    { code: 'AP-HE-2026', name: 'Hélice Balanceada Dinamicamente', category: 'Turbina', material: 'Aço Carbono Especial' },
    { code: 'AP-EX-1029', name: 'Eixo Tracionador Forjado e Cementado', category: 'Transmissão', material: 'Ligas de Aço Temperado' },
    { code: 'AP-CO-G5V', name: 'Jogo de Correias Sincronizadoras Gates 5V', category: 'Correias', material: 'Borracha Sincronizada Gates' },
    { code: 'AP-RL-22212', name: 'Rolamentos Autocompensadores Blindados', category: 'Rolamento', material: 'Blindagem de Vedação Dupla' },
    { code: 'AP-BC-360', name: 'Bico Soprador Direcionador Ajustável', category: 'Sopro', material: 'Aço Inox Escovado' }
  ];

  const filteredParts = PARTS_LIST.filter(part => {
    return part.name.toLowerCase().includes(partsSearch.toLowerCase()) || 
           part.code.toLowerCase().includes(partsSearch.toLowerCase()) ||
           part.category.toLowerCase().includes(partsSearch.toLowerCase());
  });

  return (
    <div className="py-20 bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
        
        {/* Breadcrumb & Back */}
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
            <span className="text-zinc-300">Peças de Reposição & Suporte</span>
          </div>
        </div>

        {/* Main Block Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Descriptions & Parts Catalogue Search */}
          <div className="lg:col-span-7 space-y-10 sm:space-y-12">
            
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-[#d48743] border border-[#d48743] uppercase tracking-widest px-3 py-1 rounded font-mono">
                  Peças Genuínas
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest px-3 py-1 rounded font-mono">
                  Suporte Pós-Venda
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-zinc-100">
                {mainOverrides['pasiparts']?.name || 'Peças de Reposição & Suporte Técnico'}
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {mainOverrides['pasiparts']?.description || `Deixamos de lado esperas burocráticas por peças sob encomenda. Por termos estrutura industrial própria de mais de 20 anos, garantimos a fabricação e disponibilidade imediata de engrenagens, rolamentos autocompensadores, bicos reguladores e hélices balanceadas para todo o agronegócio nacional.`}
              </p>
            </div>

            {/* Interactive parts list filter search box */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#d48743]" /> Consulta de Peças de Reposição Rápidas
                </h3>
                <span className="text-[10px] bg-zinc-950 text-[#d48743] px-2 py-1 rounded border border-zinc-800 font-mono">
                  Disponibilidade: 100% Genuínas
                </span>
              </div>

              {/* Search bar */}
              <div>
                <input 
                  type="text"
                  placeholder="Digite o nome da peça ou código original (Ex: Turbina, AP-TB-2026)..."
                  value={partsSearch}
                  onChange={(e) => setPartsSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#d48743] font-mono"
                />
              </div>

              {/* Parts table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-semibold">
                      <th className="pb-2">Peça / Código</th>
                      <th className="pb-2">Material / Tipo</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.length > 0 ? (
                      filteredParts.map((part) => (
                        <tr key={part.code} className="border-b border-zinc-800/50 hover:bg-zinc-850/40 transition">
                          <td className="py-3 pr-2">
                            <span className="block font-bold text-zinc-150">{part.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{part.code}</span>
                          </td>
                          <td className="py-3">
                            <span className="block font-medium text-zinc-300">{part.category}</span>
                            <span className="text-[10px] text-zinc-500">{part.material}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="inline-block text-[9px] uppercase font-bold text-white bg-[#d48743] border border-[#d48743] px-2 py-0.5 rounded-full">
                              Pronto Envio
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-zinc-500 font-mono">
                          Nenhuma peça correspondente localizada. Fale direto com suporte!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Technical Notice */}
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                *Todas as peças são usinadas de acordo com as especificações rígidas da norma ASTM-36 com calibração digital.
              </p>
            </div>

          </div>

          {/* Right Column: Support & Video Info */}
          <div className="lg:col-span-5 space-y-10 sm:space-y-12">
            
            {/* Table of pieces and maintenance digital brochure */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
              <div className="w-10 h-10 rounded-lg bg-[#d48743] border border-[#d48743] text-white flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 font-sans">
                Tabela de Manutenção Genuína
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Oferecemos acesso livre ao nosso manual completo de suporte de manutenção e códigos de peças de reposição rápidas da fábrica. Leia agora mesmo de forma digital sem complicação.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => handleDownload('Pecas de Reposicao')}
                  disabled={downloadingCat !== null}
                  className="w-full inline-flex items-center justify-center bg-[#262b3f] hover:bg-[#1a1e2c] text-white border-none py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  {downloadingCat === 'Pecas de Reposicao' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#d48743]" />
                      Carregando Catálogo...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4 mr-2 text-[#d48743]" />
                      {downloadSuccess === 'Pecas de Reposicao' ? 'Catálogo Baixado ✓' : 'Acessar Catálogo de Peças'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quality Standard Card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4.5">
              <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Padrão de Fabricação Industrial</h4>
              <ul className="text-xs text-zinc-400 space-y-3">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#d48743] shrink-0 mt-0.5" />
                  <span><strong>CNC Centering:</strong> Hélices balanceadas sob eixos centrais micrométricos eliminando vibrações secundárias.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#d48743] shrink-0 mt-0.5" />
                  <span><strong>Laser Cutting:</strong> Acoplamentos de três pontos recortados com precisão laser evitando imperfeições ou folgas de pino.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Contacts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28 mb-12 sm:mb-20">
          {/* Integrated Direct Contacts */}
          {renderContactsSection()}
        </div>

        {/* -------------------------------------------------------------
            MODAL CATALOGS POPUP READER INLINE
        ------------------------------------------------------------- */}
        {selectedCatalog && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" id="catalog-modal">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col my-8">
              
              {/* Header */}
              <div className="p-6 border-b border-zinc-900 flex justify-between items-start bg-zinc-900/40">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#d48743] font-mono tracking-widest flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Documento Oficial Digital
                  </span>
                  <h3 className="text-lg font-bold font-sans text-zinc-100">
                    {selectedCatalog === 'Arruador VarreFort-S' ? 'Catálogo Técnico: VarreFort-S' : 'Lista Genuína: Peças de Reposição & Suporte Técnico'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedCatalog(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 p-2 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simulated terminal/PDF style body */}
              <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4 font-mono text-xs text-zinc-350 bg-zinc-900/20">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 relative">
                  <button 
                    onClick={() => copyToClipboard(getCatalogFileContent(selectedCatalog))}
                    className="absolute top-3 right-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-1.5 rounded text-zinc-400 hover:text-zinc-100 transition flex items-center gap-1 font-sans text-[10px]"
                    title="Copiar Texto"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#d48743]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                  <pre className="whitespace-pre-wrap overflow-x-auto text-zinc-400 font-mono text-[11px] leading-relaxed">
                    {getCatalogFileContent(selectedCatalog)}
                  </pre>
                </div>
              </div>

              {/* Close Footer */}
              <div className="p-6 border-t border-zinc-900 bg-zinc-900/40 text-right">
                <button 
                  onClick={() => setSelectedCatalog(null)}
                  className="bg-[#d48743] hover:bg-[#c27a41] text-zinc-950 text-xs font-bold py-2 px-5 rounded-lg transition"
                >
                  Concluir Leitura
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

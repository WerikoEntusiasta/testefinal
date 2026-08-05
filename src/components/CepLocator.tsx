import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, CheckCircle2, ArrowRight, Sparkles, Building2, Shield, Download, Trash2, X } from 'lucide-react';
import { ColumnLead, Representative } from '../types';
import { api } from '../lib/api';

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

// Let's seed representatives for key agricultural coffee regions in Brazil
export const REPRESENTATIVES: Representative[] = [
  {
    id: 'rep_hq',
    name: 'José (Escritório Central / Vendas SP)',
    region: 'Todo o Brasil / Catanduva-SP',
    phone: '17991066796',
    email: 'jose.vendas@agropasi.com.br',
    coverCeps: [], // Default fallback
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rep_mogiana',
    name: 'José (Oeste Paulista & Mogiana)',
    region: 'Alta Mogiana, Catanduva e Oeste de SP',
    phone: '17991066796',
    email: 'jose.vendas@agropasi.com.br',
    coverCeps: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
    avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rep_minas',
    name: 'Djalma (Cerrado & Sul de Minas)',
    region: 'Sul de Minas, Varginha, Patrocínio e Cerrado Mineiro',
    phone: '35998993966',
    email: 'djalma.vendas@agropasi.com.br',
    coverCeps: ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39'],
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rep_vitoria',
    name: 'Felipe Lourenço (Espírito Santo Conilon)',
    region: 'Espírito Santo, Região Caparaó e Norte Fluminense',
    phone: '17991066796',
    email: 'felipe.l@agropasi.com.br',
    coverCeps: ['29', '20', '21', '22', '24', '25', '26', '27', '28'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'rep_parana',
    name: 'José / Ronaldo (Região Sul)',
    region: 'Norte Pioneiro do Paraná e Santa Catarina',
    phone: '17991066796',
    email: 'ronaldo.s@agropasi.com.br',
    coverCeps: ['80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

interface CepLocatorProps {
  variant?: 'full' | 'dark-compact';
}

export default function CepLocator({ variant = 'full' }: CepLocatorProps) {
  const [cep, setCep] = useState<string>('');
  const [reps, setReps] = useState<Representative[]>(REPRESENTATIVES);
  const [selectedRep, setSelectedRep] = useState<Representative>(REPRESENTATIVES[0]);
  const [searched, setSearched] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [cropSize, setCropSize] = useState<string>('');
  const [tractorModel, setTractorModel] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  // LGPD states
  const [lgpdPhone, setLgpdPhone] = useState<string>('');
  const [lgpdExportedData, setLgpdExportedData] = useState<any[] | null>(null);
  const [lgpdStatus, setLgpdStatus] = useState<string>('');
  const [showLgpdPanel, setShowLgpdPanel] = useState<boolean>(false);

  // Load reps from localStorage if available
  const loadRepsList = () => {
    const stored = localStorage.getItem('agropasi_cms_reps');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReps(parsed);
          setSelectedRep(prev => {
            const currentExist = parsed.find((r: any) => r.id === prev?.id);
            return currentExist || parsed[0];
          });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setReps(REPRESENTATIVES);
    setSelectedRep(prev => {
      const currentExist = REPRESENTATIVES.find(r => r.id === prev?.id);
      return currentExist || REPRESENTATIVES[0];
    });
  };

  useEffect(() => {
    loadRepsList();
    window.addEventListener('storage_updated', loadRepsList);
    return () => window.removeEventListener('storage_updated', loadRepsList);
  }, []);

  // Auto-detect representative based on PEP prefix (first 2 digits)
  useEffect(() => {
    const digitsOnly = cep.replace(/\D/g, '');
    if (digitsOnly.length >= 2) {
      const prefix = digitsOnly.substring(0, 2);
      const matchedRep = reps.find(r => r.coverCeps.includes(prefix));
      if (matchedRep) {
        setSelectedRep(matchedRep);
        setSearched(true);
      } else {
        setSelectedRep(reps[0] || REPRESENTATIVES[0]);
      }
    } else if (digitsOnly.length === 0) {
      setSelectedRep(reps[0] || REPRESENTATIVES[0]);
      setSearched(false);
    }
  }, [cep, reps]);

  const handleCepSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = cep.replace(/\D/g, '');
    if (!digitsOnly) return;
    
    const prefix = digitsOnly.substring(0, 2);
    const matchedRep = reps.find(r => r.coverCeps.includes(prefix));
    if (matchedRep) {
      setSelectedRep(matchedRep);
    } else {
      setSelectedRep(reps[0] || REPRESENTATIVES[0]);
    }
    setSearched(true);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const parsedMsg = message || `Interesse em Implementos AgroPasi (Tamanho da Lavoura: ${cropSize || 'N/A'} ha)`;
      
      // Submit lead to secure SQLite backend with full validation
      const res = await api.submitLead({
        name,
        phone,
        email,
        cep,
        tractorModel,
        message: parsedMsg,
        representativeId: selectedRep.id,
        representativeName: selectedRep.name,
        consentGiven: true
      });

      if (res && res.success) {
        setSubmitted(true);

        // Trigger WhatsApp redirection
        const waText = `Olá ${selectedRep.name}, enviei uma solicitação pelo site AgroPasi!\n\n` +
          `*Nome:* ${name}\n` +
          `*Telefone:* ${phone}\n` +
          `*Região/CEP:* ${cep}\n` +
          `*Tamanho da Lavoura:* ${cropSize ? `${cropSize} ha` : 'Não informado'}\n` +
          `*Modelo Trator:* ${tractorModel ? tractorModel : 'Não informado'}\n` +
          `*Mensagem:* ${parsedMsg}`;

        const encodedText = encodeURIComponent(waText);
        const waUrl = `https://wa.me/55${selectedRep.phone}?text=${encodedText}`;

        setTimeout(() => {
          window.open(waUrl, '_blank');
        }, 1200);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar dados. Por favor, verifique os campos.');
    }
  };

  const handleLgpdExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdPhone) return;
    setLgpdStatus('Buscando seus registros...');
    setLgpdExportedData(null);
    try {
      const res = await api.exportMyData(lgpdPhone);
      setLgpdExportedData(res.leads);
      if (res.leads.length === 0) {
        setLgpdStatus('Nenhum registro de contato localizado para este telefone.');
      } else {
        setLgpdStatus('Registros localizados! Veja o resumo dos seus dados abaixo:');
      }
    } catch (err: any) {
      setLgpdStatus(err.message || 'Falha ao buscar dados.');
    }
  };

  const handleLgpdDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdPhone) return;
    if (!window.confirm('Atenção: Deseja realmente deletar permanentemente todas as suas mensagens e dados do nosso servidor? Esta ação é irreversível e atende aos direitos da LGPD.')) {
      return;
    }
    setLgpdStatus('Processando exclusão permanente...');
    setLgpdExportedData(null);
    try {
      const res = await api.deleteMyData(lgpdPhone);
      setLgpdStatus(`Sucesso! Excluímos com êxito ${res.deletedCount} registro(s) associado(s) ao telefone informado.`);
      setLgpdPhone('');
    } catch (err: any) {
      setLgpdStatus(err.message || 'Falha ao excluir dados.');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCep('');
    setCropSize('');
    setTractorModel('');
    setMessage('');
    setSubmitted(false);
    setSearched(false);
    setSelectedRep(reps[0] || REPRESENTATIVES[0]);
  };

  if (variant === 'dark-compact') {
    return (
      <div className="bg-zinc-900/60 border border-zinc-850 rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto space-y-6 text-zinc-105 my-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d48743]/10 border border-[#d48743]/30 text-[#d48743] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-zinc-150 font-sans">Localizar Representante Regional</h3>
            <p className="text-xs text-zinc-400">Digite seu CEP para encontrar o consultor especialista exclusivo da sua região.</p>
          </div>
        </div>

        {/* CEP Input Bar */}
        <form onSubmit={handleCepSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              maxLength={9}
              placeholder="Ex: 15802-200 ou 15802200"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-10 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-mono placeholder-zinc-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#d48743] hover:bg-[#c27a41] text-white font-semibold text-xs px-5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: '#d48743' }}
          >
            Buscar Representante
          </button>
        </form>

        {/* Matched Representative display with Quero Contatar button */}
        <div className="pt-2">
          {searched ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedRep.avatarUrl}
                    alt={selectedRep.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#d48743]"
                  />
                  <div>
                    <span className="inline-block text-[9px] uppercase tracking-wider text-[#d48743] font-extrabold mb-0.5">
                      Consultor Regional Localizado ✓
                    </span>
                    <h4 className="text-sm font-bold text-zinc-150 leading-tight">{selectedRep.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{selectedRep.region}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setIsContactModalOpen(true);
                  }}
                  className="w-full sm:w-auto bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-md"
                  style={{ backgroundColor: '#d48743' }}
                >
                  <Sparkles className="w-4 h-4" />
                  Enviar Mensagem / Cotação
                </button>
              </div>

              {/* Direct WhatsApp & Email Buttons */}
              <div className="pt-3 border-t border-zinc-850 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`https://wa.me/55${selectedRep.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedRep.name}, localizei seu contato pelo CEP no site AgroPasi!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span>WhatsApp ({formatPhone(selectedRep.phone)})</span>
                </a>

                <a
                  href={`mailto:${selectedRep.email}`}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-zinc-800 transition-all truncate"
                  title={`Enviar e-mail para ${selectedRep.email}`}
                >
                  <Mail className="w-4 h-4 text-[#d48743] shrink-0" />
                  <span className="truncate">{selectedRep.email}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-xs text-zinc-400 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <Building2 className="w-4 h-4 text-zinc-600 shrink-0" />
              <span>Informe seu CEP acima para localizar seu consultor técnico exclusivo e solicitar cotações ou catálogos.</span>
            </div>
          )}
        </div>

        {/* Modal Popout */}
        {isContactModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col my-8 text-zinc-100">
              {/* Close Button */}
              <button
                onClick={() => setIsContactModalOpen(false)}
                type="button"
                className="absolute top-4 right-4 p-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-[#d48743] rounded-full transition border border-zinc-850 z-10 cursor-pointer"
                title="Fechar formulário"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Form content */}
              <div className="p-6 sm:p-8 space-y-6">
                {submitted ? (
                  <div className="py-8 text-center space-y-4 animate-fadeIn">
                    <div className="inline-flex items-center justify-center p-3.5 bg-[#d48743] text-white rounded-full mb-1">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold font-sans text-zinc-150">
                      Mensagem Recebida com Sucesso!
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Obrigado, <strong className="text-zinc-150">{name}</strong>. Seus dados foram salvos e atribuídos com a tag de atendimento exclusiva para o vendedor <strong className="text-[#d48743] font-bold">{selectedRep.name}</strong> para o seu atendimento.
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Você também está sendo direcionado para o WhatsApp dele para suporte imediato...
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                      <a
                        href={`https://wa.me/55${selectedRep.phone}?text=${encodeURIComponent(`Olá ${selectedRep.name}, enviei uma solicitação pelo site AgroPasi!\n\n*Nome:* ${name}\n*Região:* ${cep}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm"
                      >
                        Ir Para WhatsApp Manualmente
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setIsContactModalOpen(false);
                        }}
                        className="text-xs font-semibold text-zinc-400 hover:text-[#d48743] transition py-2 px-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-850"
                      >
                        Fechar Janela
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-left bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedRep.avatarUrl}
                          alt={selectedRep.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-[#d48743]"
                        />
                        <div>
                          <span className="text-[9px] uppercase font-bold text-[#d48743] font-mono tracking-widest flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" /> Atendimento Atribuído
                          </span>
                          <h3 className="text-sm font-bold font-sans text-zinc-150">
                            {selectedRep.name}
                          </h3>
                          <p className="text-[11px] text-zinc-400">
                            {selectedRep.region}
                          </p>
                        </div>
                      </div>

                      {/* Direct WhatsApp and Email badges inside modal */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href={`https://wa.me/55${selectedRep.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedRep.name}, gostaria de atendimento sobre implementos AgroPasi!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp ({formatPhone(selectedRep.phone)})</span>
                        </a>

                        <a
                          href={`mailto:${selectedRep.email}`}
                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-zinc-800 transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#d48743]" />
                          <span>{selectedRep.email}</span>
                        </a>
                      </div>
                    </div>

                    <form onSubmit={handleLeadSubmit} className="space-y-3.5 pt-2 text-left">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                          Seu Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: João da Silva"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Phone */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                            Telefone / WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Ex: (17) 99106-6796"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-sans"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                            Seu E-mail (Opcional)
                          </label>
                          <input
                            type="email"
                            placeholder="Ex: seuemail@provedor.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Crop Size */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                            Tamanho da Lavoura ( hectares )
                          </label>
                          <input
                            type="number"
                            placeholder="Ex: 45"
                            value={cropSize}
                            onChange={(e) => setCropSize(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-sans"
                          />
                        </div>

                        {/* Tractor model */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                            Modelo de Trator do Sítio
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Massey 275, Valtra A750"
                            value={tractorModel}
                            onChange={(e) => setTractorModel(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-sans"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                          Dúvida ou Solicitação Adicional
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Gostaria de solicitar orçamento e saber mais informações sobre os prazos de entrega..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-sans resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer mt-3"
                        style={{ backgroundColor: '#d48743' }}
                      >
                        Enviar e Solicitar Contato do Representante
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>

                      <p className="text-[9px] text-zinc-500 text-center leading-normal mt-2">
                        *Ao enviar, o lead será registrado com a tag de atendimento exclusiva para o vendedor {selectedRep.name}.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <section id="contato" className="py-20 bg-white text-zinc-900 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Information & Locator panel */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="inline-block px-3 py-1 bg-[#d48743] !text-white border border-[#d48743] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
                Atendimento Direto
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-zinc-900 mb-4">
                Fale com a <span className="text-[#d48743] bg-white px-1.5 py-0.5 rounded border border-zinc-200" id="agropasi-brand" style={{ color: '#d48743' }}>AgroPasi</span>
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                Temos representantes estratégicos dedicados às principais bacias produtoras de café e grãos do Brasil. Digite seu CEP para acionar o consultor especialista da sua região.
              </p>
            </div>

            {/* CEP Search Bar Widget */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 mb-3 flex items-center">
                <MapPin className="w-4 h-4 text-[#d48743] mr-2 shrink-0" />
                Localizar Representante Regional
              </h3>
              <form onSubmit={handleCepSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="Ex: 15802-200 ou 15802200"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-[#d48743] font-mono text-zinc-900 placeholder-zinc-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-[#d48743] hover:bg-[#c27a41] text-white font-semibold text-xs px-4 rounded-lg transition-all"
                  style={{ backgroundColor: '#d48743' }}
                >
                  Buscar
                </button>
              </form>

              {/* Instant matched representative presentation */}
              <div className="mt-4 pt-4 border-t border-zinc-200">
                {searched ? (
                  <div className="bg-zinc-900 text-white border border-zinc-800 rounded-xl p-4 space-y-3.5 animate-fadeIn shadow-lg text-left">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={selectedRep.avatarUrl}
                        alt={selectedRep.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#d48743]"
                      />
                      <div className="flex-grow min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider text-[#d48743] font-extrabold">
                          Representante Regional Atribuído ✓
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">{selectedRep.name}</h4>
                        <p className="text-xs text-zinc-400 truncate">{selectedRep.region}</p>
                      </div>
                    </div>

                    {/* Direct WhatsApp & Email Buttons */}
                    <div className="pt-2.5 border-t border-zinc-800 flex flex-col gap-2">
                      <a
                        href={`https://wa.me/55${selectedRep.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedRep.name}, encontrei seu contato via busca por CEP no site AgroPasi!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                        <span>Falar no WhatsApp ({formatPhone(selectedRep.phone)})</span>
                      </a>

                      <a
                        href={`mailto:${selectedRep.email}`}
                        className="w-full bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 border border-zinc-700 transition-all truncate"
                        title={`Enviar e-mail para ${selectedRep.email}`}
                      >
                        <Mail className="w-4 h-4 text-[#d48743] shrink-0" />
                        <span className="truncate">{selectedRep.email}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-xs text-white bg-[#d48743] p-3 rounded-lg border border-[#d48743] shadow-sm" style={{ backgroundColor: '#d48743', borderColor: '#d48743' }}>
                    <Building2 className="w-4 h-4 text-white shrink-0" />
                    <span className="!text-white">Informe seu CEP acima para localizar seu consultor técnico exclusivo.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct sales contact coordinates */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Canais de Suporte
              </h3>
              
              <div className="flex items-center space-x-3 bg-[#d48743] p-3 rounded-lg">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase !text-white font-semibold tracking-wider">Telefone & WhatsApp (José)</span>
                  <a href="tel:5517991066796" className="text-sm font-bold !text-white hover:text-zinc-200 transition" id="phone-link" style={{ color: '#ffffff' }}>
                    (17) 99106-6796
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-[#d48743] p-3 rounded-lg">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase !text-white font-semibold tracking-wider">E-mail Comercial</span>
                  <a href="mailto:comercial@agropasi.com.br" className="text-sm font-bold !text-white hover:text-zinc-200 transition" id="email-link" style={{ color: '#ffffff' }}>
                    comercial@agropasi.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-[#d48743] p-3 rounded-lg">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase !text-white font-semibold tracking-wider">Sede Fabril</span>
                  <address className="text-xs font-medium !text-white not-italic" style={{ color: '#ffffff' }}>
                    Av. Dona Engracia Agudo Romão, 891 - Catanduva/SP - CEP 15802-200
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form panel / Lead grabber */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="py-12 px-4 text-center space-y-4 animate-fadeIn">
                  <div className="inline-flex items-center justify-center p-3 bg-[#d48743] text-white rounded-full mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-sans text-zinc-900">
                    Mensagem Recebida com Sucesso!
                  </h3>
                  <p className="text-sm text-zinc-600 max-w-md mx-auto">
                    Obrigado, <strong className="text-zinc-900">{name}</strong>. Seus dados foram computados e atribuídos ao representante <strong className="text-zinc-900">{selectedRep.name}</strong>.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Direcionando você para o WhatsApp do representante agora para atendimento imediato...
                  </p>
                  
                  <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={`https://wa.me/55${selectedRep.phone}?text=${encodeURIComponent(`Olá, sou ${name}, gostaria de falar sobre implementos AgroPasi.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm"
                      id="whatsapp-direct-btn"
                    >
                      Ir Para WhatsApp Manualmente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition py-2 px-4 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100"
                    >
                      Enviar Nova Mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold font-sans text-zinc-900">
                        Solicitar Orçamento / Catálogo
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Preencha o formulário abaixo e receba assessoria sem compromisso.
                      </p>
                    </div>
                    <span id="whatsapp-badge" className="flex items-center text-[10px] font-bold text-white bg-[#d48743] px-2 py-1 rounded border border-[#d48743]" style={{ color: '#ffffff' }}>
                      <Sparkles className="w-3 h-3 mr-1" /> WhatsApp Integrado
                    </span>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                        Seu Nome Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name-input"
                        type="text"
                        required
                        placeholder="Ex: João da Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#d48743] font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label htmlFor="phone-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                          Telefone / WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="phone-input"
                          type="tel"
                          required
                          placeholder="Ex: (17) 99106-6796"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#d48743] font-sans"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                          Seu E-mail (Opcional)
                        </label>
                        <input
                          id="email-input"
                          type="email"
                          placeholder="Ex: seuemail@provedor.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#d48743] font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Crop Size */}
                      <div>
                        <label htmlFor="crop-size" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                          Tamanho da Lavoura ( hectares )
                        </label>
                        <input
                          id="crop-size"
                          type="number"
                          placeholder="Ex: 45"
                          value={cropSize}
                          onChange={(e) => setCropSize(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#d48743] font-sans"
                        />
                      </div>

                      {/* Tractor model */}
                      <div>
                        <label htmlFor="tractor-model" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                          Modelo de Trator do Sítio
                        </label>
                        <input
                          id="tractor-model"
                          type="text"
                          placeholder="Ex: Massey 275, Valtra A750"
                          value={tractorModel}
                          onChange={(e) => setTractorModel(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#d48743] font-sans"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                        Dúvida ou Solicitação Adicional
                      </label>
                      <textarea
                        id="message-input"
                        rows={3}
                        placeholder="Gostaria de solicitar orçamento para o arruador de café e as condições de pagamento..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#d48743] font-sans resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-[#d48743]/10 flex items-center justify-center cursor-pointer"
                      id="submit-lead"
                      style={{ backgroundColor: '#d48743' }}
                    >
                      Enviar e Iniciar Conversa WhatsApp
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>

                    <p className="text-[10px] text-zinc-500 text-center leading-relaxed mt-2">
                      *Ao enviar, seus dados de contato serão processados pela nossa equipe comercial para direcionamento exclusivo de propostas e catálogos autorizados.
                    </p>
                  </form>
                </div>
              )}

              {/* LGPD Panel (Item 19: Transparency and client control) */}
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowLgpdPanel(!showLgpdPanel);
                    setLgpdStatus('');
                    setLgpdExportedData(null);
                  }}
                  className="w-full flex items-center justify-between text-zinc-500 hover:text-zinc-800 transition text-[11px] font-semibold"
                >
                  <span className="flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Direitos de Privacidade & LGPD (Exportar ou Excluir Dados)
                  </span>
                  <span>{showLgpdPanel ? '▲ Recolher' : '▼ Expandir'}</span>
                </button>

                {showLgpdPanel && (
                  <div className="mt-3 p-4 bg-zinc-100 rounded-xl border border-zinc-200 text-xs text-zinc-700 space-y-3 animate-fadeIn">
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), garantimos o pleno controle sobre os seus dados de contato comerciais. Forneça o telefone cadastrado para consultar ou requisitar a exclusão definitiva.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="tel"
                        placeholder="Telefone com DDD (Ex: 17991066796)"
                        value={lgpdPhone}
                        onChange={(e) => setLgpdPhone(e.target.value.replace(/\D/g, ''))}
                        className="flex-grow bg-white border border-zinc-300 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] font-mono"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleLgpdExport}
                          disabled={!lgpdPhone}
                          className="bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-[11px] transition flex items-center shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Exportar
                        </button>
                        <button
                          type="button"
                          onClick={handleLgpdDelete}
                          disabled={!lgpdPhone}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-[11px] transition flex items-center shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir Tudo
                        </button>
                      </div>
                    </div>

                    {lgpdStatus && (
                      <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 p-2.5 rounded-lg leading-relaxed">
                        {lgpdStatus}
                      </p>
                    )}

                    {lgpdExportedData && lgpdExportedData.length > 0 && (
                      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-[10px] border-collapse font-sans">
                          <thead>
                            <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-500 font-bold">
                              <th className="p-2">Data</th>
                              <th className="p-2">Mensagem</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 text-zinc-600">
                            {lgpdExportedData.map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-2 font-mono whitespace-nowrap">{item.date}</td>
                                <td className="p-2 leading-tight">{item.message}</td>
                                <td className="p-2 font-semibold">{item.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

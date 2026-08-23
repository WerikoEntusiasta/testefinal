import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Check, X, Info, Settings, Lock } from 'lucide-react';

interface CookieConsentProps {
  onOpenPrivacyPolicy?: () => void;
}

export default function CookieConsent({ onOpenPrivacyPolicy }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // Preference states
  const [performanceConsent, setPerformanceConsent] = useState(true);

  useEffect(() => {
    // Check existing consent
    const consent = localStorage.getItem('agropasi_cookie_consent');
    if (!consent) {
      // Delay display slightly for smooth page entry
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 30 seconds auto-fadeout timer if user does not respond
  useEffect(() => {
    if (!showBanner || showPreferencesModal) return;

    setIsFadingOut(false);
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      const hideTimer = setTimeout(() => {
        setShowBanner(false);
        setIsFadingOut(false);
      }, 1000);
      return () => clearTimeout(hideTimer);
    }, 30000);

    return () => clearTimeout(fadeTimer);
  }, [showBanner, showPreferencesModal]);

  useEffect(() => {
    // Listen to custom re-open request from Footer or Admin
    const handleReopen = () => {
      setIsFadingOut(false);
      setShowBanner(true);
      setShowPreferencesModal(true);
    };

    // Reset consent for testing
    const handleReset = () => {
      localStorage.removeItem('agropasi_cookie_consent');
      setIsFadingOut(false);
      setShowBanner(true);
      setShowPreferencesModal(false);
    };

    window.addEventListener('open_cookie_preferences', handleReopen);
    window.addEventListener('reset_cookie_consent', handleReset);
    return () => {
      window.removeEventListener('open_cookie_preferences', handleReopen);
      window.removeEventListener('reset_cookie_consent', handleReset);
    };
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('agropasi_cookie_consent', JSON.stringify({
      type: 'all',
      necessary: true,
      performance: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('agropasi_cookie_consent', JSON.stringify({
      type: 'essential',
      necessary: true,
      performance: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('agropasi_cookie_consent', JSON.stringify({
      type: 'custom',
      necessary: true,
      performance: performanceConsent,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating Bottom LGPD Cookie Banner */}
      {!showPreferencesModal && (
        <div 
          id="cookie-consent-banner" 
          onMouseEnter={() => setIsFadingOut(false)}
          className={`fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 bg-zinc-900/95 backdrop-blur-md text-white border border-zinc-800 p-5 rounded-2xl shadow-2xl space-y-4 transition-all duration-1000 ${
            isFadingOut 
              ? 'opacity-0 translate-y-4 pointer-events-none' 
              : 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-bottom-5'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-[#d48743]/15 text-[#d48743] rounded-xl shrink-0 mt-0.5 border border-[#d48743]/30">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-zinc-100 font-sans tracking-tight">
                  Sua Privacidade e Proteção de Dados (LGPD)
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  <Lock className="w-2.5 h-2.5 mr-1" /> Lei nº 13.709/2018
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Utilizamos cookies essenciais para garantir o funcionamento seguro do site, salvar suas preferências de navegação e melhorar sua experiência com os produtos AgroPasi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1 border-t border-zinc-800/80">
            <button
              onClick={() => setShowPreferencesModal(true)}
              type="button"
              id="cookie-preferences-btn"
              className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition border border-zinc-700/60 flex items-center cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              Preferências
            </button>
            <button
              onClick={handleAcceptEssential}
              type="button"
              id="cookie-accept-essential-btn"
              className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition border border-zinc-700/60 cursor-pointer"
            >
              Apenas Necessários
            </button>
            <button
              onClick={handleAcceptAll}
              type="button"
              id="cookie-accept-all-btn"
              className="px-4 py-2 text-xs font-bold text-white bg-[#d48743] hover:bg-[#c27a41] rounded-xl transition shadow-lg shadow-[#d48743]/20 flex items-center cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Aceitar Todos
            </button>
          </div>
        </div>
      )}

      {/* Preferences & LGPD Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            id="cookie-preferences-modal"
            className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#d48743]/10 text-[#d48743] rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100 font-sans">
                    Gerenciar Configurações de Privacidade
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Em conformidade com a LGPD (Lei Geral de Proteção de Dados)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPreferencesModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
                id="close-cookie-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4 text-xs">

              {/* Necessary Cookies */}
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-zinc-200">Cookies Estritamente Necessários</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded text-[10px] font-semibold">
                      Sempre Ativo
                    </span>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Essenciais para a navegação segura no site, autenticação de sessão de administradores, proteção contra solicitações maliciosas (CSRF) e salvamento das preferências de cookies do próprio visitante.
                </p>
              </div>

              {/* Performance & UX Cookies */}
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-200">Desempenho e Personalização de Experiência</span>
                    <p className="text-zinc-400 text-[11px]">
                      Permite lembrar filtros selecionados, preferências de produtos e histórico de consultas.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={performanceConsent}
                      onChange={(e) => setPerformanceConsent(e.target.checked)}
                      className="sr-only peer"
                      id="cookie-performance-toggle"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d48743]"></div>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-zinc-850/40 border border-zinc-800 rounded-xl flex items-start space-x-2.5 text-zinc-400 text-[11px]">
                <Info className="w-4 h-4 text-[#d48743] shrink-0 mt-0.5" />
                <p>
                  Não vendemos, transferimos ou compartilhamos seus dados pessoais com terceiros para fins publicitários. Seus dados são mantidos protegidos sob estrita conformidade com a legislação brasileira.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-zinc-800">
              <button
                onClick={handleAcceptEssential}
                type="button"
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition border border-zinc-700 cursor-pointer"
              >
                Recusar Opcionais
              </button>
              <button
                onClick={handleSavePreferences}
                type="button"
                className="px-5 py-2 text-xs font-bold text-white bg-[#d48743] hover:bg-[#c27a41] rounded-xl transition shadow-lg shadow-[#d48743]/20 cursor-pointer"
              >
                Salvar Minhas Preferências
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

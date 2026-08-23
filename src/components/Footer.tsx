import React from 'react';
import { Instagram, Send, MapPin, Phone, Mail, Award, ArrowUp, ShieldCheck } from 'lucide-react';
import AgroPasiLogo from './AgroPasiLogo';

interface FooterProps {
  logoUrl?: string;
}

export default function Footer({ logoUrl }: FooterProps) {
  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-850" style={{ backgroundColor: '#262b3f' }}>
      
      {/* Upper Footer: Quick Branding Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ color: '#ffffff' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Logo & Slogan Column */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#inicio" className="flex items-center space-x-3 group shrink-0">
              <AgroPasiLogo size="md" variant="dark-bg" showSubtitle={true} logoUrl={logoUrl} />
            </a>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm" style={{ color: '#ffffff' }}>
              Nascida de 60 anos de indústria familiar, a AgroPasi chegou ao campo para entregar implementos agrícolas que reduzem custos e maximizam a colheita.
            </p>

            <div className="flex space-x-3 pt-2">
              <a
                href="https://www.instagram.com/agro.pasi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-zinc-900/60 hover:bg-[#d48743] text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-all duration-200"
                title="Siga-nos no Instagram"
                id="footer-instagram-link"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:comercial@agropasi.com.br"
                className="p-2.5 bg-zinc-900/60 hover:bg-[#d48743] text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-all duration-200"
                title="Envie um e-mail"
                id="footer-email-link"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5517996355842?text=Olá!%20Vi%20o%20site%20da%20AgroPasi%20e%20gostaria%20de%20falar%20com%20um%20consultor."
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-zinc-900/60 hover:bg-[#d48743] text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-all duration-200"
                title="Fale no WhatsApp com o Representante"
                id="footer-whatsapp-link"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nav Links Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-widest" style={{ color: '#ffffff' }}>Navegação</h4>
            <ul className="text-xs text-zinc-400 space-y-2.5 font-sans" style={{ color: '#ffffff' }}>
              <li><a href="#inicio" className="hover:text-[#d48743] transition mb-0.5">Início</a></li>
              <li><a href="#sobre" className="hover:text-[#d48743] transition mb-0.5">Sobre Nós</a></li>
              <li><a href="#produtos" className="hover:text-[#d48743] transition mb-0.5">Produtos</a></li>
              <li><a href="#colhedora" className="hover:text-[#d48743] transition mb-0.5">Lançamentos</a></li>
            </ul>
          </div>

          {/* Tech Columns */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-widest font-sans" style={{ color: '#ffffff' }}>Especialidades</h4>
            <ul className="text-xs text-zinc-400 space-y-2.5 font-sans" style={{ color: '#ffffff' }}>
              <li><a href="#calculadora" className="hover:text-[#d48743] transition">Calculadora de Economia</a></li>

              <li><a href="#faq" className="hover:text-[#d48743] transition">FAQ de Dúvidas Técnicas</a></li>
              <li><a href="#blog" className="hover:text-[#d48743] transition">Dicas do Campo / Blog</a></li>
            </ul>
          </div>

          {/* Contact Coordinates */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-widest" style={{ color: '#ffffff' }}>Sede AgroPasi</h4>
            <ul className="text-xs text-zinc-400 space-y-3 font-sans">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 text-[#d48743] shrink-0 mt-0.5 mr-2.5" />
                <span style={{ color: '#ffffff' }}>
                  Av. Dona Engracia Agudo Romão, 891 - Catanduva/SP <br />
                  <span className="text-zinc-500 font-mono" style={{ color: '#ffffff' }}>CEP 15802-200</span>
                </span>
              </li>
              <li className="flex flex-col gap-1.5" style={{ color: '#ffffff' }}>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-[#d48743] shrink-0 mr-2.5" />
                  <span className="text-zinc-400 mr-1" style={{ color: '#ffffff' }}>José (SP/Fábrica):</span>
                  <a href="https://wa.me/5517996355842" target="_blank" rel="noopener noreferrer" className="hover:text-[#d48743] text-white transition font-bold font-mono">(17) 99635-5842</a>
                </div>
                <div className="flex items-center pl-6.5 text-zinc-400">
                  <span className="mr-1" style={{ color: '#ffffff' }}>Djalma (MG):</span>
                  <a href="https://wa.me/5535998993966" target="_blank" rel="noopener noreferrer" className="hover:text-[#d48743] text-white transition font-medium font-mono">(35) 99899-3966</a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 text-[#d48743] shrink-0 mr-2.5" />
                <a href="mailto:comercial@agropasi.com.br" className="hover:text-[#d48743] text-white transition font-mono truncate">comercial@agropasi.com.br</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar with copyright */}
      <div className="border-t border-zinc-900 bg-[#1c202f] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] text-zinc-400 text-center md:text-left leading-relaxed">
            © {new Date().getFullYear()} AgroPasi Implementos Agrícolas Ltda. Todos os direitos reservados. CNPJ sob consulta. <br />
            Desenvolvido para máxima eficiência no campo e menor consumo diesel.
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">
            <button
              onClick={() => window.dispatchEvent(new Event('open_cookie_preferences'))}
              type="button"
              className="inline-flex items-center text-[10px] bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded transition cursor-pointer"
              title="Gerenciar Preferências de Cookies e LGPD"
              id="footer-cookies-lgpd-link"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d48743] mr-1.5" /> Cookies & LGPD
            </button>
            <span className="inline-flex items-center text-[10px] bg-zinc-900/80 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded">
              <Award className="w-3.5 h-3.5 text-[#d48743] mr-1.5" /> Metalurgia Estável
            </span>
            <button
              onClick={scrollUp}
              type="button"
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-150 hover:text-[#d48743] transition cursor-pointer"
              title="Voltar ao início"
              id="footer-back-to-top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
}

import React, { useState, useEffect } from 'react';

interface AgroPasiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light-bg' | 'dark-bg';
  showSubtitle?: boolean;
  logoUrl?: string;
}

const DEFAULT_LOGO_URL = 'https://i.ibb.co/fGtfCqR2/Design-sem-nome-removebg-preview.png';

function normalizeLogoUrl(url?: string): string {
  if (!url || !url.trim()) return DEFAULT_LOGO_URL;
  if (
    url.includes('ibb.co/dJ6FQj9r') ||
    url.includes('ibb.co/dJ6FQj9') ||
    url.includes('ibb.co/cqGr40S') ||
    url.includes('ibb.co/23HM5cz2') ||
    url.includes('ibb.co/23HM5cz') ||
    url.includes('/agropasi-logo.jpg') ||
    url.includes('/agropasi-logo.png')
  ) {
    return DEFAULT_LOGO_URL;
  }
  return url.trim();
}

export default function AgroPasiLogo({
  className = '',
  size = 'md',
  variant = 'default',
  showSubtitle = false,
  logoUrl: propLogoUrl
}: AgroPasiLogoProps) {
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(normalizeLogoUrl(propLogoUrl));
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    const checkStoredLogo = () => {
      if (propLogoUrl && propLogoUrl.trim() !== '') {
        setCustomLogoUrl(normalizeLogoUrl(propLogoUrl));
        setImgError(false);
        return;
      }

      try {
        const stored = localStorage.getItem('agropasi_cms_hero');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.logoUrl && parsed.logoUrl.trim() !== '') {
            setCustomLogoUrl(normalizeLogoUrl(parsed.logoUrl));
            setImgError(false);
            return;
          }
        }
      } catch (e) {}

      setCustomLogoUrl(DEFAULT_LOGO_URL);
      setImgError(false);
    };

    checkStoredLogo();

    const handleStorageChange = () => {
      checkStoredLogo();
    };

    window.addEventListener('storage_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [propLogoUrl]);

  // Height and text size mappings
  const sizeMap = {
    sm: { textSize: 'text-lg', iconSize: 'w-5 h-5', subtitleSize: 'text-[7px]', imgHeight: 'h-7 sm:h-8' },
    md: { textSize: 'text-2xl', iconSize: 'w-6 h-6', subtitleSize: 'text-[8px]', imgHeight: 'h-9 sm:h-10' },
    lg: { textSize: 'text-3xl', iconSize: 'w-8 h-8', subtitleSize: 'text-[9px]', imgHeight: 'h-11 sm:h-13' },
    xl: { textSize: 'text-4xl', iconSize: 'w-10 h-10', subtitleSize: 'text-[10px]', imgHeight: 'h-14 sm:h-16' },
  };

  const { textSize, iconSize, subtitleSize, imgHeight } = sizeMap[size];

  const activeLogoUrl = customLogoUrl || propLogoUrl || DEFAULT_LOGO_URL;

  // If logo image exists and didn't fail to load, render it cleanly
  if (activeLogoUrl && !imgError) {
    return (
      <div className={`inline-flex items-center space-x-2 select-none font-sans ${className}`}>
        <img
          src={activeLogoUrl}
          alt="Logo AgroPasi"
          className={`${imgHeight} w-auto object-contain max-w-[260px] rounded`}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />

        {showSubtitle && (
          <div className="hidden sm:block border-l border-zinc-700/60 pl-2 py-0.5">
            <span className={`block ${subtitleSize} uppercase tracking-[0.25em] text-[#d48743] font-bold leading-tight`}>
              Implementos
            </span>
            <span className={`block ${subtitleSize} uppercase tracking-[0.25em] text-zinc-400 font-semibold leading-none`}>
              Agrícolas
            </span>
          </div>
        )}
      </div>
    );
  }

  // Color mappings for PASI text depending on background variant
  const pasiTextColor = 
    variant === 'light-bg' 
      ? 'text-[#2b3140]' 
      : variant === 'dark-bg' 
      ? 'text-white' 
      : 'text-zinc-150 group-hover:text-white';

  return (
    <div className={`inline-flex items-center space-x-2 select-none font-sans ${className}`}>
      <div className="flex items-center">
        {/* "AGR" in AgroPasi Ochre Gold */}
        <span className={`${textSize} font-extrabold tracking-tight text-[#d48743] font-sans uppercase`}>
          AGR
        </span>

        {/* Leaf 'O' icon matching official logo */}
        <div className={`relative ${iconSize} text-[#d48743] flex-shrink-0 inline-flex items-center justify-center mx-0.5 transform -rotate-6`}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
            {/* Leaf Outer Shape */}
            <path
              d="M 50 10 C 78 14 94 42 86 68 C 78 90 48 94 24 78 C 12 68 10 46 18 32 C 26 18 38 10 50 10 Z"
              fill="currentColor"
            />
            {/* Center Curved Leaf Vein Cutout (Negative Space) */}
            <path
              d="M 22 76 C 36 54 52 38 84 20 C 60 48 46 64 22 76 Z"
              fill={variant === 'light-bg' ? '#ffffff' : '#18181b'}
            />
            {/* Subtle Inner Vein Line */}
            <path
              d="M 32 68 C 44 50 58 38 78 28"
              stroke={variant === 'light-bg' ? '#ffffff' : '#18181b'}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* "PASI" in Dark Slate / White (Italicized bold font matching brand identity) */}
        <span className={`${textSize} font-black tracking-tight ${pasiTextColor} italic font-sans uppercase ml-0.5`}>
          PASI
        </span>
      </div>

      {showSubtitle && (
        <div className="border-l border-zinc-700/60 pl-2 py-0.5">
          <span className={`block ${subtitleSize} uppercase tracking-[0.25em] text-[#d48743] font-bold leading-tight`}>
            Implementos
          </span>
          <span className={`block ${subtitleSize} uppercase tracking-[0.25em] text-zinc-400 font-semibold leading-none`}>
            Agrícolas
          </span>
        </div>
      )}
    </div>
  );
}

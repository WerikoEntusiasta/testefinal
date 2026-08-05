import React, { useState, useEffect } from 'react';

interface AgroPasiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light-bg' | 'dark-bg';
  showSubtitle?: boolean;
  logoUrl?: string;
}

export default function AgroPasiLogo({
  className = '',
  size = 'md',
  variant = 'default',
  showSubtitle = false,
  logoUrl: propLogoUrl
}: AgroPasiLogoProps) {
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(propLogoUrl || '');

  useEffect(() => {
    if (propLogoUrl !== undefined) {
      setCustomLogoUrl(propLogoUrl);
      return;
    }

    const checkStoredLogo = () => {
      try {
        const stored = localStorage.getItem('agropasi_cms_hero');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.logoUrl) {
            setCustomLogoUrl(parsed.logoUrl);
            return;
          }
        }
      } catch (e) {}
      setCustomLogoUrl('');
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
    sm: { textSize: 'text-lg', iconSize: 'w-5 h-5', subtitleSize: 'text-[7px]', imgHeight: 'h-6 sm:h-7' },
    md: { textSize: 'text-2xl', iconSize: 'w-6 h-6', subtitleSize: 'text-[8px]', imgHeight: 'h-8 sm:h-9' },
    lg: { textSize: 'text-3xl', iconSize: 'w-8 h-8', subtitleSize: 'text-[9px]', imgHeight: 'h-10 sm:h-12' },
    xl: { textSize: 'text-4xl', iconSize: 'w-10 h-10', subtitleSize: 'text-[10px]', imgHeight: 'h-12 sm:h-14' },
  };

  const { textSize, iconSize, subtitleSize, imgHeight } = sizeMap[size];

  // If a custom uploaded/configured logo image exists, render it cleanly
  if (customLogoUrl) {
    return (
      <div className={`inline-flex items-center space-x-2 select-none font-sans ${className}`}>
        <img
          src={customLogoUrl}
          alt="Logo AgroPasi"
          className={`${imgHeight} w-auto object-contain max-w-[240px]`}
          onError={() => setCustomLogoUrl('')}
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

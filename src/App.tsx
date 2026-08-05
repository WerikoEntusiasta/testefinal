import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import NavigationGuide from './components/NavigationGuide';
import CompanyAbout from './components/CompanyAbout';
import Products from './components/Products';
import ProductActionGallery from './components/ProductActionGallery';
import FaqAccordion from './components/FaqAccordion';
import CepLocator from './components/CepLocator';
import Footer from './components/Footer';
import AdminPortal from './components/AdminPortal';
import ProductDetailPage from './components/ProductDetailPage';
import AllProductsPage from './components/AllProductsPage';
import BlogPage from './components/BlogPage';
import { api, sanitizeOverrides } from './lib/api';

export default function App() {
  const [route, setRoute] = useState<'site' | 'admin'>(() => {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path.startsWith('/admin') || search.includes('admin')) {
      return 'admin';
    }
    return 'site';
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'all-products' | 'blog'>('home');
  const [siteLogoUrl, setSiteLogoUrl] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.startsWith('/admin') || search.includes('admin')) {
        setRoute('admin');
      } else {
        setRoute('site');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.title = route === 'admin'
      ? "AgroPasi | Portal Gerencial & Admin"
      : "AgroPasi | Implementos Agrícolas e Peças para o Campo — 60 Anos de Indústria";
    
    // Set official AgroPasi leaf favicon dynamically
    try {
      const leafFaviconSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M 135 375 C 90 270 145 160 240 115 C 315 78 375 82 380 90 C 388 175 330 330 250 375 C 190 410 145 395 135 375 Z' fill='%23d48743'/><path d='M 140 370 C 205 270 275 200 342 175 C 265 220 195 295 140 370 Z' fill='%23ffffff'/></svg>`;
      let iconLink: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.type = 'image/svg+xml';
      iconLink.href = leafFaviconSvg;
    } catch (e) {}
  }, [route]);

  useEffect(() => {
    const handleStorageUpdated = () => {
      try {
        const storedHero = localStorage.getItem('agropasi_cms_hero');
        if (storedHero) {
          const parsed = JSON.parse(storedHero);
          if (parsed?.logoUrl) {
            setSiteLogoUrl(parsed.logoUrl);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage_updated', handleStorageUpdated);

    const syncDatabaseData = async () => {
      try {
        const data = await api.getCatalogData();
        if (data) {
          if (data.hero) {
            localStorage.setItem('agropasi_cms_hero', JSON.stringify(data.hero));
            if (data.hero.logoUrl) {
              setSiteLogoUrl(data.hero.logoUrl);
            }
          }
          if (data.about) localStorage.setItem('agropasi_cms_about', JSON.stringify(data.about));
          if (data.faqs) localStorage.setItem('agropasi_cms_faqs', JSON.stringify(data.faqs));
          if (data.blog) localStorage.setItem('agropasi_cms_blog_posts', JSON.stringify(data.blog));
          if (data.gallery) localStorage.setItem('agropasi_cms_gallery', JSON.stringify(data.gallery));
          if (data.representatives) localStorage.setItem('agropasi_cms_reps', JSON.stringify(data.representatives));
          if (data.tractors) localStorage.setItem('agropasi_tractors', JSON.stringify(data.tractors));
          if (data.productOverrides) {
            const sanitized = sanitizeOverrides(data.productOverrides);
            localStorage.setItem('agropasi_main_products_overrides', JSON.stringify(sanitized));
          }
          
          window.dispatchEvent(new Event('storage_updated'));
        }
      } catch (err) {
        console.error('Falha de sincronização do banco SQLite:', err);
      }
    };
    syncDatabaseData();

    return () => {
      window.removeEventListener('storage_updated', handleStorageUpdated);
    };
  }, [route]);

  const handleCloseAdmin = () => {
    setRoute('site');
    if (window.location.pathname.startsWith('/admin') || window.location.search.includes('admin')) {
      window.history.pushState({}, '', '/');
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigate = (hash?: string) => {
    if (hash === '#pecas') {
      setSelectedProductId('pasiparts');
      setView('home');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setSelectedProductId(null);
      if (hash === '#produtos') {
        setView('all-products');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#blog') {
        setView('blog');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#inicio') {
        setView('home');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setView('home');
        if (hash) {
          setTimeout(() => {
            const element = document.querySelector(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 80);
        }
      }
    }
  };

  if (route === 'admin') {
    return (
      <div className="min-h-screen bg-[#1a1e2c] font-sans">
        <AdminPortal onClose={handleCloseAdmin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-150 selection:bg-emerald-600 selection:text-zinc-950">
      
      {/* Universal Sticky Header */}
      <Header 
        onNavigate={handleNavigate} 
        logoUrl={siteLogoUrl}
      />

      {/* Primary Corporate Layout Row / Product Page View */}
      <main className="relative">
        {selectedProductId ? (
          <ProductDetailPage 
            productId={selectedProductId} 
            onClose={() => setSelectedProductId(null)} 
            onSelectProduct={handleSelectProduct}
          />
        ) : view === 'all-products' ? (
          <AllProductsPage 
            onSelectProduct={handleSelectProduct}
            onBackToHome={() => setView('home')}
          />
        ) : view === 'blog' ? (
          <BlogPage 
            onBackToHome={() => setView('home')}
          />
        ) : (
          <>
            <Hero />
            <NavigationGuide />
            <CompanyAbout />
            
            {/* Featured Products showcase */}
            <Products onSelectProduct={handleSelectProduct} />
            
            <CepLocator />

            {/* 1. "a galeria de produtos em ação coloque logo abaixo dos produtos destaque" */}
            <ProductActionGallery />
            
            <FaqAccordion />

            {/* High-quality CTA link to the new standalone Blog Page */}
            <div className="py-20 bg-zinc-950 border-t border-zinc-900 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#d48743]/0 via-[#d48743]/2 to-transparent pointer-events-none" />
              <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4">
                <span className="inline-block px-3 py-1 bg-[#d48743]/10 border border-[#d48743]/20 text-[#d48743] text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
                  Informativos & Dicas de Campo
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-zinc-150 font-sans tracking-tight">
                  Quer maximizar a lucratividade da sua colheita?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Confira orientações técnicas sobre regulagens de ventilação, manutenção preventiva pós-safra e engenharia mecânica elaboradas por nossos consultores.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleNavigate('#blog')}
                    className="inline-flex items-center bg-[#d48743] hover:bg-[#c27a41] text-white px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#d48743]/10 cursor-pointer"
                  >
                    Acessar o Blog Completo AgroPasi
                    <span className="ml-2 font-mono">→</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Complete Footer Section */}
      <Footer logoUrl={siteLogoUrl} />
      
    </div>
  );
}

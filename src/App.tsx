import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import NavigationGuide from './components/NavigationGuide';
import CompanyAbout from './components/CompanyAbout';
import Products from './components/Products';
import ProductActionGallery from './components/ProductActionGallery';
import SavingsCalculator from './components/SavingsCalculator';
import CepLocator from './components/CepLocator';
import FaqAccordion from './components/FaqAccordion';
import RuralBlog from './components/RuralBlog';
import Footer from './components/Footer';
import AdminPortal from './components/AdminPortal';
import ProductDetailPage from './components/ProductDetailPage';
import AllProductsPage from './components/AllProductsPage';
import BlogPage from './components/BlogPage';
import CookieConsent from './components/CookieConsent';
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
    } else if (hash === '#blog') {
      setSelectedProductId(null);
      setView('blog');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (hash === '#produtos') {
      if (view === 'home' && !selectedProductId) {
        const el = document.getElementById('produtos');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      setSelectedProductId(null);
      setView('home');
      requestAnimationFrame(() => {
        const el = document.getElementById('produtos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    } else if (hash === '#inicio') {
      if (view === 'home' && !selectedProductId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setSelectedProductId(null);
      setView('home');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (hash === '#contato') {
      if (view === 'home' && !selectedProductId) {
        const el = document.getElementById('contato');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      setSelectedProductId(null);
      setView('home');
      requestAnimationFrame(() => {
        const el = document.getElementById('contato');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      setSelectedProductId(null);
      setView('home');
      if (hash) {
        const targetId = hash.replace('#', '');
        requestAnimationFrame(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        });
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

      {/* Primary Layout Row / Product Page View */}
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
            {/* 1. HERO */}
            <Hero 
              onSelectProduct={handleSelectProduct}
              onNavigate={handleNavigate}
            />

            {/* 2. CATÁLOGO DE PRODUTOS (Destaques do Catálogo) */}
            <Products 
              onSelectProduct={handleSelectProduct} 
              onViewAllProducts={() => {
                setSelectedProductId(null);
                setView('all-products');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            />

            {/* 3. INSTITUCIONAL (Nossas Raízes e Valores) */}
            <CompanyAbout />

            {/* 4. CONTATO & LOCALIZADOR DE REPRESENTANTES (Fluxo Único) */}
            <CepLocator />

            {/* 5. BLOG DO CAFEZAL */}
            <RuralBlog />
          </>
        )}
      </main>

      {/* Complete Footer Section */}
      <Footer logoUrl={siteLogoUrl} />
      
      {/* LGPD Cookie Consent Banner (com fadeout de 30s) */}
      <CookieConsent />
    </div>
  );
}

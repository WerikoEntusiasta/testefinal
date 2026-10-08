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

function parseUrlState() {
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);

  let newRoute: 'site' | 'admin' = 'site';
  if (path.startsWith('/admin') || search.includes('admin')) {
    newRoute = 'admin';
  }

  let newProduct: string | null = null;
  if (path === '/varrefort-s' || path.startsWith('/produto/varrefort-s') || params.get('produto') === 'varrefort-s' || hash === '#varrefort-s') {
    newProduct = 'varrefort-s';
  } else if (path === '/varremax-x' || path.startsWith('/produto/varremax-x') || params.get('produto') === 'varremax-x' || hash === '#varremax-x') {
    newProduct = 'varremax-x';
  } else if (path === '/pecas' || path.startsWith('/produto/pasiparts') || params.get('produto') === 'pasiparts' || hash === '#pecas') {
    newProduct = 'pasiparts';
  } else if (params.get('produto')) {
    newProduct = params.get('produto');
  }

  let newView: 'home' | 'all-products' | 'blog' = 'home';
  if (newProduct) {
    newView = 'home';
  } else if (path === '/blog' || params.get('view') === 'blog' || hash === '#blog') {
    newView = 'blog';
  } else if (path === '/produtos' || path === '/catalogo' || params.get('view') === 'all-products' || hash === '#produtos' || hash === '#catalogo') {
    newView = 'all-products';
  }

  return { newRoute, newProduct, newView };
}

export default function App() {
  const initialState = parseUrlState();
  const [route, setRoute] = useState<'site' | 'admin'>(initialState.newRoute);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialState.newProduct);
  const [view, setView] = useState<'home' | 'all-products' | 'blog'>(initialState.newView);
  const [siteLogoUrl, setSiteLogoUrl] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      const current = parseUrlState();
      setRoute(current.newRoute);
      setSelectedProductId(current.newProduct);
      setView(current.newView);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let title = "AgroPasi | Implementos Agrícolas e Peças para o Campo — 60 Anos de Indústria";
    let desc = "AgroPasi - Tecnologia, durabilidade e proximidade com o campo. Conheça o Arruador Soprador VarreFort-S com até 20% de economia de diesel, peças de reposição e implementos agrícolas.";

    if (route === 'admin') {
      title = "AgroPasi | Portal Gerencial & Admin";
      desc = "Painel administrativo de controle de catálogo, representantes e configurações da AgroPasi.";
    } else if (selectedProductId === 'varrefort-s') {
      title = "VarreFort-S | Arruador e Soprador de Café (Sob Consulta) — AgroPasi";
      desc = "Conheça o Arruador Soprador VarreFort-S da AgroPasi. Arruação de alta eficiência em baixa rotação (1200-1500 RPM), economia de até 20% de diesel e fabricação nacional.";
    } else if (selectedProductId === 'varremax-x') {
      title = "Recolhedora de Café AgroPasi | Pré-Lançamento em Testes de Campo";
      desc = "Recolhedora mecânica de café AgroPasi. Alta capacidade de recolhimento, pureza de grãos e robustez industrial para a cafeicultura brasileira.";
    } else if (selectedProductId === 'pasiparts') {
      title = "PasiParts | Peças de Reposição e Projetos Sob Medida — AgroPasi";
      desc = "Peças originais de fábrica para implementos agrícolas. Fabricação 100% própria, pronta entrega e desenvolvimento sob medida para cafeicultura.";
    } else if (view === 'all-products') {
      title = "Catálogo Completo de Implementos e Peças para Café — AgroPasi";
      desc = "Confira o portfólio completo de implementos agrícolas para cafeicultura da AgroPasi. Máquinas robustas, menor consumo de diesel e suporte de fábrica.";
    } else if (view === 'blog') {
      title = "Blog do Cafezal | Dicas Técnicas, Manejo e Eficiência na Colheita — AgroPasi";
      desc = "Artigos práticos e técnicos para produtores de café: regulagem de arruador, manutenção preventiva, economia de combustível e maximização da safra.";
    }

    document.title = title;

    try {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', desc);
    } catch (e) {}
    
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
  }, [route, view, selectedProductId]);

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
    setView('home');
    try {
      const cleanPath = id === 'pasiparts' ? '/pecas' : `/${id}`;
      window.history.pushState({}, '', cleanPath);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCloseProduct = () => {
    setSelectedProductId(null);
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {}
  };

  const handleBackToHome = () => {
    setSelectedProductId(null);
    setView('home');
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (dest?: string) => {
    if (!dest) return;
    if (dest === '/pecas' || dest === '#pecas') {
      setSelectedProductId('pasiparts');
      setView('home');
      try {
        window.history.pushState({}, '', '/pecas');
      } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (dest === '/blog' || dest === '#blog') {
      setSelectedProductId(null);
      setView('blog');
      try {
        window.history.pushState({}, '', '/blog');
      } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (dest === '/produtos' || dest === '#produtos' || dest === '#catalogo') {
      setSelectedProductId(null);
      setView('all-products');
      try {
        window.history.pushState({}, '', '/produtos');
      } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (dest === '/' || dest === '#inicio') {
      handleBackToHome();
    } else if (dest === '#contato') {
      if (view !== 'home' || selectedProductId) {
        setSelectedProductId(null);
        setView('home');
        try {
          window.history.pushState({}, '', '/#contato');
        } catch (e) {}
        setTimeout(() => {
          const el = document.getElementById('contato');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        const el = document.getElementById('contato');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (dest === '#sobre') {
      if (view !== 'home' || selectedProductId) {
        setSelectedProductId(null);
        setView('home');
        try {
          window.history.pushState({}, '', '/#sobre');
        } catch (e) {}
        setTimeout(() => {
          const el = document.getElementById('sobre');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        const el = document.getElementById('sobre');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setSelectedProductId(null);
      setView('home');
      const targetId = dest.replace('#', '').replace('/', '');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
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
            onClose={handleCloseProduct} 
            onSelectProduct={handleSelectProduct}
          />
        ) : view === 'all-products' ? (
          <AllProductsPage 
            onSelectProduct={handleSelectProduct}
            onBackToHome={handleBackToHome}
          />
        ) : view === 'blog' ? (
          <BlogPage 
            onBackToHome={handleBackToHome}
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
      <Footer 
        logoUrl={siteLogoUrl} 
        onNavigate={handleNavigate}
        onSelectProduct={handleSelectProduct}
      />
      
      {/* LGPD Cookie Consent Banner (com fadeout de 30s) */}
      <CookieConsent />
    </div>
  );
}

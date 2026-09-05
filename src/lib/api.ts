// Secure Client-Side API Connector for AgroPasi Catalog

// Retrieve CSRF token dynamically from cookies (Double Submit Token)
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// Perform safe fetch with automatic security headers
async function apiRequest<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Inject CSRF token if mutating state (Item 4: CSRF Protection on all major actions)
  if (method !== 'GET') {
    const csrf = getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

export interface CatalogData {
  hero: {
    id: string;
    badge: string;
    title: string;
    description: string;
    photoUrl: string;
    logoUrl?: string;
  };
  about: {
    id: string;
    grandpaPhoto: string;
    grandpaTitle: string;
    grandpaText: string;
    grandpaQuote: string;
    industrialPhoto: string;
    industrialTitle: string;
    industrialText: string;
    sectionBadge: string;
    sectionTitle: string;
    sectionDesc1: string;
    sectionDesc2: string;
  };
  faqs: Array<{
    id: string;
    category: string;
    question: string;
    answer: string;
  }>;
  blog: Array<{
    id: string;
    title: string;
    category: string;
    excerpt: string;
    content: string;
    date: string;
    readTime: string;
    imageUrl: string;
  }>;
  gallery: Array<{
    id: string;
    title: string;
    category: 'video' | 'photo' | 'factory';
    categoryLabel: string;
    mediaUrl: string;
    description: string;
    location?: string;
    duration?: string;
    videoUrl?: string;
  }>;
  representatives: Array<{
    id: string;
    name: string;
    region: string;
    phone: string;
    email: string;
    coverCeps: string[];
    avatarUrl: string;
  }>;
  tractors: Array<{
    id: string;
    brand: string;
    model: string;
    hpRequired: string;
    compatibility: 'Compatível' | 'Recomenda-se Redutor' | 'Consultar Engenharia';
    ptoRpm: string;
    hitchType?: string;
  }>;
  productOverrides: Record<string, {
    title: string;
    description: string;
    imageUrl: string;
    badge: string;
    tag: string;
    competitorLiters: number;
    ourLiters: number;
  }>;
}

export interface SecurityLog {
  id: string;
  user_email: string | null;
  role: string | null;
  action: string;
  ip: string;
  user_agent: string;
  before_state: string | null;
  after_state: string | null;
  timestamp: string;
}

export const api = {
  // Public Data
  getCatalogData: () => apiRequest<CatalogData>('/api/public/data', 'GET'),
  
  submitLead: (leadData: {
    name: string;
    phone: string;
    email: string;
    cep: string;
    tractorModel: string;
    message: string;
    representativeId: string;
    representativeName: string;
    consentGiven: boolean;
  }) => apiRequest<{ success: boolean; leadId: string }>('/api/public/lead', 'POST', leadData),

  // LGPD Helpers (Item 19)
  exportMyData: (phone: string) => apiRequest<{ leads: any[] }>('/api/public/my-data', 'POST', { phone }),
  deleteMyData: (phone: string) => apiRequest<{ success: boolean; deletedCount: number }>('/api/public/delete-my-data', 'POST', { phone }),

  // Admin Authentication (Item 1)
  login: (credentials: { email: string; password: string }) => 
    apiRequest<{ success: boolean; user: { email: string; role: string } }>('/api/admin/login', 'POST', credentials),
  
  logout: () => apiRequest<{ success: boolean }>('/api/admin/logout', 'POST'),
  
  checkMe: () => apiRequest<{ user: { email: string; role: string } | null }>('/api/admin/me', 'GET'),

  // Leads Admin Actions
  getLeads: () => apiRequest<{ leads: any[] }>('/api/admin/leads', 'GET'),
  updateLeadStatus: (id: string, status: 'Pendente' | 'Atendido' | 'Arquivado') => 
    apiRequest<{ success: boolean }>(`/api/admin/leads/${id}`, 'PUT', { status }),
  deleteLead: (id: string) => apiRequest<{ success: boolean }>(`/api/admin/leads/${id}`, 'DELETE'),

  // Tractors Admin Actions (Item 1: Exclusive to Dono)
  addTractor: (tractor: {
    brand: string;
    model: string;
    hpRequired: string;
    compatibility: 'Compatível' | 'Recomenda-se Redutor' | 'Consultar Engenharia';
    ptoRpm: string;
    hitchType?: string;
  }) => apiRequest<{ success: boolean; tractor: any }>('/api/admin/tractors', 'POST', tractor),
  
  deleteTractor: (id: string) => apiRequest<{ success: boolean }>(`/api/admin/tractors/${id}`, 'DELETE'),

  // CMS Content Save (Item 1)
  saveHero: (hero: {
    badge: string;
    title: string;
    description: string;
    photoUrl: string;
    logoUrl?: string;
  }) => apiRequest<{ success: boolean; hero: any }>('/api/admin/cms/hero', 'POST', hero),

  saveLogo: (logoUrl: string) =>
    apiRequest<{ success: boolean; hero: any; logoUrl: string }>('/api/admin/cms/logo', 'POST', { logoUrl }),

  saveAbout: (about: {
    grandpaPhoto: string;
    grandpaTitle: string;
    grandpaText: string;
    grandpaQuote: string;
    industrialPhoto: string;
    industrialTitle: string;
    industrialText: string;
    sectionBadge: string;
    sectionTitle: string;
    sectionDesc1: string;
    sectionDesc2: string;
  }) => apiRequest<{ success: boolean; about: any }>('/api/admin/cms/about', 'POST', about),

  // FAQs CRUD
  addFaq: (faq: { category: string; question: string; answer: string }) => 
    apiRequest<{ success: boolean; faq: any }>('/api/admin/faqs', 'POST', faq),
  deleteFaq: (id: string) => apiRequest<{ success: boolean }>(`/api/admin/faqs/${id}`, 'DELETE'),

  // BLOG CRUD
  addBlogPost: (post: {
    title: string;
    category: string;
    excerpt: string;
    content: string;
    readTime: string;
    imageUrl: string;
  }) => apiRequest<{ success: boolean; post: any }>('/api/admin/blog', 'POST', post),
  deleteBlogPost: (id: string) => apiRequest<{ success: boolean }>(`/api/admin/blog/${id}`, 'DELETE'),

  // GALLERY CRUD
  addGalleryItem: (item: {
    title: string;
    category: 'video' | 'photo' | 'factory';
    categoryLabel: string;
    mediaUrl: string;
    description: string;
    location?: string;
    duration?: string;
    videoUrl?: string;
  }) => apiRequest<{ success: boolean; item: any }>('/api/admin/gallery', 'POST', item),
  deleteGalleryItem: (id: string) => apiRequest<{ success: boolean }>(`/api/admin/gallery/${id}`, 'DELETE'),
  updateGalleryItem: (id: string, item: {
    title: string;
    category: 'video' | 'photo' | 'factory';
    categoryLabel: string;
    mediaUrl: string;
    description: string;
    location?: string;
    duration?: string;
    videoUrl?: string;
  }) => apiRequest<{ success: boolean; item: any }>(`/api/admin/gallery/${id}`, 'PUT', item),

  // REPS CRUD
  addRepresentative: (rep: {
    name: string;
    region: string;
    phone: string;
    email: string;
    coverCeps: string[];
    avatarUrl: string;
  }) => apiRequest<{ success: boolean; representative: any }>('/api/admin/reps', 'POST', rep),
  updateRepresentative: (id: string, rep: {
    name: string;
    region: string;
    phone: string;
    email: string;
    coverCeps: string[];
    avatarUrl: string;
  }) => apiRequest<{ success: boolean; representative: any }>(`/api/admin/reps/${id}`, 'PUT', rep),
  deleteRepresentative: (id: string) => apiRequest<{ success: boolean }>(`/api/admin/reps/${id}`, 'DELETE'),

  // PRODUCT SPEC OVERRIDES
  saveProductOverride: (override: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    badge: string;
    tag: string;
    competitorLiters: number;
    ourLiters: number;
    specsJson?: string;
    benefitsJson?: string;
  }) => apiRequest<{ success: boolean; override: any }>('/api/admin/product-overrides', 'POST', override),

  deleteProductOverride: (id: string) => apiRequest<{ success: boolean }>(`/api/admin/product-overrides/${id}`, 'DELETE'),

  // File Uploader (Renaming & Securing uploads - Item 5)
  uploadImage: async (file: File): Promise<{ success: boolean; url: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const payload = {
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data
          };
          const response = await apiRequest<{ success: boolean; url: string }>('/api/admin/upload', 'POST', payload);
          resolve(response);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
    });
  },

  // SECURITY LOGS & AUDIT (Item 10 and 11: Exclusive to Dono)
  getSecurityLogs: () => apiRequest<{ logs: SecurityLog[] }>('/api/admin/logs', 'GET')
};

export function sanitizeOverrides(overrides: Record<string, any>): Record<string, any> {
  if (!overrides) return {};
  const copy = JSON.parse(JSON.stringify(overrides));
  if (copy['varrefort-s']) {
    const v = copy['varrefort-s'];
    if (v.name) {
      v.name = v.name.replace(/Varrefort/g, 'VarreFort');
    }
    if (v.title) {
      v.title = v.title.replace(/Varrefort/g, 'VarreFort');
    }
    if (v.description) {
      const lowerDesc = v.description.toLowerCase();
      if (
        lowerDesc.includes('alta performance') ||
        lowerDesc.includes('operar a baixo giro') ||
        lowerDesc.includes('arruador soprador de alta performance')
      ) {
        v.description = 'O arruador soprador projetado para trabalhar em baixa rotação — 1.300 a 1.500 RPM — garantindo ventilação máxima, reduzindo bastante as perdas na varrição e economizando combustível a cada hora de trabalho.';
      }
    }
    if (v.specsJson) {
      try {
        let specsObj = JSON.parse(v.specsJson);
        let str = JSON.stringify(specsObj);
        if (str.toLowerCase().includes('turbinar') || str.toLowerCase().includes('equilibrada')) {
          str = str.replace(/hélice turbinar equilibrada/gi, 'Turbina Balanceada');
          str = str.replace(/turbinar equilibrada/gi, 'Turbina Balanceada');
          v.specsJson = str;
        }
      } catch (e) {}
    }
  }
  return copy;
}

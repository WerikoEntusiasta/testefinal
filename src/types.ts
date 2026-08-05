export interface ColumnLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  cep: string;
  city: string;
  state: string;
  tractorModel?: string;
  message: string;
  representativeId?: string;
  representativeName?: string;
  date: string;
  status: 'Pendente' | 'Atendido' | 'Arquivado';
}

export interface Representative {
  id: string;
  name: string;
  region: string;
  phone: string;
  email: string;
  coverCeps: string[]; // Prefix matches (e.g. "17" for Catanduva/SP area, "37" for Sul de Minas)
  avatarUrl: string;
}

export interface TractorCompatibility {
  id: string;
  brand: string;
  model: string;
  hpRequired: string;
  compatibility: 'Compatível' | 'Recomenda-se Redutor' | 'Consultar Engenharia';
  ptoRpm: string;
  hitchType?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  imageUrl: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

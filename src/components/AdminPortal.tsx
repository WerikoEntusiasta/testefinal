import React, { useState, useEffect } from 'react';
import { ColumnLead, TractorCompatibility } from '../types';
import { 
  Users, CheckCircle2, Archive, Trash2, MapPin, Settings, Plus, RefreshCw, 
  Layers, ShieldCheck, Lock, Check, Layout, Sparkles, FileText, Image, Trash, X,
  Upload, Edit3, RotateCcw, Eye, ShieldAlert
} from 'lucide-react';
import { CustomProduct } from './Products';
import { api, SecurityLog, sanitizeOverrides } from '../lib/api';
import AgroPasiLogo from './AgroPasiLogo';

const safeParseJson = (str: string) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      const decoded = str
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      return JSON.parse(decoded);
    } catch (innerError) {
      throw e;
    }
  }
};

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'vendas' | 'dono'>('vendas');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Dashboard states
  const [currentRole, setCurrentRole] = useState<'vendas' | 'dono' | null>(null);
  const [leads, setLeads] = useState<ColumnLead[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [tractors, setTractors] = useState<TractorCompatibility[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'cms' | 'products' | 'logs'>('leads');
  const [leadsFilter, setLeadsFilter] = useState<'all' | 'Pendente' | 'Atendido' | 'Arquivado'>('all');

  // Success Notification state
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // --- CMS Content Fallback Databases ---
  const DEFAULT_FAQS = [
    {
      id: 'faq_1',
      category: 'RPM & Operação',
      question: 'Qual a rotação (RPM) ideal recomendada para trabalhar com o Arruador de Café?',
      answer: 'O Arruador AgroPasi foi projetado hidraulicamente e mecanicamente para trabalhar a baixas rotações de motor. Diferente de concorrentes que precisam de 1.900 a 2.100 RPM, nosso implemento atinge o ponto ideal de varrição operando entre 1.300 e 1.500 RPM do motor térmico (540 RPM na Tomada de Força/TDP). Isso significa até 20% de economia direta de óleo diesel por hora trabalhada, menor ruído de operação e menor desgaste químico-mecânico.'
    },
    {
      id: 'faq_2',
      category: 'Acoplamento',
      question: 'Como é feito o acoplamento no trator? É universal?',
      answer: 'Sim, o acoplamento é feito via engate de três pontos traseiro padrão (Categoria II). Ele possui pinos universais reforçados de aço usinado com tratamento térmico em nossa metalúrgica. Também acompanha eixo cardan de transmissão de torque balanceado dinamicamente para neutralizar vibrações transmitidas ao radiador e chassi do trator.'
    },
    {
      id: 'faq_3',
      category: 'Manutenção',
      question: 'De quanto em quanto tempo devo fazer a lubrificação das engrenagens?',
      answer: 'Recomenda-se engraxar os bicos de lubrificação (graxeiras) a cada 12 horas de trabalho contínuo (ou diariamente durante a safra). Nosso projeto possui buchas autolubrificantes em bronze sintetizado em pontos-chave e rolamentos blindados de primeira linha, o que estende a robustez operacional geral e evita entupimentos por poeira ou palha de café.'
    },
    {
      id: 'faq_4',
      category: 'Lavoura e Relevo',
      question: 'O Arruador funciona bem em cafezais de montanha ou declives acentuados?',
      answer: 'Sim! Nosso chassis metalúrgico leve foi aliviado com recortes laser adequados para manter a estabilidade lateral do trator, eliminando o risco de empuxo perigoso. O arruador possui sapatas reguláveis que deslizam suavemente contornando as irregularidades, terraços e declives comuns nas regiões cafeeiras do Sul de Minas e Caparaó.'
    },
    {
      id: 'faq_5',
      category: 'Garantia',
      question: 'Qual o prazo de garantia e procedência do equipamento?',
      answer: 'Todos os implementos AgroPasi possuem garantia contratual de 1 ano contra qualquer falha estrutural ou vício operacional de fabricação metalúrgica. As peças têm procedência assegurada pela nossa fábrica própria de mais de 20 anos em fabricações severas de aço em Catanduva/SP.'
    }
  ];

  const DEFAULT_POSTS = [
    {
      id: 'p_1',
      title: 'Como regular o arruador de café para evitar perdas no chão',
      category: 'Regulagem de Máquinas',
      excerpt: 'Ajustar a altura das cerdas dianteiras e regular a pressão hidráulica das sapatas deslizes previne danos mecânicos na lavoura e garante 100% de recolhimento de grãos.',
      content: 'A regulagem perfeita inicia verificando o paralelismo do implemento agrícola em relação ao solo da fileira. O operador deve ajustar o comprimento do terceiro ponto de forma que o arruador trabalhe perfeitamente plano. Se inclinado para a frente, as cerdas cavarão terra úmida desnecessariamente, desgastando peças por atrito e gerando "torrões" na colheita. Se inclinado para trás, haverá "perda", deixando grãos de café de vagem caídos sob as folhas secas.',
      date: '02 Jun 2026',
      readTime: '4 min leitura',
      imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'p_2',
      title: 'Manutenção preventiva pós-colheita: lubrificando metais sob alta tensão',
      category: 'Manutenção de Implementos',
      excerpt: 'Evite prejuízos na safra seguinte. Saiba como realizar o check-up dos rolamentos, engrenagens helicoidais e aplicação de graxa anticorrosiva pós colheitas.',
      content: 'O acúmulo de palha úmida, poeira de terra vermelha e resíduos ácidos da polpa de café verde agride as ligas ferrosas. Ao final de cada ciclo de colheita, é indispensável efetuar uma lavagem sob pressão média com desengraxante biodegradável neutro. Em seguida, as articulações mecânicas e o eixo transmissor cardan principal devem ser completamente lubrificados por injeção até que a graxa antiga de cor escura seja expulsa, protegendo o lote contra umidade e corrosão invernal.',
      date: '28 Mai 2026',
      readTime: '6 min leitura',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'p_3',
      title: 'Por que o menor RPM de operação economiza diesel no trator?',
      category: 'Cafeicultura Moderna',
      excerpt: 'Descubra a física mecânica por trás das engrenagens multiplicadoras de torque da AgroPasi e como elas poupam combustível com rotação de motor suave.',
      content: 'Muitos produtores rurais de café acreditam que para obter ventilação e enleiramento fortes na terra, o motor do trator precisa estar operando próximo ao limite do sobregiro (1.900 a 2.100 RPM). No entanto, o motor consome diesel exponencialmente para manter essa rotação elevada em vazio. Através de um jogo de engrenagens de eixos multiplicadores projetadas em nossa fábrica, o rotor ventilador interno gira em altíssima velocidade mesmo com o motor operando na confortável faixa de economia de 1.350 RPM. A economia gerada se traduz direto no lucro líquido por saca.',
      date: '15 Mai 2026',
      readTime: '5 min leitura',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const DEFAULT_REPRESENTATIVES = [
    {
      id: 'rep_hq',
      name: 'José (Escritório Central / Vendas SP)',
      region: 'Todo o Brasil / Catanduva-SP',
      phone: '17991066796',
      email: 'jose.vendas@agropasi.com.br',
      coverCeps: [],
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

  const DEFAULT_GALLERY_ITEMS = [
    {
      id: 'act_vid_1',
      title: 'Arruador de Café AgroPasi Operando em Declive',
      category: 'video',
      categoryLabel: 'Vídeo Operacional',
      mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
      description: 'Veja o varredor limpando as linhas sob os cafeeiros no espalhado, organizando grãos e operando a 1.400 RPM com trator comum.',
      location: 'Alta Mogiana - Franca/SP',
      duration: '01:45'
    },
    {
      id: 'act_vid_2',
      title: 'Drone: Enleiramento Rápido de Grãos',
      category: 'video',
      categoryLabel: 'Vídeo Aéreo',
      mediaUrl: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=600',
      description: 'Imagens aéreas mostrando o alinhamento central uniforme obtido em uma lavoura de café adensada de 4 anos.',
      location: 'Sul de Minas - Varginha/MG',
      duration: '00:58'
    },
    {
      id: 'act_pic_1',
      title: 'Acréscimo de Linha: Zero Perda na Varrição',
      category: 'photo',
      categoryLabel: 'Fotografia de Campo',
      mediaUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
      description: 'Grãos perfeitamente varridos e acumulados longe das saias das árvores, desobstruindo a passagem dos colhedores manuais.',
      location: 'Cerrado Mineiro - Patrocínio/MG'
    },
    {
      id: 'act_fac_1',
      title: 'Corte Laser de Chapa de Aço ASTM-36',
      category: 'factory',
      categoryLabel: 'Estrutura Industrial',
      mediaUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=605',
      description: 'Chassis estruturais do arruador recortados com precisão micrométrica sobre tecnologia laser de fibra ótica de alta potência.',
      location: 'Metalúrgica AgroPasi - Catanduva/SP'
    },
    {
      id: 'act_fac_2',
      title: 'Acabamento e Engenharia Mecânica de Precisão',
      category: 'factory',
      categoryLabel: 'Estrutura Industrial',
      mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
      description: 'Nossa equipe de engenharia revisando as engrenagens de transmissão tratadas contra corrosão e desgaste mecânico severo.',
      location: 'Central Fabril - Catanduva/SP'
    },
    {
      id: 'act_pic_2',
      title: 'Acoplamento no Terceiro Ponto Traseiro',
      category: 'photo',
      categoryLabel: 'Fotografia de Campo',
      mediaUrl: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&q=80&w=600',
      description: 'Detalhe do engate robusto universal que facilita o trabalho de manobra em passagens estreitas de cafezal.',
      location: 'Norte Pioneiro - Paraná'
    }
  ];

  // --- CMS Editor States (For Dono Role only) ---
  const [siteLogoUrl, setSiteLogoUrl] = useState('');
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [heroBadge, setHeroBadge] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDesc, setHeroDesc] = useState('');
  const [heroPhoto, setHeroPhoto] = useState('');

  const [aboutPhoto, setAboutPhoto] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDesc, setAboutDesc] = useState('');
  const [aboutQuote, setAboutQuote] = useState('');

  // Industrial section states
  const [aboutIndustrialPhoto, setAboutIndustrialPhoto] = useState('');
  const [aboutIndustrialTitle, setAboutIndustrialTitle] = useState('');
  const [aboutIndustrialText, setAboutIndustrialText] = useState('');
  const [aboutSectionBadge, setAboutSectionBadge] = useState('');
  const [aboutSectionTitle, setAboutSectionTitle] = useState('');
  const [aboutSectionDesc1, setAboutSectionDesc1] = useState('');
  const [aboutSectionDesc2, setAboutSectionDesc2] = useState('');

  // --- CMS Sub-Tab State ---
  const [cmsSubTab, setCmsSubTab] = useState<'geral' | 'gallery' | 'faq' | 'blog' | 'reps'>('geral');

  // --- Dynamic FAQs, Blog, Gallery and Reps states ---
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [blogList, setBlogList] = useState<any[]>([]);
  const [galleryList, setGalleryList] = useState<any[]>([]);
  const [repsList, setRepsList] = useState<any[]>([]);

  // FAQ Form State
  const [newFaqCategory, setNewFaqCategory] = useState('');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Blog Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostExcerpt, setNewPostExcerpt] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostReadTime, setNewPostReadTime] = useState('5 min leitura');

  // Gallery Form State
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState<'video' | 'photo' | 'factory'>('photo');
  const [newGalCategoryLabel, setNewGalCategoryLabel] = useState('Fotografia de Campo');
  const [newGalMediaUrl, setNewGalMediaUrl] = useState('');
  const [newGalDescription, setNewGalDescription] = useState('');
  const [newGalLocation, setNewGalLocation] = useState('');
  const [newGalDuration, setNewGalDuration] = useState('');
  const [newGalVideoUrl, setNewGalVideoUrl] = useState('');
  const [editingGalId, setEditingGalId] = useState<string | null>(null);

  // Reps Form State
  const [editingRepId, setEditingRepId] = useState<string | null>(null);
  const [newRepName, setNewRepName] = useState('');
  const [newRepRegion, setNewRepRegion] = useState('');
  const [newRepPhone, setNewRepPhone] = useState('');
  const [newRepEmail, setNewRepEmail] = useState('');
  const [newRepCeps, setNewRepCeps] = useState('');
  const [newRepAvatar, setNewRepAvatar] = useState('');

  // --- Dynamic New Product States (For Dono Role only) ---
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState(''); // Comma-separated: "TDP 540, Chapa 6mm"

  // --- Main Highlight Products Overrides (varrefort-s, varremax-x, pasiparts) ---
  const [mainOverrides, setMainOverrides] = useState<Record<string, any>>({});
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [editMainTitle, setEditMainTitle] = useState('');
  const [editMainDesc, setEditMainDesc] = useState('');
  const [editMainImg, setEditMainImg] = useState('');
  const [editMainBadge, setEditMainBadge] = useState('');
  const [editMainTag, setEditMainTag] = useState('');
  const [editMainCompetitorLiters, setEditMainCompetitorLiters] = useState<number>(5.0);
  const [editMainOurLiters, setEditMainOurLiters] = useState<number>(3.5);

  // --- Extra Specs and Benefits for Product Overrides ---
  const [editSpecsLarguraAberto, setEditSpecsLarguraAberto] = useState('');
  const [editSpecsLarguraFechado, setEditSpecsLarguraFechado] = useState('');
  const [editSpecsComprimento, setEditSpecsComprimento] = useState('');
  const [editSpecsAlturaTotal, setEditSpecsAlturaTotal] = useState('');
  const [editSpecsPesoLiquido, setEditSpecsPesoLiquido] = useState('');
  const [editSpecsPotenciaMinima, setEditSpecsPotenciaMinima] = useState('');
  const [editSpecsVazaoHidraulica, setEditSpecsVazaoHidraulica] = useState('');
  const [editSpecsRotacaoTdp, setEditSpecsRotacaoTdp] = useState('');
  const [editSpecsAcoplamento, setEditSpecsAcoplamento] = useState('');
  // Varremax specific
  const [editSpecsCapacidadeCarga, setEditSpecsCapacidadeCarga] = useState('');
  const [editSpecsRendimentoEstimado, setEditSpecsRendimentoEstimado] = useState('');
  const [editSpecsSistemaSeparador, setEditSpecsSistemaSeparador] = useState('');

  // Benefits
  const [editBenefit1Title, setEditBenefit1Title] = useState('');
  const [editBenefit1Desc, setEditBenefit1Desc] = useState('');
  const [editBenefit2Title, setEditBenefit2Title] = useState('');
  const [editBenefit2Desc, setEditBenefit2Desc] = useState('');
  const [editBenefit3Title, setEditBenefit3Title] = useState('');
  const [editBenefit3Desc, setEditBenefit3Desc] = useState('');
  const [editBenefit4Title, setEditBenefit4Title] = useState('');
  const [editBenefit4Desc, setEditBenefit4Desc] = useState('');

  // --- Compatibility Table Form States ---
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newHp, setNewHp] = useState('');
  const [newCompatibility, setNewCompatibility] = useState<'Compatível' | 'Recomenda-se Redutor' | 'Consultar Engenharia'>('Compatível');
  const [newPto, setNewPto] = useState('');
  const [newHitch, setNewHitch] = useState('');

  // Loaded Tractor Count
  const [tractorsCount, setTractorsCount] = useState(0);

  // Load Leads, Tractors, and CMS on mount
  useEffect(() => {
    checkAuthSession();
    loadCatalogData();
  }, []);

  const checkAuthSession = async () => {
    try {
      const res = await api.checkMe();
      if (res && res.user) {
        setCurrentRole(res.user.role as any);
        setIsAuthenticated(true);
        const leadsRes = await api.getLeads();
        setLeads(leadsRes.leads);
        if (res.user.role === 'dono') {
          loadSecurityLogs();
        }
      }
    } catch (err) {
      // Quietly ignore since no session is present on first load
    }
  };

  const loadSecurityLogs = async () => {
    try {
      const res = await api.getSecurityLogs();
      setSecurityLogs(res.logs);
    } catch (err) {
      console.error('Erro ao buscar logs de segurança:', err);
    }
  };

  const loadCatalogData = async () => {
    try {
      const data = await api.getCatalogData();
      if (data) {
        // Set tractors
        setTractors(data.tractors || []);
        setTractorsCount((data.tractors || []).length);

        // Set Hero & Logo
        setSiteLogoUrl(data.hero?.logoUrl || '');
        setHeroBadge(data.hero?.badge || 'Grupo Industrial com mais de 20 anos de experiência');
        setHeroTitle(data.hero?.title || 'Alta Performance \n Nascida da Metalurgia Estável');
        setHeroDesc(data.hero?.description || 'Não somos estreantes. A AgroPasi traz para o campo a bagagem técnica, operacional e estrutural de quem fabrica metais há mais de duas décadas.');
        setHeroPhoto(data.hero?.photoUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1600');

        // Set About
        setAboutPhoto(data.about?.grandpaPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300');
        setAboutTitle(data.about?.grandpaTitle || 'O Rosto do Avô Pasiani: Legado, Autoridade e Confiança');
        setAboutDesc(data.about?.grandpaText || 'Este projeto de identidade visual busca resgatar a autoridade e a credibilidade estabelecidas pela família Pasiani, transformando o sobrenome em um selo de qualidade inquestionável.');
        setAboutQuote(data.about?.grandpaQuote || '"Esta empresa tem história, tem raízes e honra o compromisso de seus fundadores com o homem do campo."');
        
        setAboutIndustrialPhoto(data.about?.industrialPhoto || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800');
        setAboutIndustrialTitle(data.about?.industrialTitle || 'Estrutura Industrial Própria');
        setAboutIndustrialText(data.about?.industrialText || 'Tecnologia avançada que assegura peças prontas e suporte pós-venda garantido.');
        setAboutSectionBadge(data.about?.sectionBadge || 'Nossas Raízes');
        setAboutSectionTitle(data.about?.sectionTitle || 'Bagagem Industrial de Quem Constrói com Procedência');
        setAboutSectionDesc1(data.about?.sectionDesc1 || 'A AgroPasi surge a partir de um consolidado grupo industrial com mais de 20 anos de tradição.');
        setAboutSectionDesc2(data.about?.sectionDesc2 || 'Não improvisamos. Controlamos todo o fluxo produtivo.');

        // Set Lists
        setFaqsList(data.faqs || []);
        setBlogList(data.blog || []);
        setGalleryList(data.gallery || []);
        setRepsList(data.representatives || []);
        setMainOverrides(sanitizeOverrides(data.productOverrides || {}));

        // Save local cache so it loads instantly with zero flash
        localStorage.setItem('agropasi_cms_hero', JSON.stringify(data.hero || {}));
        localStorage.setItem('agropasi_cms_about', JSON.stringify(data.about || {}));
        localStorage.setItem('agropasi_cms_faqs', JSON.stringify(data.faqs || []));
        localStorage.setItem('agropasi_cms_blog_posts', JSON.stringify(data.blog || []));
        localStorage.setItem('agropasi_cms_gallery', JSON.stringify(data.gallery || []));
        localStorage.setItem('agropasi_cms_reps', JSON.stringify(data.representatives || []));
        localStorage.setItem('agropasi_tractors', JSON.stringify(data.tractors || []));
        localStorage.setItem('agropasi_main_products_overrides', JSON.stringify(sanitizeOverrides(data.productOverrides || {})));
      }
    } catch (err) {
      console.error('Falha ao carregar catálogo:', err);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  const loadLeads = async () => {
    try {
      const res = await api.getLeads();
      setLeads(res.leads);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    }
  };

  const loadTractors = () => {
    // Defer to unified catalog load
  };

  const loadCms = () => {
    // Defer to unified catalog load
  };

  // Handle Login authentication with secure server-side bcrypt
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await api.login({ email: email.trim(), password });
      if (res && res.success) {
        setCurrentRole(res.user.role as any);
        setIsAuthenticated(true);
        setActiveTab('leads');
        triggerToast(`Autenticado com sucesso como ${res.user.role === 'dono' ? 'Proprietário (Dono)' : 'Equipe de Vendas'}! ✓`);
        
        // Fetch CRM Leads
        const leadsRes = await api.getLeads();
        setLeads(leadsRes.leads);
        if (res.user.role === 'dono') {
          loadSecurityLogs();
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'E-mail ou senha incorretos ou limite de tentativas excedido.');
    }
  };

  // Lead updates
  const updateLeadStatus = async (leadId: string, newStatus: 'Pendente' | 'Atendido' | 'Arquivado') => {
    try {
      await api.updateLeadStatus(leadId, newStatus);
      const updated = leads.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, status: newStatus };
        }
        return lead;
      });
      setLeads(updated);
      triggerToast(`Status do lead alterado para "${newStatus}"!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status do lead.');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!window.confirm('Excluir esta solicitação de contato permanentemente?')) return;
    try {
      await api.deleteLead(leadId);
      const updated = leads.filter(lead => lead.id !== leadId);
      setLeads(updated);
      triggerToast('Solicitação deletada permanentemente com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir solicitação de contato.');
    }
  };

  // Tractor CRUD methods (add or remove items)
  const handleAddTractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newModel || !newHp) {
      triggerToast('Aviso: Preencha todos os campos obrigatórios (*).');
      return;
    }

    try {
      const res = await api.addTractor({
        brand: newBrand,
        model: newModel,
        hpRequired: `${newHp} cv`,
        compatibility: newCompatibility,
        ptoRpm: newPto || '540 RPM (Econômica)',
        hitchType: newHitch || '3 Pontos - Cat. II'
      });

      const addedTractor = res.tractor || {
        id: `t_user_${Date.now()}`,
        brand: newBrand,
        model: newModel,
        hpRequired: `${newHp} cv`,
        compatibility: newCompatibility,
        ptoRpm: newPto || '540 RPM (Econômica)',
        hitchType: newHitch || '3 Pontos - Cat. II'
      };

      const nextList = [addedTractor, ...tractors];
      setTractors(nextList);
      setTractorsCount(nextList.length);

      // Notify other components
      window.dispatchEvent(new Event('storage_updated'));

      // Clear fields
      setNewBrand('');
      setNewModel('');
      setNewHp('');
      setNewPto('');
      setNewHitch('');
      triggerToast('Trator homologado e adicionado com êxito! ✓');
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar modelo de trator.');
    }
  };

  const handleRemoveTractor = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o trator "${name}"?`)) return;
    try {
      await api.deleteTractor(id);
      const filtered = tractors.filter(t => t.id !== id);
      setTractors(filtered);
      setTractorsCount(filtered.length);

      // Notify other components
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast(`Modelo "${name}" removido com sucesso!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover modelo de trator.');
    }
  };

  const handleSaveLogoDirectly = async (urlToSave: string) => {
    setIsSavingLogo(true);
    try {
      await api.saveLogo(urlToSave);
      
      const storedHero = localStorage.getItem('agropasi_cms_hero');
      const parsed = storedHero ? JSON.parse(storedHero) : {};
      parsed.logoUrl = urlToSave;
      localStorage.setItem('agropasi_cms_hero', JSON.stringify(parsed));
      
      window.dispatchEvent(new Event('storage_updated'));
      setSiteLogoUrl(urlToSave);
      triggerToast(urlToSave ? '✓ Logo oficial salva e aplicada em todo o site com sucesso!' : '✓ Logo oficial restaurada para o padrão vetorial!');
    } catch (err: any) {
      console.error('Erro ao salvar logo:', err);
      triggerToast('Erro ao salvar logo: ' + (err.message || 'Falha ao comunicar com o servidor'));
    } finally {
      setIsSavingLogo(false);
    }
  };

  // CMS Content Save for Owner Role (Hero & Legacy options)
  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save HERO & LOGO state to SQLite database
      await api.saveHero({
        badge: heroBadge,
        title: heroTitle,
        description: heroDesc,
        photoUrl: heroPhoto,
        logoUrl: siteLogoUrl
      });

      // Save ABOUT state to SQLite database
      await api.saveAbout({
        grandpaPhoto: aboutPhoto,
        grandpaTitle: aboutTitle,
        grandpaText: aboutDesc,
        grandpaQuote: aboutQuote,
        industrialPhoto: aboutIndustrialPhoto,
        industrialTitle: aboutIndustrialTitle,
        industrialText: aboutIndustrialText,
        sectionBadge: aboutSectionBadge,
        sectionTitle: aboutSectionTitle,
        sectionDesc1: aboutSectionDesc1,
        sectionDesc2: aboutSectionDesc2
      });

      // Save local cache for immediate layout updates
      const heroObj = {
        badge: heroBadge,
        title: heroTitle,
        description: heroDesc,
        photoUrl: heroPhoto,
        logoUrl: siteLogoUrl
      };
      localStorage.setItem('agropasi_cms_hero', JSON.stringify(heroObj));

      const aboutObj = {
        grandpaPhoto: aboutPhoto,
        grandpaTitle: aboutTitle,
        grandpaText: aboutDesc,
        grandpaQuote: aboutQuote,
        industrialPhoto: aboutIndustrialPhoto,
        industrialTitle: aboutIndustrialTitle,
        industrialText: aboutIndustrialText,
        sectionBadge: aboutSectionBadge,
        sectionTitle: aboutSectionTitle,
        sectionDesc1: aboutSectionDesc1,
        sectionDesc2: aboutSectionDesc2
      };
      localStorage.setItem('agropasi_cms_about', JSON.stringify(aboutObj));

      // Emit live reload
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast('Parabéns! Todos os textos e fotos da página foram atualizados e sincronizados em tempo real! ✓');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar alterações de textos e imagens.');
    }
  };

  // FAQ managers
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer || !newFaqCategory) {
      triggerToast('Aviso: Preencha todos os dados da Dúvida/FAQ.');
      return;
    }
    
    try {
      const added = await api.addFaq({
        category: newFaqCategory,
        question: newFaqQuestion,
        answer: newFaqAnswer
      });

      const nextList = [...faqsList, added];
      localStorage.setItem('agropasi_cms_faqs', JSON.stringify(nextList));
      setFaqsList(nextList);
      setNewFaqQuestion('');
      setNewFaqAnswer('');
      setNewFaqCategory('');
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast('Dúvida (FAQ) publicada e adicionada com sucesso no SQLite! ✓');
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar pergunta.');
    }
  };

  const handleRemoveFaq = async (id: string) => {
    if (!window.confirm('Excluir esta pergunta de FAQ permanentemente?')) return;
    try {
      await api.deleteFaq(id);
      const nextList = faqsList.filter(item => item.id !== id);
      localStorage.setItem('agropasi_cms_faqs', JSON.stringify(nextList));
      setFaqsList(nextList);
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast('FAQ removida com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao remover pergunta.');
    }
  };

  // Blog managers
  const handleAddBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent || !newPostCategory) {
      triggerToast('Aviso: Forneça pelo menos título, categoria e conteúdo do artigo.');
      return;
    }
    
    try {
      const added = await api.addBlogPost({
        title: newPostTitle,
        category: newPostCategory,
        excerpt: newPostExcerpt || newPostContent.substring(0, 110) + '...',
        content: newPostContent,
        readTime: newPostReadTime || '5 min leitura',
        imageUrl: newPostImage || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400'
      });

      const nextList = [added, ...blogList];
      localStorage.setItem('agropasi_cms_blog_posts', JSON.stringify(nextList));
      setBlogList(nextList);
      setNewPostTitle('');
      setNewPostCategory('');
      setNewPostExcerpt('');
      setNewPostContent('');
      setNewPostImage('');
      setNewPostReadTime('5 min leitura');
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast('Artigo do Blog publicado no SQLite com êxito! ✓');
    } catch (err: any) {
      alert(err.message || 'Erro ao publicar artigo de blog.');
    }
  };

  const insertFormatTag = (tagTemplate: string) => {
    const textarea = document.getElementById('cms-blog-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      setNewPostContent(prev => prev + tagTemplate);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + tagTemplate + after;
    setNewPostContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + tagTemplate.length;
      textarea.selectionEnd = start + tagTemplate.length;
    }, 50);
  };

  const handleRemoveBlogPost = async (id: string) => {
    if (!window.confirm('Excluir este artigo permanentemente do blog?')) return;
    try {
      await api.deleteBlogPost(id);
      const nextList = blogList.filter(item => item.id !== id);
      localStorage.setItem('agropasi_cms_blog_posts', JSON.stringify(nextList));
      setBlogList(nextList);
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast('Artigo removido com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir artigo de blog.');
    }
  };

  // Gallery managers
  const handleStartEditGalleryItem = (item: any) => {
    setEditingGalId(item.id);
    setNewGalTitle(item.title);
    setNewGalCategory(item.category);
    setNewGalCategoryLabel(item.categoryLabel);
    setNewGalMediaUrl(item.mediaUrl || '');
    setNewGalDescription(item.description);
    setNewGalLocation(item.location || '');
    setNewGalDuration(item.duration || '');
    setNewGalVideoUrl(item.videoUrl || '');
    const formElement = document.getElementById('gallery-form-title');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditGalleryItem = () => {
    setEditingGalId(null);
    setNewGalTitle('');
    setNewGalMediaUrl('');
    setNewGalDescription('');
    setNewGalLocation('');
    setNewGalDuration('');
    setNewGalVideoUrl('');
    setNewGalCategory('photo');
    setNewGalCategoryLabel('Fotografia de Campo');
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle || !newGalDescription) {
      triggerToast('Aviso: Preencha pelo menos o título e a descrição visual do item.');
      return;
    }
    
    try {
      const payload = {
        title: newGalTitle,
        category: newGalCategory as any,
        categoryLabel: newGalCategoryLabel || (newGalCategory === 'video' ? 'Vídeo Operacional' : 'Fotografia de Campo'),
        mediaUrl: newGalMediaUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
        description: newGalDescription,
        location: newGalLocation || undefined,
        duration: newGalCategory === 'video' ? (newGalDuration || '01:00') : undefined,
        videoUrl: newGalCategory === 'video' ? (newGalVideoUrl || undefined) : undefined
      };

      let nextList;
      if (editingGalId) {
        const res = await api.updateGalleryItem(editingGalId, payload);
        nextList = galleryList.map(item => item.id === editingGalId ? res.item : item);
        triggerToast('Item da galeria editado com êxito! ✓');
      } else {
        const added = await api.addGalleryItem(payload);
        nextList = [added, ...galleryList];
        triggerToast('Item adicionado à galeria "Produto em Ação" no SQLite! ✓');
      }

      localStorage.setItem('agropasi_cms_gallery', JSON.stringify(nextList));
      setGalleryList(nextList);
      
      // Reset form
      setNewGalTitle('');
      setNewGalMediaUrl('');
      setNewGalDescription('');
      setNewGalLocation('');
      setNewGalDuration('');
      setNewGalVideoUrl('');
      setNewGalCategory('photo');
      setNewGalCategoryLabel('Fotografia de Campo');
      setEditingGalId(null);

      window.dispatchEvent(new Event('storage_updated'));
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar item de galeria.');
    }
  };

  const handleRemoveGalleryItem = async (id: string) => {
    if (!window.confirm('Excluir este item da galeria permanentemente?')) return;
    try {
      await api.deleteGalleryItem(id);
      const nextList = galleryList.filter(item => item.id !== id);
      localStorage.setItem('agropasi_cms_gallery', JSON.stringify(nextList));
      setGalleryList(nextList);
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast('Item removido da galeria!');
    } catch (err: any) {
      alert(err.message || 'Erro ao remover item de galeria.');
    }
  };

  // Representative managers
  const handleAddRepresentative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName || !newRepPhone || !newRepRegion) {
      triggerToast('Aviso: Preencha o nome, telefone e região do representante.');
      return;
    }
    const coverCepsArray = newRepCeps
      ? newRepCeps.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    try {
      if (editingRepId) {
        const res = await api.updateRepresentative(editingRepId, {
          name: newRepName,
          region: newRepRegion,
          phone: newRepPhone.replace(/\D/g, ''),
          email: newRepEmail || 'comercial@agropasi.com.br',
          coverCeps: coverCepsArray,
          avatarUrl: newRepAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250&h=250'
        });

        const updatedRep = res.representative || {
          id: editingRepId,
          name: newRepName,
          region: newRepRegion,
          phone: newRepPhone.replace(/\D/g, ''),
          email: newRepEmail || 'comercial@agropasi.com.br',
          coverCeps: coverCepsArray,
          avatarUrl: newRepAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250&h=250'
        };

        const nextList = repsList.map(item => item.id === editingRepId ? updatedRep : item);
        localStorage.setItem('agropasi_cms_reps', JSON.stringify(nextList));
        setRepsList(nextList);
        setEditingRepId(null);
        setNewRepName('');
        setNewRepRegion('');
        setNewRepPhone('');
        setNewRepEmail('');
        setNewRepCeps('');
        setNewRepAvatar('');
        window.dispatchEvent(new Event('storage_updated'));
        triggerToast('Dados do representante atualizados com sucesso! ✓');
      } else {
        const added = await api.addRepresentative({
          name: newRepName,
          region: newRepRegion,
          phone: newRepPhone.replace(/\D/g, ''),
          email: newRepEmail || 'comercial@agropasi.com.br',
          coverCeps: coverCepsArray,
          avatarUrl: newRepAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250&h=250'
        });

        const newRepItem = added.representative || added;
        const nextList = [newRepItem, ...repsList];
        localStorage.setItem('agropasi_cms_reps', JSON.stringify(nextList));
        setRepsList(nextList);
        setNewRepName('');
        setNewRepRegion('');
        setNewRepPhone('');
        setNewRepEmail('');
        setNewRepCeps('');
        setNewRepAvatar('');
        window.dispatchEvent(new Event('storage_updated'));
        triggerToast('Novo Representante cadastrado e ativo para simulações de CEP! ✓');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar representante.');
    }
  };

  const handleStartEditRepresentative = (rep: any) => {
    setEditingRepId(rep.id);
    setNewRepName(rep.name || '');
    setNewRepRegion(rep.region || '');
    setNewRepPhone(rep.phone || '');
    setNewRepEmail(rep.email || '');
    setNewRepCeps(Array.isArray(rep.coverCeps) ? rep.coverCeps.join(', ') : '');
    setNewRepAvatar(rep.avatarUrl || '');
    triggerToast(`Editando dados de "${rep.name}"`);
  };

  const handleCancelEditRepresentative = () => {
    setEditingRepId(null);
    setNewRepName('');
    setNewRepRegion('');
    setNewRepPhone('');
    setNewRepEmail('');
    setNewRepCeps('');
    setNewRepAvatar('');
  };

  const handleRemoveRepresentative = async (id: string, name: string) => {
    if (repsList.length <= 1) {
      triggerToast('Erro: Você deve manter pelo menos 1 representante central ativo para receber as mensagens.');
      return;
    }
    if (!window.confirm(`Excluir o representante "${name}" permanentemente?`)) return;
    try {
      await api.deleteRepresentative(id);
      const nextList = repsList.filter(item => item.id !== id);
      localStorage.setItem('agropasi_cms_reps', JSON.stringify(nextList));
      setRepsList(nextList);
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast(`Representante "${name}" removido com sucesso.`);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover representante.');
    }
  };

  // Dynamic Custom Products logic (For Owner)
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdDesc) {
      triggerToast('Aviso: Forneça pelo menos o nome e a descrição do novo equipamento.');
      return;
    }

    // Process optional comma-separated specs list
    const parsedSpecs = newProdSpecs
      ? newProdSpecs.split(',').map(s => s.trim()).filter(Boolean)
      : ['Fabricação Própria', 'Aço Galvanizado'];

    const storedStr = localStorage.getItem('agropasi_custom_products');
    const existing: CustomProduct[] = storedStr ? JSON.parse(storedStr) : [];

    const newProd: CustomProduct = {
      id: `prod_${Date.now()}`,
      title: newProdTitle,
      description: newProdDesc,
      image: newProdImg || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400',
      badge: newProdBadge || undefined,
      specs: parsedSpecs
    };

    const nextList = [newProd, ...existing];
    localStorage.setItem('agropasi_custom_products', JSON.stringify(nextList));
    
    // Clean fields
    setNewProdTitle('');
    setNewProdDesc('');
    setNewProdImg('');
    setNewProdBadge('');
    setNewProdSpecs('');

    // Emit live reload
    window.dispatchEvent(new Event('storage_updated'));
    triggerToast(`Equipamento "${newProd.title}" adicionado e publicado no portfólio de produtos! ✓`);
  };

  // Delete dynamic custom added products
  const handleRemoveProduct = (id: string, name: string) => {
    const storedStr = localStorage.getItem('agropasi_custom_products');
    if (!storedStr) return;
    const existing: CustomProduct[] = JSON.parse(storedStr);
    const filtered = existing.filter(p => p.id !== id);
    localStorage.setItem('agropasi_custom_products', JSON.stringify(filtered));
    
    // Emit live reload
    window.dispatchEvent(new Event('storage_updated'));
    triggerToast(`Produto "${name}" removido com sucesso.`);
  };

  const getCustomProductsList = (): CustomProduct[] => {
    const stored = localStorage.getItem('agropasi_custom_products');
    return stored ? JSON.parse(stored) : [];
  };

  // Main products handlers for editing and resetting overrides
  const handleSaveMainProductOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMainId) return;

    // Serialize Specs & Benefits
    const specsObj = {
      larguraAberto: editSpecsLarguraAberto,
      larguraFechado: editSpecsLarguraFechado,
      comprimento: editSpecsComprimento,
      alturaTotal: editSpecsAlturaTotal,
      pesoLiquido: editSpecsPesoLiquido,
      potenciaMinima: editSpecsPotenciaMinima,
      vazaoHidraulica: editSpecsVazaoHidraulica,
      rotacaoTdp: editSpecsRotacaoTdp,
      acoplamento: editSpecsAcoplamento,
      capacidadeCarga: editSpecsCapacidadeCarga,
      rendimentoEstimado: editSpecsRendimentoEstimado,
      sistemaSeparador: editSpecsSistemaSeparador
    };

    const benefitsList = [
      { title: editBenefit1Title, desc: editBenefit1Desc },
      { title: editBenefit2Title, desc: editBenefit2Desc },
      { title: editBenefit3Title, desc: editBenefit3Desc },
      { title: editBenefit4Title, desc: editBenefit4Desc }
    ].filter(b => b.title.trim() !== '');

    const specsJson = JSON.stringify(specsObj);
    const benefitsJson = JSON.stringify(benefitsList);

    try {
      await api.saveProductOverride({
        id: editingMainId,
        title: editMainTitle,
        description: editMainDesc,
        imageUrl: editMainImg,
        badge: editMainBadge,
        tag: editMainTag,
        competitorLiters: editMainCompetitorLiters,
        ourLiters: editMainOurLiters,
        specsJson,
        benefitsJson
      });

      const updated = {
        ...mainOverrides,
        [editingMainId]: {
          name: editMainTitle,
          description: editMainDesc,
          image: editMainImg,
          badge: editMainBadge,
          tag: editMainTag,
          competitorHourlyLiters: editMainCompetitorLiters,
          ourHourlyLiters: editMainOurLiters,
          specsJson,
          benefitsJson
        }
      };

      localStorage.setItem('agropasi_main_products_overrides', JSON.stringify(sanitizeOverrides(updated)));
      setMainOverrides(sanitizeOverrides(updated));
      setEditingMainId(null);

      // Emit live reload
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast('Alterações no produto em destaque salvas com sucesso! ✓');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar alterações no produto.');
    }
  };

  const handleResetMainProductOverride = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente redefinir o produto "${name}" para as especificações de fábrica?`)) return;
    
    try {
      await api.deleteProductOverride(id);

      const updated = { ...mainOverrides };
      delete updated[id];

      localStorage.setItem('agropasi_main_products_overrides', JSON.stringify(sanitizeOverrides(updated)));
      setMainOverrides(sanitizeOverrides(updated));
      if (editingMainId === id) {
        setEditingMainId(null);
      }

      // Emit live reload
      window.dispatchEvent(new Event('storage_updated'));
      triggerToast(`Produto "${name}" restaurado para o padrão original de fábrica! ✓`);
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar produto.');
    }
  };

  const startEditingMainProduct = (id: string, defaultProd: any) => {
    setEditingMainId(id);
    const saved = mainOverrides[id] || {};
    setEditMainTitle(saved.name || saved.title || defaultProd.name);
    setEditMainDesc(saved.description || defaultProd.description);
    setEditMainImg(saved.image || saved.imageUrl || defaultProd.image);
    setEditMainBadge(saved.badge !== undefined ? saved.badge : defaultProd.badge || '');
    setEditMainTag(saved.tag || defaultProd.tag || '');
    
    const defComp = id === 'varremax-x' ? 8.5 : id === 'pasiparts' ? 5.2 : 5.0;
    const defOur = id === 'varremax-x' ? 6.0 : id === 'pasiparts' ? 3.6 : 3.5;
    setEditMainCompetitorLiters(saved.competitorHourlyLiters !== undefined ? saved.competitorHourlyLiters : (saved.competitorLiters !== undefined ? saved.competitorLiters : defComp));
    setEditMainOurLiters(saved.ourHourlyLiters !== undefined ? saved.ourHourlyLiters : (saved.ourLiters !== undefined ? saved.ourLiters : defOur));

    // Parse specifications
    let specsObj: any = {};
    if (saved.specsJson) {
      try {
        specsObj = safeParseJson(saved.specsJson) || {};
      } catch (e) {
        console.error('Error parsing specsJson:', e);
      }
    }

    setEditSpecsLarguraAberto(specsObj.larguraAberto || (id === 'varrefort-s' ? '2,18 m' : id === 'varremax-x' ? '1,50 m a 2,00 m' : ''));
    setEditSpecsLarguraFechado(specsObj.larguraFechado || (id === 'varrefort-s' ? '1,98 m' : ''));
    setEditSpecsComprimento(specsObj.comprimento || (id === 'varrefort-s' ? '1,80 m' : ''));
    setEditSpecsAlturaTotal(specsObj.alturaTotal || (id === 'varrefort-s' ? '1,40 m' : ''));
    setEditSpecsPesoLiquido(specsObj.pesoLiquido || (id === 'varrefort-s' ? '456 kg' : ''));
    setEditSpecsPotenciaMinima(specsObj.potenciaMinima || (id === 'varrefort-s' ? '50 cv' : id === 'varremax-x' ? 'Mínimo 60 cv' : ''));
    setEditSpecsVazaoHidraulica(specsObj.vazaoHidraulica || (id === 'varrefort-s' ? '30 L/min' : ''));
    setEditSpecsRotacaoTdp(specsObj.rotacaoTdp || (id === 'varrefort-s' ? '540 rpm' : ''));
    setEditSpecsAcoplamento(specsObj.acoplamento || (id === 'varrefort-s' ? '3 Pontos Cat. II' : ''));

    setEditSpecsCapacidadeCarga(specsObj.capacidadeCarga || (id === 'varremax-x' ? '1.500 Litros' : ''));
    setEditSpecsRendimentoEstimado(specsObj.rendimentoEstimado || (id === 'varremax-x' ? 'Até 2.500 kg/hora' : ''));
    setEditSpecsSistemaSeparador(specsObj.sistemaSeparador || (id === 'varremax-x' ? 'Turbina de sucção dupla com peneira vibratória autolimpante' : ''));

    // Parse benefits
    let benefitsList: any[] = [];
    if (saved.benefitsJson) {
      try {
        benefitsList = safeParseJson(saved.benefitsJson) || [];
      } catch (e) {
        console.error('Error parsing benefitsJson:', e);
      }
    }

    const defaultBenefits = id === 'varrefort-s' ? [
      { title: 'Economia Direta de Diesel', desc: 'Multiplicadores de torque próprios permitem vento máximo em baixa rotação.' },
      { title: 'Preservação das Raízes', desc: 'Chassis leve de 456kg evita a compactação severa sob as copas.' },
      { title: 'Peças de Reposição 100% Prontas', desc: 'Todo o fornecimento é usinado internamente com envio em 24h.' },
      { title: 'Ajustes Rápidos e Seguros', desc: 'Defletores de sopro reguláveis ideais para planos e montanhas.' }
    ] : id === 'varremax-x' ? [
      { title: 'Peneiramento Vibratório de Alta Frequência', desc: 'Filtra terra e galhos finos antes do armazenamento no reservatório.' },
      { title: 'Reservatório com Basculamento Hidráulico', desc: 'Descarga direta e rápida na carreta de transbordo com menos esforço físico.' },
      { title: 'Baixa Compactação de Solo', desc: 'Eixos distribuidores de peso com pneus flutuantes largos para proteger as raízes superficiais.' },
      { title: 'Operação Traseira Direta', desc: 'Acoplamento perfeito de 3 pontos para manobras ágeis.' }
    ] : [];

    setEditBenefit1Title(benefitsList[0]?.title || defaultBenefits[0]?.title || '');
    setEditBenefit1Desc(benefitsList[0]?.desc || defaultBenefits[0]?.desc || '');
    setEditBenefit2Title(benefitsList[1]?.title || defaultBenefits[1]?.title || '');
    setEditBenefit2Desc(benefitsList[1]?.desc || defaultBenefits[1]?.desc || '');
    setEditBenefit3Title(benefitsList[2]?.title || defaultBenefits[2]?.title || '');
    setEditBenefit3Desc(benefitsList[2]?.desc || defaultBenefits[2]?.desc || '');
    setEditBenefit4Title(benefitsList[3]?.title || defaultBenefits[3]?.title || '');
    setEditBenefit4Desc(benefitsList[3]?.desc || defaultBenefits[3]?.desc || '');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'logo' | 'about' | 'aboutIndustrial' | 'product' | 'blog' | 'gallery' | 'rep' | 'mainProductOverride') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') {
      setIsSavingLogo(true);
      api.uploadImage(file)
        .then((res) => {
          if (res?.url) {
            setSiteLogoUrl(res.url);
            handleSaveLogoDirectly(res.url);
          } else {
            throw new Error('Servidor não retornou a URL da imagem');
          }
        })
        .catch((err) => {
          console.warn('Falha no upload direto via servidor, usando otimizador local:', err);
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX_WIDTH = 400;
              const MAX_HEIGHT = 200;
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const isPng = file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/webp';
                const logoBase64 = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85);
                setSiteLogoUrl(logoBase64);
                handleSaveLogoDirectly(logoBase64);
              }
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        })
        .finally(() => {
          setIsSavingLogo(false);
        });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Create canvas to resize image down so it doesn't overflow localStorage (5MB max)
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG 0.75 for highly efficient storage and lightning-fast loading
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          
          if (type === 'hero') {
            setHeroPhoto(compressedBase64);
          } else if (type === 'about') {
            setAboutPhoto(compressedBase64);
          } else if (type === 'aboutIndustrial') {
            setAboutIndustrialPhoto(compressedBase64);
          } else if (type === 'product') {
            setNewProdImg(compressedBase64);
          } else if (type === 'blog') {
            setNewPostImage(compressedBase64);
          } else if (type === 'gallery') {
            setNewGalMediaUrl(compressedBase64);
          } else if (type === 'rep') {
            setNewRepAvatar(compressedBase64);
          } else if (type === 'mainProductOverride') {
            setEditMainImg(compressedBase64);
          }
          triggerToast('Imagem otimizada e acoplada com sucesso! ✓');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const filteredLeads = leads.filter(lead => {
    if (leadsFilter === 'all') return true;
    return lead.status === leadsFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1e2c] text-white overflow-hidden flex flex-col font-sans animate-fadeIn admin-portal-dark">
      
      {/* SUCCESS TOAST Banner notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#d48743] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-[#d48743]/30 font-sans max-w-md animate-slideIn select-none">
          <div className="bg-[#1a1e2c] text-[#d48743] p-1.5 rounded-full">
            <Check className="w-5 h-5 stroke-3" />
          </div>
          <div>
            <span className="block font-bold text-xs uppercase tracking-wider text-white/90 leading-none mb-1">Confirmação Visual</span>
            <p className="text-[11px] font-medium leading-tight text-white/80">{successToast}</p>
          </div>
        </div>
      )}

      {/* BEFORE AUTHENTICATION Gate Screen */}
      {!isAuthenticated ? (
        <div className="flex-grow flex items-center justify-center p-4 sm:p-6 bg-[#1a1e2c] relative overflow-y-auto">
          {/* Decorative industry details */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d48743]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d48743]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md bg-[#262b3f] border border-[#d48743]/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition p-2 hover:bg-[#1a1e2c]/60 rounded-lg flex items-center space-x-1.5 text-xs font-semibold"
              title="Ir para o Site Oficial"
            >
              <span>Ir para o Site</span>
              <X className="w-4 h-4" />
            </button>

            {/* Logo area */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center mb-2">
                <AgroPasiLogo size="lg" variant="dark-bg" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-300">Portal do Colaborador</h2>
              <p className="text-xs text-zinc-400 font-sans max-w-xs mx-auto">Autentique-se com sua senha corporativa para acessar as ferramentas de gestão.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Login error box */}
              {loginError && (
                <div className="p-3 bg-red-950/50 border border-red-900/60 text-red-300 text-xs rounded-xl leading-normal">
                  {loginError}
                </div>
              )}

              {/* User Selector */}
              <div>
                <label htmlFor="user-type-select" className="block text-[10px] uppercase font-bold text-zinc-300 mb-1.5 tracking-wider">Conta de Entrada:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('vendas'); setLoginError(''); }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition text-center ${
                      selectedRole === 'vendas'
                        ? 'bg-[#1a1e2c] border-[#d48743] text-[#d48743]'
                        : 'bg-[#1a1e2c]/30 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    Equipe de Vendas
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('dono'); setLoginError(''); }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition text-center ${
                      selectedRole === 'dono'
                        ? 'bg-[#1a1e2c] border-[#d48743] text-[#d48743]'
                        : 'bg-[#1a1e2c]/30 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    Proprietário (Dono)
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label htmlFor="auth-email-input" className="block text-[10px] uppercase font-bold text-zinc-300 mb-1 tracking-wider">E-mail Corporativo:</label>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="usuario@agropasi.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1e2c] border border-zinc-800 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#d48743] text-white"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label htmlFor="auth-password-input" className="block text-[10px] uppercase font-bold text-zinc-300 mb-1 tracking-wider">Senha de Segurança:</label>
                <div className="relative">
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1e2c] border border-zinc-800 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#d48743] font-mono tracking-widest text-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Security Policy Notice */}
              <div className="p-3 bg-[#1a1e2c]/60 rounded-xl border border-zinc-800/80 leading-relaxed text-center space-y-1">
                <p className="text-[10px] text-zinc-400 font-sans">
                  Acesso restrito à equipe autorizada AgroPasi.
                </p>
                <p className="text-[9px] text-zinc-500 font-mono">
                  Segurança ativa: limite de tentativas e auditoria de IP habilitados.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center space-x-2"
              >
                <span>Entrar no Painel</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* LOGGED IN Dashboard Layout */
        <>
          {/* Top Header */}
          <header className="bg-[#262b3f] border-b border-zinc-800 py-3.5 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="bg-[#d48743] text-white p-2 rounded-lg font-extrabold flex items-center justify-center shadow">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm font-bold font-sans tracking-wide text-white">AgroPasi Painel Gerencial</h1>
                  <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    currentRole === 'dono' ? 'bg-[#d48743] text-white border border-[#d48743]' : 'bg-[#d48743] text-white border border-[#d48743]'
                  }`}>
                    {currentRole === 'dono' ? 'Proprietário (Dono)' : 'Agente Vendas'}
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 font-mono tracking-wider">Modo Administrador Autorizado • Catanduva/SP</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <button
                onClick={async () => {
                  try {
                    await api.logout();
                  } catch (err) {}
                  setIsAuthenticated(false);
                  setPassword('');
                  setCurrentRole(null);
                  triggerToast('Logoff efetuado com êxito. Sessão invalidada no servidor.');
                }}
                className="text-zinc-300 hover:text-white transition text-xs font-semibold py-1.5 px-2.5 hover:bg-[#1a1e2c]/60 rounded-lg cursor-pointer"
              >
                Trocar Conta / Sair
              </button>
              <button
                onClick={onClose}
                type="button"
                className="bg-[#d48743] hover:bg-[#c27a41] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer flex items-center space-x-1.5"
              >
                <span>Voltar ao Site Oficial</span>
              </button>
            </div>
          </header>

          {/* Core Body */}
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Categories Gated by Role permissions */}
            <aside className="w-full md:w-64 bg-[#262b3f] border-b md:border-b-0 md:border-r border-zinc-850 p-5 space-y-6 shrink-0 flex flex-col justify-between">
              <div className="space-y-4 text-white">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">CRM de Contatos</span>
                  
                  <button
                    onClick={() => setActiveTab('leads')}
                    type="button"
                    className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center transition ${
                      activeTab === 'leads' ? 'bg-[#d48743] text-white font-bold' : 'text-zinc-300 hover:bg-[#1a1e2c]/40 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2.5 shrink-0" />
                    Solicitações & Leads ({leads.length})
                  </button>
                </div>

                {/* Gestão de Produtos (Acessível para Vendas e Dono) */}
                <div className="space-y-1.5 pt-4 border-t border-zinc-800">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Catálogo do Portfólio</span>
                  
                  <button
                    onClick={() => setActiveTab('products')}
                    type="button"
                    className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center transition ${
                      activeTab === 'products' ? 'bg-[#d48743] text-white font-bold' : 'text-zinc-300 hover:text-white hover:bg-[#1a1e2c]/40'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2.5 shrink-0" />
                    Gerenciar Produtos
                  </button>
                </div>

                {/* Dono only Tabs */}
                {currentRole === 'dono' && (
                  <div className="space-y-1.5 pt-4 border-t border-zinc-800">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Gestão do Proprietário (Dono)</span>
                    
                    <button
                      onClick={() => setActiveTab('cms')}
                      type="button"
                      className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center transition ${
                        activeTab === 'cms' ? 'bg-[#d48743] text-white font-bold' : 'text-zinc-300 hover:text-white hover:bg-[#1a1e2c]/40'
                      }`}
                    >
                      <Layout className="w-4 h-4 mr-2.5 shrink-0" />
                      Editar Textos e Imagens
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('logs');
                        loadSecurityLogs();
                      }}
                      type="button"
                      className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center transition ${
                        activeTab === 'logs' ? 'bg-[#d48743] text-white font-bold' : 'text-zinc-300 hover:text-white hover:bg-[#1a1e2c]/40'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2.5 shrink-0 text-emerald-500" />
                      Auditoria de Segurança
                    </button>
                  </div>
                )}

                {/* Inform Vendas users they cannot edit layout */}
                {currentRole === 'vendas' && (
                  <div className="p-3.5 bg-[#1a1e2c]/60 border border-zinc-800 rounded-xl leading-relaxed text-zinc-400 text-[11px]">
                    <span className="font-bold text-[#d48743] block mb-1">Acesso Comercial Ativo:</span>
                    Como Equipe de Vendas, você pode gerenciar novas solicitações de cafeicultores rurais e adicionar ou remover produtos do catálogo de implementos, mas as opções de edição do layout do site são exclusivas para a conta do <strong>Dono</strong>.
                  </div>
                )}
              </div>

              <div className="bg-[#1a1e2c]/60 p-4 rounded-xl border border-zinc-800 space-y-1 shadow-sm hidden md:block">
                <span className="block text-[9px] font-bold text-[#d48743] font-mono uppercase tracking-widest">Sincronismo do Navegador</span>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                  Todas as edições aplicadas atuam imediatamente nos dados de visualização dinâmica do site via LocalStorage.
                </p>
              </div>
            </aside>

            {/* Dynamic Content Panel */}
            <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#1a1e2c] flex flex-col text-white">
              
              {/* TAB 1: Leads & Contact manager (Accessible to Both) */}
              {activeTab === 'leads' && (
                <div className="space-y-6 flex-grow flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight">Solicitações de Venda & Consultas Recebidas</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Acompanhamento e CRM das mensagens que chegam pelas fichas de contato e simulador.</p>
                    </div>

                    {/* Filter toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                      {['all', 'Pendente', 'Atendido', 'Arquivado'].map(f => (
                        <button
                          key={f}
                          onClick={() => setLeadsFilter(f as any)}
                          type="button"
                          className={`py-1 px-2.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all duration-150 ${
                            leadsFilter === f ? 'bg-zinc-800 text-[#d48743]' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {f === 'all' ? 'Ver Todos' : f}
                        </button>
                      ))}
                      <button onClick={loadLeads} type="button" className="p-1 text-zinc-400 hover:text-white rounded" title="Recarregar">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CRM Table */}
                  <div className="flex-grow overflow-x-auto min-h-[350px]">
                    {filteredLeads.length > 0 ? (
                      <div className="min-w-[900px] border border-zinc-850 rounded-xl overflow-hidden bg-zinc-900/60 backdrop-blur-sm">
                        <table className="w-full text-left bg-zinc-90 w-full border-collapse">
                          <thead>
                            <tr className="bg-zinc-900 text-[10px] uppercase text-zinc-400 font-bold tracking-wider border-b border-zinc-800">
                              <th className="py-3.5 px-4.5">Data de Envio</th>
                              <th className="py-3.5 px-4.5">Produtor Rural / Local</th>
                              <th className="py-3.5 px-4.5">Contatos</th>
                              <th className="py-3.5 px-4.5">Acoplador Trator</th>
                              <th className="py-3.5 px-4.5">Mensagem / Interesse</th>
                              <th className="py-3.5 px-4.5 text-center">Status</th>
                              <th className="py-3.5 px-4.5 text-right">Ações de Resposta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-805 text-xs">
                            {filteredLeads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-zinc-900/80 transition-colors">
                                <td className="py-4 text-zinc-500 font-mono px-4.5">{lead.date}</td>
                                <td className="py-4 px-4.5">
                                  <strong className="text-zinc-200 block text-sm">{lead.name}</strong>
                                  <span className="text-[10px] text-zinc-550 font-mono flex items-center mt-0.5">
                                    <MapPin className="w-3 h-3 text-[#d48743] mr-1 shrink-0" /> Local: {lead.city || 'Catanduva'} - {lead.state || 'SP'} ({lead.cep})
                                  </span>
                                </td>
                                <td className="py-4 px-4.5">
                                  <span className="block text-zinc-300 font-mono">{lead.phone}</span>
                                  <span className="text-[10px] text-zinc-500 block">{lead.email}</span>
                                </td>
                                <td className="py-4 px-4.5">
                                  <span className="block text-zinc-300 font-bold font-mono">{lead.tractorModel || 'Yanmar/Solis'}</span>
                                  <span className="text-[10px] text-[#d48743] mt-0.5 block font-semibold">{lead.representativeName || 'AgroPasi Sede Sítio'}</span>
                                </td>
                                <td className="py-4 px-4.5 max-w-[240px] text-zinc-400 leading-normal" title={lead.message}>
                                  <p className="line-clamp-2">{lead.message}</p>
                                </td>
                                <td className="py-4 px-4.5 text-center whitespace-nowrap">
                                  {lead.status === 'Pendente' && (
                                    <span className="bg-red-500/10 text-red-400 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-red-500/20">Pendente</span>
                                  )}
                                  {lead.status === 'Atendido' && (
                                    <span className="bg-[#d48743] text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-[#d48743]">Atendido</span>
                                  )}
                                  {lead.status === 'Arquivado' && (
                                    <span className="bg-zinc-800 text-zinc-400 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-zinc-700">Arquivado</span>
                                  )}
                                </td>
                                <td className="py-4 px-4.5 text-right whitespace-nowrap space-x-1.5">
                                  {lead.status === 'Pendente' && (
                                    <button
                                      onClick={() => updateLeadStatus(lead.id, 'Atendido')}
                                      type="button"
                                      className="p-1.5 bg-[#d48743] hover:bg-[#c27a41] rounded-lg text-white border border-[#d48743] transition"
                                      title="Atender Leads"
                                    >
                                      Atender ✓
                                    </button>
                                  )}
                                  {lead.status !== 'Arquivado' && (
                                    <button
                                      onClick={() => updateLeadStatus(lead.id, 'Arquivado')}
                                      type="button"
                                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition"
                                      title="Arquivar Lead"
                                    >
                                      Arquivar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteLead(lead.id)}
                                    type="button"
                                    className="p-1 px-1.5 bg-red-950/40 hover:bg-red-900 rounded-lg text-red-400 border border-red-950 transition"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-20 text-center text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-850 col-span-full">
                        <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs">Nenhuma solicitação encontrada com esse filtro de busca.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Edit dynamic products (EXCLUSIVE TO DONO & VENDAS) */}
              {activeTab === 'products' && (currentRole === 'dono' || currentRole === 'vendas') && (() => {
                const DEFAULT_MAIN_PRODS = [
                  {
                    id: 'varrefort-s',
                    name: 'Arruador de Café VarreFort-S',
                    description: 'O arruador soprador projetado para trabalhar em baixa rotação — 1.300 a 1.500 RPM — garantindo ventilação máxima, zero perdas na varrição e menos diesel a cada hora de trabalho.',
                    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
                    badge: 'Destaque de Vendas',
                    tag: 'Alta Performance'
                  },
                  {
                    id: 'varremax-x',
                    name: 'Recolhedora de Café RecolheFort-C',
                    description: 'Cadastre seu e-mail e receba em primeira mão as especificações técnicas, fotos de campo e condições especiais de pré-venda.',
                    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600',
                    badge: 'Pré-Lançamento',
                    tag: 'Colheita Mecanizada'
                  },
                  {
                    id: 'pasiparts',
                    name: 'Peças de Reposição & Suporte Técnico',
                    description: 'Estrutura industrial própria que garante a disponibilidade imediata de engrenagens, eixos temperados, rolamentos blindados e hélices balanceadas para envio rápido a todo o país.',
                    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
                    badge: 'Original de Fábrica',
                    tag: 'Peças Genuínas'
                  }
                ];
                
                return (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-extrabold text-zinc-100">Gerenciador de Portfólio (Produtos)</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Adicione novos equipamentos customizados ao site ou edite as informações e fotos dos 3 produtos principais em destaque.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left side: Add custom product OR Edit Main highlight override */}
                      <div className="lg:col-span-5 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                        {editingMainId ? (
                          <div>
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-[#d48743] flex items-center">
                                <Edit3 className="w-4 h-4 mr-2" /> Editar Destaque Principal
                              </h3>
                              <button 
                                type="button"
                                onClick={() => setEditingMainId(null)}
                                className="text-[10px] text-zinc-400 hover:text-white font-semibold font-mono"
                              >
                                [Cancelar]
                              </button>
                            </div>
                            
                            <form onSubmit={handleSaveMainProductOverride} className="space-y-3.5">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Título do Produto *</label>
                                <input
                                  type="text"
                                  required
                                  value={editMainTitle}
                                  onChange={(e) => setEditMainTitle(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Imagem do Produto *</label>
                                {editMainImg ? (
                                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2.5 flex items-center space-x-3 mb-2">
                                    <img 
                                      src={editMainImg} 
                                      alt="Preview" 
                                      className="w-12 h-12 object-cover rounded-md border border-zinc-800" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-mono text-zinc-400 truncate">
                                        {editMainImg.startsWith('data:') ? 'Arquivo de Imagem Carregado' : editMainImg}
                                      </p>
                                      <span className="text-[9px] text-[#d48743] font-semibold block leading-none font-mono">Destaque Alterado</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEditMainImg('')}
                                      className="p-1 hover:bg-zinc-800 text-red-400 hover:text-red-300 rounded transition cursor-pointer"
                                    >
                                      <Trash className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border border-dashed border-zinc-850 hover:border-[#d48743]/50 rounded-lg p-4 text-center cursor-pointer hover:bg-zinc-950/40 transition group relative mb-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageFileChange(e, 'mainProductOverride')}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <Upload className="w-5 h-5 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-1" />
                                    <span className="block text-[11px] font-semibold text-zinc-300 group-hover:text-zinc-200">Escolha uma nova imagem</span>
                                    <span className="block text-[9px] text-zinc-500 mt-0.5">Tamanho recomendado: 1080x1080px.</span>
                                  </div>
                                )}
                                {!editMainImg?.startsWith('data:') && (
                                  <input
                                    type="text"
                                    placeholder="Ou cole o link da imagem (URL) se preferir..."
                                    value={editMainImg}
                                    onChange={(e) => setEditMainImg(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-[#d48743] text-zinc-300 font-mono"
                                  />
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Selo / Badge</label>
                                  <input
                                    type="text"
                                    value={editMainBadge}
                                    onChange={(e) => setEditMainBadge(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Tag / Categoria</label>
                                  <input
                                    type="text"
                                    value={editMainTag}
                                    onChange={(e) => setEditMainTag(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Consumo Concorrente (L/h) *</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={editMainCompetitorLiters}
                                    onChange={(e) => setEditMainCompetitorLiters(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Consumo AgroPasi (L/h) *</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={editMainOurLiters}
                                    onChange={(e) => setEditMainOurLiters(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 font-mono"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Descrição Comercial *</label>
                                <textarea
                                  rows={4}
                                  required
                                  value={editMainDesc}
                                  onChange={(e) => setEditMainDesc(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 leading-relaxed"
                                />
                              </div>

                              {/* SEÇÃO DINÂMICA DE ESPECIFICAÇÕES TÉCNICAS */}
                              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3.5 mt-2">
                                <h4 className="text-xs font-bold text-[#d48743] uppercase tracking-wider">Ficha Técnica Oficial</h4>
                                
                                {editingMainId === 'varrefort-s' && (
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Largura (Aberto)</label>
                                      <input type="text" value={editSpecsLarguraAberto} onChange={(e) => setEditSpecsLarguraAberto(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Largura (Fechado)</label>
                                      <input type="text" value={editSpecsLarguraFechado} onChange={(e) => setEditSpecsLarguraFechado(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Comprimento</label>
                                      <input type="text" value={editSpecsComprimento} onChange={(e) => setEditSpecsComprimento(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Altura Total</label>
                                      <input type="text" value={editSpecsAlturaTotal} onChange={(e) => setEditSpecsAlturaTotal(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Peso Líquido</label>
                                      <input type="text" value={editSpecsPesoLiquido} onChange={(e) => setEditSpecsPesoLiquido(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Potência Mínima</label>
                                      <input type="text" value={editSpecsPotenciaMinima} onChange={(e) => setEditSpecsPotenciaMinima(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Vazão Hidráulica</label>
                                      <input type="text" value={editSpecsVazaoHidraulica} onChange={(e) => setEditSpecsVazaoHidraulica(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Rotação TDP</label>
                                      <input type="text" value={editSpecsRotacaoTdp} onChange={(e) => setEditSpecsRotacaoTdp(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Acoplamento</label>
                                      <input type="text" value={editSpecsAcoplamento} onChange={(e) => setEditSpecsAcoplamento(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                  </div>
                                )}

                                {editingMainId === 'varremax-x' && (
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Capacidade de Carga</label>
                                      <input type="text" value={editSpecsCapacidadeCarga} onChange={(e) => setEditSpecsCapacidadeCarga(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Rendimento Estimado</label>
                                      <input type="text" value={editSpecsRendimentoEstimado} onChange={(e) => setEditSpecsRendimentoEstimado(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Largura de Trabalho</label>
                                      <input type="text" value={editSpecsLarguraAberto} onChange={(e) => setEditSpecsLarguraAberto(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Potência Mínima</label>
                                      <input type="text" value={editSpecsPotenciaMinima} onChange={(e) => setEditSpecsPotenciaMinima(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Sistema Separador de Impurezas</label>
                                      <input type="text" value={editSpecsSistemaSeparador} onChange={(e) => setEditSpecsSistemaSeparador(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* BENEFÍCIOS DO EQUIPAMENTO */}
                              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3 mt-2">
                                <h4 className="text-xs font-bold text-[#d48743] uppercase tracking-wider">Benefícios & Diferenciais</h4>
                                
                                <div className="space-y-3 text-xs">
                                  <div className="p-2.5 bg-zinc-900 rounded border border-zinc-800 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-400 font-mono">Benefício 1</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <input type="text" placeholder="Título Curto" value={editBenefit1Title} onChange={(e) => setEditBenefit1Title(e.target.value)} className="sm:col-span-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                      <input type="text" placeholder="Descrição do benefício" value={editBenefit1Desc} onChange={(e) => setEditBenefit1Desc(e.target.value)} className="sm:col-span-2 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                    </div>
                                  </div>

                                  <div className="p-2.5 bg-zinc-900 rounded border border-zinc-800 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-400 font-mono">Benefício 2</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <input type="text" placeholder="Título Curto" value={editBenefit2Title} onChange={(e) => setEditBenefit2Title(e.target.value)} className="sm:col-span-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                      <input type="text" placeholder="Descrição do benefício" value={editBenefit2Desc} onChange={(e) => setEditBenefit2Desc(e.target.value)} className="sm:col-span-2 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                    </div>
                                  </div>

                                  <div className="p-2.5 bg-zinc-900 rounded border border-zinc-800 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-400 font-mono">Benefício 3</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <input type="text" placeholder="Título Curto" value={editBenefit3Title} onChange={(e) => setEditBenefit3Title(e.target.value)} className="sm:col-span-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                      <input type="text" placeholder="Descrição do benefício" value={editBenefit3Desc} onChange={(e) => setEditBenefit3Desc(e.target.value)} className="sm:col-span-2 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                    </div>
                                  </div>

                                  <div className="p-2.5 bg-zinc-900 rounded border border-zinc-800 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-400 font-mono">Benefício 4</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <input type="text" placeholder="Título Curto" value={editBenefit4Title} onChange={(e) => setEditBenefit4Title(e.target.value)} className="sm:col-span-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                      <input type="text" placeholder="Descrição do benefício" value={editBenefit4Desc} onChange={(e) => setEditBenefit4Desc(e.target.value)} className="sm:col-span-2 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <button
                                  type="submit"
                                  className="w-full bg-[#d48743] hover:bg-[#c27a41] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition"
                                >
                                  Salvar Alterações do Destaque
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetMainProductOverride(editingMainId, editMainTitle)}
                                  className="w-full bg-zinc-950 hover:bg-red-950/25 text-red-400 hover:text-red-300 font-semibold text-xs py-2 rounded-lg border border-red-900/30 transition uppercase tracking-wider"
                                >
                                  Restaurar Padrão de Fábrica original
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d48743] flex items-center mb-4">
                              <Plus className="w-4 h-4 mr-2" /> Adicionar Equipamento Customizado
                            </h3>

                            <form onSubmit={handleAddProduct} className="space-y-3.5">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Título do Produto *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ex: Pulverizador AP-400"
                                  value={newProdTitle}
                                  onChange={(e) => setNewProdTitle(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Imagem do Produto *</label>
                                
                                {newProdImg ? (
                                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2.5 flex items-center space-x-3 mb-2">
                                    <img 
                                      src={newProdImg} 
                                      alt="Preview" 
                                      className="w-12 h-12 object-cover rounded-md border border-zinc-800" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-mono text-zinc-400 truncate">
                                        {newProdImg.startsWith('data:') ? 'Arquivo de Imagem Carregado' : newProdImg}
                                      </p>
                                      <span className="text-[9px] text-[#d48743] font-semibold block leading-none">Pronto para publicar</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setNewProdImg('')}
                                      className="p-1 hover:bg-zinc-800 text-red-400 hover:text-red-300 rounded transition cursor-pointer"
                                      title="Remover imagem"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border border-dashed border-zinc-850 hover:border-[#d48743]/50 rounded-lg p-4 text-center cursor-pointer hover:bg-zinc-950/40 transition group relative mb-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageFileChange(e, 'product')}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <Upload className="w-5 h-5 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-1" />
                                    <span className="block text-[11px] font-semibold text-zinc-300 group-hover:text-zinc-200">Escolha uma imagem ou arraste aqui</span>
                                    <span className="block text-[9px] text-zinc-550 mt-0.5">Tamanho recomendado: 1080x1080px (Quadrado).</span>
                                  </div>
                                )}

                                 {!newProdImg?.startsWith('data:') && (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="Ou cole o link da imagem (URL) se preferir..."
                                      value={newProdImg}
                                      onChange={(e) => setNewProdImg(e.target.value)}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-[#d48743] text-zinc-300 font-mono"
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Selo / Etiqueta Comercial</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Oferta Limitada, Lançamento, etc."
                                  value={newProdBadge}
                                  onChange={(e) => setNewProdBadge(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Especificações Rápidas (Separadas por vírgula)</label>
                                <input
                                  type="text"
                                  placeholder="Ex: TDP: 540 rpm, Peso: 230kg, Aço SAE 1020"
                                  value={newProdSpecs}
                                  onChange={(e) => setNewProdSpecs(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Descrição Detalhada do Implemento *</label>
                                <textarea
                                  rows={3}
                                  required
                                  placeholder="Diga qual a função operacional desse equipamento agrícola e como ele auxilia no cafezal..."
                                  value={newProdDesc}
                                  onChange={(e) => setNewProdDesc(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 leading-relaxed"
                                />
                              </div>

                              <button
                                type="submit"
                                className="w-full bg-[#d48743] hover:bg-[#c27a41] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition"
                              >
                                Publicar Equipamento no Portfolio
                              </button>
                            </form>
                          </div>
                        )}
                      </div>

                      {/* Right side: Manage lists */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* Highlights (Main 3 products) */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                          <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Destaques Principais da AgroPasi (Editáveis)</h3>
                            <span className="text-[9px] bg-[#d48743] text-white px-2 py-0.5 rounded font-bold font-mono">Modo Fábrica</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {DEFAULT_MAIN_PRODS.map(defaultProd => {
                              const isOverridden = !!mainOverrides[defaultProd.id];
                              const currentProd = {
                                ...defaultProd,
                                ...(mainOverrides[defaultProd.id] || {})
                              };

                              return (
                                <div key={defaultProd.id} className="bg-zinc-950 rounded-xl p-3 border border-zinc-850 flex flex-col justify-between space-y-2.5">
                                  <div className="space-y-1.5">
                                    <div className="w-full h-20 rounded overflow-hidden bg-zinc-900 relative">
                                      <img src={currentProd.image} alt={currentProd.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      {isOverridden && (
                                        <span className="absolute top-1 right-1 bg-[#d48743] text-white font-bold font-mono text-[8px] uppercase px-1.5 py-0.5 rounded shadow">
                                          Editado
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-zinc-200 text-xs line-clamp-1">{currentProd.name}</h4>
                                    <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2">{currentProd.description}</p>
                                  </div>

                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => startEditingMainProduct(defaultProd.id, defaultProd)}
                                      className="flex-1 text-center bg-[#d48743] hover:bg-[#c27a41] text-white font-bold text-[9px] uppercase py-1.5 rounded border border-[#d48743] transition flex items-center justify-center cursor-pointer"
                                    >
                                      <Edit3 className="w-3 h-3 mr-1" />
                                      <span>Editar</span>
                                    </button>
                                    {isOverridden && (
                                      <button
                                        type="button"
                                        onClick={() => handleResetMainProductOverride(defaultProd.id, defaultProd.name)}
                                        className="bg-red-950/20 hover:bg-red-950/60 text-red-400 p-1.5 rounded border border-red-900/10 transition cursor-pointer"
                                        title="Restaurar padrão"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom published list */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                          <div className="border-b border-zinc-800 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Equipamentos Customizados Adicionais</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {getCustomProductsList().length > 0 ? (
                              getCustomProductsList().map(prod => (
                                <div key={prod.id} className="bg-zinc-950 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-zinc-850">
                                  <div className="space-y-2">
                                    <div className="w-full h-24 rounded overflow-hidden bg-zinc-900">
                                      <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                    <h4 className="font-bold text-zinc-100 text-sm">{prod.title}</h4>
                                    <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2">{prod.description}</p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(prod.id, prod.title)}
                                    className="w-full text-center bg-red-950/20 hover:bg-red-950/60 text-red-400 font-bold text-[10px] uppercase py-1.5 rounded border border-red-900/10 transition flex items-center justify-center space-x-1 cursor-pointer"
                                  >
                                    <Trash className="w-3.5 h-3.5 mr-1" />
                                    <span>Remover do Portfólio</span>
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-2 py-12 text-center text-zinc-500 text-xs">
                                Sem equipamentos adicionais publicados. Use o formulário à esquerda para adicionar novos produtos sob medida!
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 4: CMS Core content manager (EXCLUSIVE TO DONO) */}
              {activeTab === 'cms' && currentRole === 'dono' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-850 pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#d48743]" /> CMS e Gestão de Conteúdo Geral
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Altere qualquer texto, imagem, galeria, dúvidas e representantes na hora sem tocar em códigos.</p>
                    </div>

                    {/* Sub tabs navigation */}
                    <div className="flex flex-wrap gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('geral')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${cmsSubTab === 'geral' ? 'bg-[#d48743] text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Geral (Hero & Sobre)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('gallery')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${cmsSubTab === 'gallery' ? 'bg-[#d48743] text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Galeria (Mídias)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('faq')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${cmsSubTab === 'faq' ? 'bg-[#d48743] text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                      >
                        FAQ (Dúvidas)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('blog')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${cmsSubTab === 'blog' ? 'bg-[#d48743] text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Blog (Artigos)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('reps')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${cmsSubTab === 'reps' ? 'bg-[#d48743] text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Representantes
                      </button>
                    </div>
                  </div>

                  {/* SUBTAB 1: GERAL (HERO, LOGO & SOBRE) */}
                  {cmsSubTab === 'geral' && (
                    <form onSubmit={handleSaveCms} className="space-y-6 max-w-4xl">
                      
                      {/* SECTION 0: LOGO & IDENTIDADE VISUAL DO SITE */}
                      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d48743] flex items-center">
                            <Image className="w-4 h-4 mr-2" /> Logo Oficial & Logotipo do Site
                          </h3>
                          {siteLogoUrl && (
                            <button
                              type="button"
                              onClick={() => handleSaveLogoDirectly('')}
                              className="text-[10px] text-zinc-400 hover:text-amber-400 underline font-semibold flex items-center cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Restaurar Logo Vetorial Padrão
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Altere a logo oficial do site. Ao fazer o upload ou cole a URL da sua imagem de marca, ela será aplicada automaticamente no cabeçalho (Header), no rodapé (Footer) e em todos os locais da aplicação.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          {/* Upload or URL Controls */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">
                                1. Fazer Upload de Arquivo da Logo (PNG, SVG, WEBP, JPG)
                              </label>
                              
                              <div className="border border-dashed border-zinc-800 hover:border-[#d48743]/60 rounded-xl p-3.5 text-center cursor-pointer hover:bg-zinc-950/60 transition group relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileChange(e, 'logo')}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                />
                                <Upload className="w-5 h-5 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-1" />
                                <span className="block text-[11px] font-semibold text-zinc-300 group-hover:text-zinc-100">
                                  Clique ou arraste a nova imagem da logo aqui
                                </span>
                                <span className="block text-[9px] text-zinc-500 mt-0.5">
                                  Recomendado: imagem com fundo transparente (PNG ou SVG)
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                                2. Ou Informe a URL Direta da Logo
                              </label>
                              <input
                                type="text"
                                placeholder="https://exemplo.com/minha-logo-oficial.png"
                                value={siteLogoUrl.startsWith('data:') ? '' : siteLogoUrl}
                                onChange={(e) => setSiteLogoUrl(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                              />
                              {siteLogoUrl.startsWith('data:') && (
                                <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                                  ✓ Imagem carregada via upload local (salva no banco de dados)
                                </span>
                              )}
                            </div>

                            <div className="pt-1">
                              <button
                                type="button"
                                disabled={isSavingLogo}
                                onClick={() => handleSaveLogoDirectly(siteLogoUrl)}
                                className="w-full bg-[#d48743] hover:bg-[#b86f32] text-zinc-950 font-bold py-2.5 px-3 rounded-lg text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                              >
                                {isSavingLogo ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                                    <span>Salvando Logo...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Salvar e Aplicar Logo Oficial no Site</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Live Preview Box */}
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Pré-visualização em Tempo Real da Logo
                            </span>
                            
                            <div className="space-y-2">
                              <div className="p-3 bg-[#11131a] rounded-lg border border-zinc-800/80 flex items-center justify-between">
                                <span className="text-[9px] text-zinc-500 font-mono">Cabeçalho Escuro</span>
                                <AgroPasiLogo size="md" variant="dark-bg" showSubtitle={true} logoUrl={siteLogoUrl} />
                              </div>

                              <div className="p-3 bg-white rounded-lg border border-zinc-300 flex items-center justify-between">
                                <span className="text-[9px] text-zinc-500 font-mono">Fundo Claro</span>
                                <AgroPasiLogo size="md" variant="light-bg" showSubtitle={true} logoUrl={siteLogoUrl} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION A: HERO COPY */}
                      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#d48743] flex items-center border-b border-zinc-850 pb-2">
                          <Layout className="w-4 h-4 mr-2" /> 1. Textos & Fundos do Hero de Entrada (Primeira dobra)
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Título Grande do Hero * (Use barra invertida N (\n) para quebra de cor amarela)</label>
                            <textarea
                              rows={2}
                              required
                              value={heroTitle}
                              onChange={(e) => setHeroTitle(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Etiqueta do Badge superior</label>
                            <input
                              type="text"
                              required
                              value={heroBadge}
                              onChange={(e) => setHeroBadge(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Foto de Fundo do Hero *</label>

                            {heroPhoto ? (
                              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2.5 flex items-center space-x-3 mb-2">
                                <img 
                                  src={heroPhoto} 
                                  alt="Fundo Hero Preview" 
                                  className="w-16 h-10 object-cover rounded border border-zinc-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                                    {heroPhoto.startsWith('data:') ? 'Arquivo de Fundo Carregado' : heroPhoto}
                                  </p>
                                  <span className="text-[9px] text-[#d48743] font-semibold block leading-none">Pronto para salvar</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setHeroPhoto('')}
                                  className="p-1 hover:bg-zinc-800 text-red-500 hover:text-red-400 rounded transition cursor-pointer"
                                  title="Remover imagem"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="border border-dashed border-zinc-850 hover:border-[#d48743]/50 rounded-lg p-3 text-center cursor-pointer hover:bg-zinc-950/40 transition group relative mb-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileChange(e, 'hero')}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <Upload className="w-5 h-5 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-1" />
                                <span className="block text-[11px] font-semibold text-zinc-300 group-hover:text-zinc-200">Escolha uma foto ou arraste aqui</span>
                                <span className="block text-[9px] text-zinc-550 mt-0.5">Dica: fotos horizontais e amplas</span>
                              </div>
                            )}

                            {/* Alternative URL Link option */}
                            {!heroPhoto?.startsWith('data:') && (
                              <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ou cole o link de URL externa da imagem..."
                                    value={heroPhoto}
                                    onChange={(e) => setHeroPhoto(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                                />
                              </div>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 font-sans">Texto de Descrição de Apoio * (Slogan / Sabor industrial)</label>
                            <textarea
                              rows={3}
                              required
                              value={heroDesc}
                              onChange={(e) => setHeroDesc(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION C: ESTRUTURA INDUSTRIAL E RAÍZES */}
                      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#d48743] flex items-center border-b border-zinc-850 pb-2">
                          <Layers className="w-4 h-4 mr-2" /> 3. Seção Estrutura Industrial & Raízes
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Badge de Entrada (Ex: Nossas Raízes)</label>
                            <input
                              type="text"
                              required
                              value={aboutSectionBadge}
                              onChange={(e) => setAboutSectionBadge(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Título da Seção de Raízes *</label>
                            <input
                              type="text"
                              required
                              value={aboutSectionTitle}
                              onChange={(e) => setAboutSectionTitle(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 font-sans">Texto de Introdução (Parágrafo 1) *</label>
                            <textarea
                              rows={2}
                              required
                              value={aboutSectionDesc1}
                              onChange={(e) => setAboutSectionDesc1(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 leading-relaxed"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 font-sans">Texto de Destaque / Engenharia (Parágrafo 2) *</label>
                            <textarea
                              rows={2}
                              required
                              value={aboutSectionDesc2}
                              onChange={(e) => setAboutSectionDesc2(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 leading-relaxed"
                            />
                          </div>

                          {/* Image upload and details */}
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Foto da Estrutura Industrial *</label>

                            {aboutIndustrialPhoto ? (
                              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2.5 flex items-center space-x-3 mb-2">
                                <img 
                                  src={aboutIndustrialPhoto} 
                                  alt="Estrutura Industrial Preview" 
                                  className="w-12 h-10 object-cover rounded border border-zinc-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                                    {aboutIndustrialPhoto.startsWith('data:') ? 'Arquivo Industrial Carregado' : aboutIndustrialPhoto}
                                  </p>
                                  <span className="text-[9px] text-[#d48743] font-semibold block leading-none">Pronto para salvar</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setAboutIndustrialPhoto('')}
                                  className="p-1 hover:bg-zinc-800 text-red-500 hover:text-red-400 rounded transition cursor-pointer"
                                  title="Remover imagem"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="border border-dashed border-zinc-850 hover:border-[#d48743]/50 rounded-lg p-3 text-center cursor-pointer hover:bg-zinc-950/40 transition group relative mb-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileChange(e, 'aboutIndustrial')}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <Upload className="w-5 h-5 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-1" />
                                <span className="block text-[11px] font-semibold text-zinc-300 group-hover:text-zinc-200">Escolha a foto industrial ou arraste</span>
                                <span className="block text-[9px] text-zinc-550 mt-0.5">Formato paisagem recomendado</span>
                              </div>
                            )}

                            {/* Alternative URL Link option */}
                            {!aboutIndustrialPhoto?.startsWith('data:') && (
                              <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ou cole o link de URL externa da foto industrial se preferir..."
                                    value={aboutIndustrialPhoto}
                                    onChange={(e) => setAboutIndustrialPhoto(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-[#d48743] text-zinc-300 font-mono"
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Título do Card de Legenda (Ex: Estrutura Industrial Própria)</label>
                              <input
                                type="text"
                                required
                                value={aboutIndustrialTitle}
                                onChange={(e) => setAboutIndustrialTitle(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Texto do Card de Legenda *</label>
                              <input
                                type="text"
                                required
                                value={aboutIndustrialText}
                                onChange={(e) => setAboutIndustrialText(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Submit Bar */}
                      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-850">
                        <span className="text-xs text-zinc-400 leading-none">Ao salvar, toda a página inicial será atualizada imediatamente.</span>
                        <button
                          type="submit"
                          className="bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-lg transition"
                        >
                          Salvar Textos do Site
                        </button>
                      </div>

                    </form>
                  )}

                  {/* SUBTAB 2: GALLERY (MÍDIAS) */}
                  {cmsSubTab === 'gallery' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
                      {/* Form section */}
                      <form onSubmit={handleAddGalleryItem} className="lg:col-span-1 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 h-fit">
                        <h3 id="gallery-form-title" className="text-sm font-bold text-[#d48743] border-b border-zinc-800 pb-2 flex justify-between items-center">
                          <span>{editingGalId ? 'Editar Item da Galeria' : 'Adicionar Item na Galeria'}</span>
                          {editingGalId && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                              Editando
                            </span>
                          )}
                        </h3>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Título do Conteúdo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Arruador Operando em Varginha"
                            value={newGalTitle}
                            onChange={(e) => setNewGalTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Tipo de Mídia / Seção *</label>
                          <select
                            value={newGalCategory}
                            onChange={(e) => {
                              const cat = e.target.value as any;
                              setNewGalCategory(cat);
                              setNewGalCategoryLabel(cat === 'video' ? 'Vídeo Operacional' : cat === 'factory' ? 'Estrutura Industrial' : 'Fotografia de Campo');
                            }}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          >
                            <option value="photo">Fotografia (Trabalhando em Campo)</option>
                            <option value="video">Vídeo Ativo (Demonstração Prática)</option>
                            <option value="factory">Fábrica (Corte laser, Engenharia, Soldagem)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1 font-sans">Etiqueta Visual de Categoria</label>
                          <input
                            type="text"
                            placeholder="Ex: Demonstração Real"
                            value={newGalCategoryLabel}
                            onChange={(e) => setNewGalCategoryLabel(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Imagem ou Capa da Mídia *</label>
                          
                          {newGalMediaUrl ? (
                            <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2 flex items-center space-x-3 mb-2">
                              <img 
                                src={newGalMediaUrl} 
                                alt="Gallery item" 
                                className="w-12 h-10 object-cover rounded border border-zinc-805"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-zinc-400 truncate">
                                  {newGalMediaUrl.startsWith('data:') ? 'Arquivo de Imagem Carregado' : newGalMediaUrl}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewGalMediaUrl('')}
                                className="p-1 text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-zinc-850 hover:border-[#d48743]/50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-zinc-900 transition group relative mb-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(e, 'gallery')}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <Upload className="w-4 h-4 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-0.5" />
                              <span className="block text-[10px] text-zinc-300">Escolha a foto da galeria</span>
                            </div>
                          )}

                          {!newGalMediaUrl?.startsWith('data:') && (
                            <input
                              type="text"
                              placeholder="Ou cole a URL externa da imagem se preferir..."
                              value={newGalMediaUrl}
                              onChange={(e) => setNewGalMediaUrl(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-[#d48743] text-zinc-300 font-mono"
                            />
                          )}
                        </div>

                        {newGalCategory === 'video' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Duração do Vídeo (MM:SS)</label>
                              <input
                                type="text"
                                placeholder="Filtro de tempo: ex 01:30"
                                value={newGalDuration}
                                onChange={(e) => setNewGalDuration(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Link do Vídeo no YouTube</label>
                              <input
                                type="url"
                                placeholder="Ex: https://www.youtube.com/watch?v=..."
                                value={newGalVideoUrl}
                                onChange={(e) => setNewGalVideoUrl(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 font-mono"
                              />
                              <span className="block text-[9px] text-zinc-550 mt-1">Insira um link do YouTube para substituir o simulador pelo vídeo real.</span>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Localização (Cidade, Estado)</label>
                          <input
                            type="text"
                            placeholder="Ex: Alfenas - MG"
                            value={newGalLocation}
                            onChange={(e) => setNewGalLocation(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Resumo Descritivo *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Breve comentário do que é visto nessa mídia."
                            value={newGalDescription}
                            onChange={(e) => setNewGalDescription(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div className="flex space-x-2">
                          {editingGalId && (
                            <button
                              type="button"
                              onClick={handleCancelEditGalleryItem}
                              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            type="submit"
                            className="flex-1 bg-[#d48743] hover:bg-[#c27a41] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                          >
                            {editingGalId ? 'Salvar Alterações' : 'Publicar na Galeria'}
                          </button>
                        </div>
                      </form>

                      {/* Display grid lists */}
                      <div className="lg:col-span-2 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                        <h3 className="text-sm font-bold text-white flex justify-between items-center pb-2 border-b border-zinc-800">
                          <span>Mídias Ativas no Site</span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-850">
                            {galleryList.length} itens publicados
                          </span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                          {galleryList.map((item) => (
                            <div key={item.id} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-855 flex flex-col justify-between space-y-2">
                              <div>
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-850 bg-zinc-900">
                                  <img 
                                    src={item.mediaUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="absolute top-2 left-2 text-[8px] bg-emerald-500 text-zinc-950 font-black tracking-widest uppercase px-2 py-0.5 rounded-full select-none">
                                    {item.categoryLabel}
                                  </span>
                                  {item.duration && (
                                    <span className="absolute bottom-2 right-2 text-[8px] bg-zinc-950/80 text-[#d48743] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full">
                                      {item.duration}
                                    </span>
                                  )}
                                  {item.videoUrl && (
                                    <span className="absolute bottom-2 left-2 text-[8px] bg-red-600/95 text-white font-mono font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">
                                      YouTube
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-white mt-2 leading-snug">{item.title}</h4>
                                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-snug">{item.description}</p>
                              </div>

                              <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[9px] text-zinc-500 font-mono">
                                <span>{item.location || 'Fábrica'}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditGalleryItem(item)}
                                    className="text-amber-400 hover:text-amber-350 flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryItem(item.id)}
                                    className="text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                    <span>Deletar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: FAQ */}
                  {cmsSubTab === 'faq' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                      {/* Form block */}
                      <form onSubmit={handleAddFaq} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-850 space-y-4 h-fit">
                        <h3 className="text-sm font-bold text-emerald-400 border-b border-zinc-800 pb-2">
                          Adicionar Tópico na Seção de FAQ
                        </h3>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Categoria da Dúvida *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Performance, Mecânica, Garantia"
                            value={newFaqCategory}
                            onChange={(e) => setNewFaqCategory(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Seu Tópico de Pergunta *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: O arruador serve para café arábica e conilon?"
                            value={newFaqQuestion}
                            onChange={(e) => setNewFaqQuestion(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#f7b733] mb-1">Resposta Oficial Detalhada *</label>
                          <textarea
                            rows={5}
                            required
                            placeholder="Escreva uma resposta explicativa clara do ponto de vista mecânico-comercial."
                            value={newFaqAnswer}
                            onChange={(e) => setNewFaqAnswer(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 leading-relaxed font-sans"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#d48743] hover:bg-[#c27a41] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                        >
                          Publicar Pergunta
                        </button>
                      </form>

                      {/* List block */}
                      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-850 space-y-4">
                        <h3 className="text-sm font-bold text-white flex justify-between items-center pb-2 border-b border-zinc-850">
                          <span>Dúvidas Frequentes Publicadas</span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                            {faqsList.length} tópicos
                          </span>
                        </h3>

                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                          {faqsList.map((faq) => (
                            <div key={faq.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1.5 relative group">
                              <button
                                type="button"
                                onClick={() => handleRemoveFaq(faq.id)}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition cursor-pointer p-1 rounded hover:bg-zinc-900"
                                title="Deletar FAQ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <span className="text-[9px] bg-zinc-900 text-[#d48743] font-mono tracking-widest uppercase py-0.5 px-2 rounded border border-zinc-800">
                                {faq.category}
                              </span>
                              <h4 className="text-xs font-bold text-white leading-normal pr-7">{faq.question}</h4>
                              <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-1">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: BLOG (ARTIGOS) */}
                  {cmsSubTab === 'blog' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
                      {/* Form section */}
                      <form onSubmit={handleAddBlogPost} className="lg:col-span-1 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 h-fit">
                        <h3 className="text-sm font-bold text-[#d48743] border-b border-zinc-800 pb-2">
                          Criar Novo Artigo para o Blog
                        </h3>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Título do Artigo / Notícia *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 5 erros comuns na colheita direta"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Seção / Categoria *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Dicas de Regulagem, Economia"
                            value={newPostCategory}
                            onChange={(e) => setNewPostCategory(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Tempo Estimado de Leitura</label>
                          <input
                            type="text"
                            required
                            value={newPostReadTime}
                            onChange={(e) => setNewPostReadTime(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Foto de Destaque da Capa</label>
                          
                          {newPostImage ? (
                            <div className="relative rounded-lg overflow-hidden border border-zinc-805 bg-zinc-950 p-2 flex items-center space-x-3 mb-2">
                              <img 
                                src={newPostImage} 
                                alt="Blog Post Cover" 
                                className="w-12 h-10 object-cover rounded border border-zinc-850"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-zinc-400 truncate">
                                  {newPostImage.startsWith('data:') ? 'Arquivo de Capa Carregado' : newPostImage}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewPostImage('')}
                                className="p-1 text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-zinc-850 hover:border-[#d48743]/50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-zinc-900 transition group relative mb-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(e, 'blog')}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <Upload className="w-4 h-4 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-0.5" />
                              <span className="block text-[10px] text-zinc-300">Escolha a capa do artigo</span>
                            </div>
                          )}

                          {!newPostImage?.startsWith('data:') && (
                            <input
                              type="text"
                              placeholder="Ou cole a URL externa da imagem..."
                              value={newPostImage}
                              onChange={(e) => setNewPostImage(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-[#d48743] text-zinc-300 font-mono"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1 font-sans">Introdução Excerpt (Breve resumo da home) *</label>
                          <textarea
                            rows={3}
                            placeholder="Ex: Aprenda de forma mecânica a evitar amasso de grãos no asfalto rústico."
                            value={newPostExcerpt}
                            onChange={(e) => setNewPostExcerpt(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#f7b733] mb-1">
                            Corpo Inteiro do Artigo (Markdown/Tags Habilitados) *
                          </label>
                          
                          {/* Editor Helper Toolbar */}
                          <div className="bg-zinc-950 border border-zinc-850 rounded-t-lg p-2 flex flex-wrap gap-1 border-b-0">
                            <button
                              type="button"
                              onClick={() => insertFormatTag('**negrito**')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded border border-zinc-800 transition cursor-pointer"
                              title="Inserir Texto em Negrito"
                            >
                              Negrito (**)
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatTag('### Subtítulo\n')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded border border-zinc-800 transition cursor-pointer"
                              title="Inserir Subtítulo de Seção"
                            >
                              Subtítulo (###)
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatTag('[color red | texto colorido]')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-red-400 rounded border border-zinc-800 transition cursor-pointer"
                              title="Texto com Cor Vermelha"
                            >
                              Vermelho
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatTag('[color orange | texto colorido]')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-orange-400 rounded border border-zinc-800 transition cursor-pointer"
                              title="Texto com Cor Laranja"
                            >
                              Laranja
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatTag('[mark pink | texto marcado]')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-pink-300 rounded border border-zinc-800 transition cursor-pointer"
                              title="Marcação de Texto Rosa (Highlight)"
                            >
                              Marcação Rosa
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatTag('[mark yellow | texto marcado]')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-yellow-200 rounded border border-zinc-800 transition cursor-pointer"
                              title="Marcação de Texto Amarela (Highlight)"
                            >
                              Marcação Amarela
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatTag('[img https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600 | Descrição detalhada da imagem]')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-emerald-400 rounded border border-zinc-800 transition cursor-pointer"
                              title="Inserir Imagem Meio da Notícia com Legenda"
                            >
                              + Imagem Meio
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatTag('[fonte: G1 / Agro | https://g1.globo.com/economia/tecnologia-agricola]')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-sky-400 rounded border border-zinc-800 transition cursor-pointer"
                              title="Inserir Link da Fonte"
                            >
                              + Fonte Link
                            </button>
                          </div>

                          <textarea
                            id="cms-blog-content-textarea"
                            rows={8}
                            required
                            placeholder="Escreva seu artigo completo aqui. Use os botões da barra de ferramentas acima para adicionar textos coloridos, destaques e imagens no meio da notícia!"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-b-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 leading-relaxed"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#d48743] hover:bg-[#c27a41] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                        >
                          Publicar no Blog
                        </button>
                      </form>

                      {/* Display lists */}
                      <div className="lg:col-span-2 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                        <h3 className="text-sm font-bold text-white flex justify-between items-center pb-2 border-b border-zinc-800">
                          <span>Artigos Publicados no Field</span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-850">
                            {blogList.length} posts
                          </span>
                        </h3>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {blogList.map((post) => (
                            <div key={post.id} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 flex items-start space-x-4 relative group">
                              <img 
                                src={post.imageUrl} 
                                alt={post.title} 
                                className="w-16 h-16 object-cover rounded-lg border border-zinc-800"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0 pr-7">
                                <span className="text-[8px] bg-zinc-900 text-[#d48743] font-mono tracking-widest uppercase py-0.5 px-2 rounded border border-zinc-850">
                                  {post.category}
                                </span>
                                <h4 className="text-xs font-bold text-white leading-snug mt-1">{post.title}</h4>
                                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">{post.excerpt}</p>
                                <span className="text-[9px] text-zinc-500 font-mono block mt-1">{post.date} &bull; {post.readTime}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveBlogPost(post.id)}
                                className="absolute top-3.5 right-3.5 text-red-500 hover:text-red-400 p-1.5 hover:bg-zinc-900 rounded transition cursor-pointer"
                                title="Deletar Post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 5: REPRESENTANTES */}
                  {cmsSubTab === 'reps' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
                      {/* Register/Edit form */}
                      <form onSubmit={handleAddRepresentative} className="lg:col-span-1 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 h-fit">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <h3 className="text-sm font-bold text-[#d48743] flex items-center gap-1.5">
                            {editingRepId ? <Edit3 className="w-4 h-4" /> : null}
                            <span>{editingRepId ? 'Editar Representante' : 'Cadastrar Novo Representante'}</span>
                          </h3>
                          {editingRepId && (
                            <button
                              type="button"
                              onClick={handleCancelEditRepresentative}
                              className="text-[10px] text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded transition"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>

                        {editingRepId && (
                          <div className="bg-[#d48743]/10 border border-[#d48743]/30 p-2.5 rounded-lg text-xs text-zinc-300 flex items-center justify-between">
                            <span>Modo de edição ativo</span>
                            <span className="text-[10px] text-[#d48743] font-mono font-bold">ID: {editingRepId}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Nome Completo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: João Roberto"
                            value={newRepName}
                            onChange={(e) => setNewRepName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-455 mb-1">Região de Atuação * (Texto descritivo)</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Sudoeste de SP & Norte do PR"
                            value={newRepRegion}
                            onChange={(e) => setNewRepRegion(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-202"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">WhatsApp de Contato (Com DDD) *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 17991066796"
                            value={newRepPhone}
                            onChange={(e) => setNewRepPhone(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-855 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Email Profissional</label>
                          <input
                            type="email"
                            placeholder="Ex: joao.r@agropasi.com.br"
                            value={newRepEmail}
                            onChange={(e) => setNewRepEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-855 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-250"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#f7b733] mb-1">
                            Prefixos CEP Exclusivos (Separados por vírgula)
                          </label>
                          <p className="text-[10px] text-zinc-500 mb-1.5 leading-snug">
                            Insira os 2 primeiros dígitos do CEP atendido por este representante.
                          </p>
                          <input
                            type="text"
                            placeholder="Ex: 14, 15, 16, 37"
                            value={newRepCeps}
                            onChange={(e) => setNewRepCeps(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#d48743] text-zinc-200 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-450 mb-1">Foto do Representante</label>
                          
                          {newRepAvatar ? (
                            <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2 flex items-center space-x-3 mb-2">
                              <img 
                                src={newRepAvatar} 
                                alt="Rep Avatar" 
                                className="w-10 h-10 object-cover rounded-full border border-zinc-850"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-zinc-400 truncate">
                                  {newRepAvatar.startsWith('data:') ? 'Arquivo de Foto Carregado' : newRepAvatar}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewRepAvatar('')}
                                className="p-1 text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-zinc-850 hover:border-[#d48743]/50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-zinc-900 transition group relative mb-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(e, 'rep')}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <Upload className="w-4 h-4 mx-auto text-zinc-500 group-hover:text-[#d48743] transition mb-0.5" />
                              <span className="block text-[10px] text-zinc-300">Escolha foto profissional</span>
                            </div>
                          )}

                          {!newRepAvatar?.startsWith('data:') && (
                            <input
                              type="text"
                              placeholder="Ou cole a URL externa da imagem..."
                              value={newRepAvatar}
                              onChange={(e) => setNewRepAvatar(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-[#d48743] text-zinc-300 font-mono"
                            />
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-[#d48743] hover:bg-[#c27a41] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                          >
                            {editingRepId ? 'Salvar Alterações' : 'Cadastrar Representante'}
                          </button>
                          {editingRepId && (
                            <button
                              type="button"
                              onClick={handleCancelEditRepresentative}
                              className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </form>

                      {/* Rep List display */}
                      <div className="lg:col-span-2 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
                        <h3 className="text-sm font-bold text-white flex justify-between items-center pb-2 border-b border-zinc-800">
                          <span>Equipe Comercial Ativa</span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-855">
                            {repsList.length} cadastrados
                          </span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                          {repsList.map((rep) => (
                            <div key={rep.id} className={`p-3.5 rounded-xl border transition flex flex-col justify-between space-y-3 ${editingRepId === rep.id ? 'bg-[#d48743]/10 border-[#d48743]' : 'bg-zinc-950 border-zinc-850'}`}>
                              <div className="flex items-start space-x-3">
                                <img 
                                  src={rep.avatarUrl} 
                                  alt={rep.name} 
                                  className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-white leading-snug truncate">{rep.name}</h4>
                                  <p className="text-[10px] text-[#d48743] font-medium leading-none mt-0.5">{rep.region}</p>
                                  <p className="text-[9px] text-zinc-400 font-mono mt-1">Nº: +{rep.phone}</p>
                                </div>
                              </div>

                              <div className="border-t border-zinc-900 pt-2 flex flex-col space-y-1.5 text-[9px] font-mono">
                                <div className="flex flex-wrap gap-1">
                                  {rep.coverCeps && rep.coverCeps.length > 0 ? (
                                    rep.coverCeps.map((cep: string) => (
                                      <span key={cep} className="bg-zinc-900 text-zinc-400 px-1 py-0.5 rounded text-[8px] border border-zinc-800">
                                        CEP {cep}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-zinc-550 leading-none italic">
                                      Recebe de todo o Brasil se nenhum outro CEP coincidir
                                    </span>
                                  )}
                                </div>

                                <div className="flex justify-between items-center text-[9px] text-zinc-400 pt-1.5 border-t border-zinc-900/60">
                                  <span className="truncate max-w-[130px]">{rep.email}</span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditRepresentative(rep)}
                                      className="text-[#d48743] hover:text-[#e89b57] flex items-center space-x-0.5 px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-850 rounded border border-zinc-800 transition cursor-pointer"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Editar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRepresentative(rep.id, rep.name)}
                                      className="text-red-400 hover:text-red-300 flex items-center space-x-0.5 px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-850 rounded border border-zinc-800 transition cursor-pointer"
                                    >
                                      <Trash className="w-3 h-3" />
                                      <span>Remover</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: Security Audit Logs (EXCLUSIVE TO DONO) */}
              {activeTab === 'logs' && currentRole === 'dono' && (
                <div className="space-y-6 flex-grow flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" />
                        Registro de Auditoria e Segurança (LGPD / LGPD Compliance)
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Histórico completo e imutável de eventos administrativos e tentativas de acesso aos sistemas da AgroPasi.
                      </p>
                    </div>
                    <button
                      onClick={loadSecurityLogs}
                      type="button"
                      className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-xs font-bold uppercase tracking-wider text-[#d48743] border border-zinc-800 flex items-center shrink-0 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Atualizar Logs
                    </button>
                  </div>

                  <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-900/60 backdrop-blur-sm flex-grow overflow-x-auto min-h-[350px]">
                    {securityLogs.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-900 text-[10px] uppercase text-zinc-400 font-bold tracking-wider border-b border-zinc-800">
                            <th className="py-3 px-4">Data / Hora</th>
                            <th className="py-3 px-4">Usuário / ID</th>
                            <th className="py-3 px-4">Evento / Ação</th>
                            <th className="py-3 px-4">IP</th>
                            <th className="py-3 px-4">Nível</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-xs">
                          {securityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-950/40 transition">
                              <td className="py-3.5 px-4 font-mono text-zinc-400">{log.timestamp}</td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-zinc-300">{log.userEmail}</span>
                                <span className="block text-[10px] text-zinc-500 font-mono">Role: {log.role}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-zinc-200 block font-medium">{log.action}</span>
                                <span className="block text-[10px] text-zinc-500 max-w-sm whitespace-normal leading-relaxed">{log.details}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-zinc-500">{log.ipAddress}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                  log.level === 'WARN' ? 'bg-[#d48743]/20 text-[#d48743] border border-[#d48743]/20' :
                                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                }`}>
                                  {log.level}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-20 text-center text-zinc-500">
                        <ShieldAlert className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs">Nenhum evento registrado no diário de auditoria ainda.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </main>
          </div>
        </>
      )}

    </div>
  );
}

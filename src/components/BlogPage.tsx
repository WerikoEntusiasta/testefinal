import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight, BookOpen, User, ThumbsUp, X, Search, BookmarkCheck, Share2 } from 'lucide-react';
import { BlogPost } from '../types';
import RichTextRenderer from './RichTextRenderer';

interface BlogPageProps {
  onBackToHome: () => void;
}

const INITIAL_POSTS: BlogPost[] = [
  {
    id: 'p_1',
    title: 'Como regular o arruador de café para evitar perdas no chão',
    category: 'Regulagem de Máquinas',
    excerpt: 'Ajustar a altura das cerdas dianteiras e regular a pressão hidráulica das sapatas deslizes previne danos mecânicos na lavoura e maximiza o recolhimento de grãos.',
    content: `## 1. Alinhamento e Paralelismo do Implemento
A regulagem perfeita inicia verificando o [mark verde | paralelismo do implemento agrícola] em relação ao solo da fileira. O operador deve ajustar o comprimento do terceiro ponto de forma que o arruador trabalhe perfeitamente plano.

- **Se inclinado para a frente**: as cerdas dianteiras cavarão terra úmida desnecessariamente, gerando [color vermelho | desgaste acelerado das peças por atrito] e criando torrões que prejudicam a colheita.
- **Se inclinado para trás**: ocorrerá a indesejada [color laranja | perda de grãos], deixando o café de vagem caídos sob as folhas secas.

## 2. Ajuste Fino das Cerdas Dianteiras
A altura ideal das cerdas em relação ao chão deve ser de [mark amarelo | 1 a 2 centímetros] de folga. Isso garante o recolhimento por fluxo de ar sem arrastar impurezas minerais para o interior do sistema.

### Recomendações dos Técnicos AgroPasi:
- Verifique a pressão das sapatas deslizantes.
- Trabalhe sempre na rotação otimizada do motor.
- Limpe as grades de ventilação a cada parada de turno.

[img https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800 | Operador realizando a medição e regulagem das cerdas no cafezal]

### Conclusão e Resultados
Seguindo este protocolo desenvolvido pela nossa equipe de campo, produtores parceiros registraram uma [color verde | redução de até 98% de perdas no chão], maximizando o aproveitamento de cada saca de café de qualidade.`,
    date: '02 Jun 2026',
    readTime: '4 min leitura',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p_2',
    title: 'Manutenção preventiva pós-colheita: lubrificando metais sob alta tensão',
    category: 'Manutenção de Implementos',
    excerpt: 'Evite prejuízos na safra seguinte. Saiba como realizar o check-up dos rolamentos, engrenagens helicoidais e aplicação de graxa anticorrosiva pós colheitas.',
    content: `## 1. Diagnóstico e Limpeza Inicial Crítica
O acúmulo de palha úmida, poeira de terra vermelha e resíduos ácidos da polpa de café verde agride as ligas ferrosas das colhedoras de café e sopradores. Ao final de cada ciclo de colheita, é indispensável efetuar uma lavagem sob pressão média com [mark verde | desengraxante biodegradável neutro].

- **Atenção**: Nunca use jatos de água de altíssima pressão diretamente sobre os retentores dos rolamentos para evitar a entrada de água nas pistas de rolagem.
- **Remoção**: Elimine todas as incrustações de matéria orgânica ácida antes da secagem.

## 2. Lubrificação por Injeção de Alta Eficiência
Em seguida, as articulações mecânicas e o [mark amarelo | eixo transmissor cardan principal] devem ser completamente lubrificados por injeção direta de graxa à base de lítio.

### Etapas da Lubrificação Correta:
- Injete lubrificante até que a graxa antiga de cor escura seja totalmente expulsa dos pivôs.
- Gire manualmente os eixos para distribuir o filme lubrificante de forma uniforme.
- Utilize graxa com [color laranja | aditivos extrema pressão (EP)] para suportar os altos torques de partida.

[img https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800 | Aplicação técnica de graxa em engrenagens de transmissão]

## 3. Armazenamento Seguro Pré-Safra
Antes de guardar o maquinário no galpão para a entressafra, aplique uma fina camada de óleo protetivo anticorrosivo em todas as partes metálicas expostas. Isso protege o lote contra a [color vermelho | umidade e oxidação invernal].`,
    date: '28 Mai 2026',
    readTime: '6 min leitura',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_3',
    title: 'Por que o menor RPM de operação economiza diesel no trator?',
    category: 'Cafeicultura Moderna',
    excerpt: 'Descubra a física mecânica por trás das engrenagens multiplicadoras de torque da AgroPasi e como elas poupam combustível com rotação de motor suave.',
    content: `## 1. O Mito da Alta Rotação no Cafezal
Muitos produtores rurais acreditam que para obter ventilação e enleiramento fortes na colheita de café, o motor do trator precisa estar operando no limite máximo do sobregiro (1.900 a 2.100 RPM). No entanto, o motor consome diesel de forma [color vermelho | exponencialmente maior] para manter essa velocidade sem necessidade real de torque bruto.

## 2. Multiplicação de Torque com Engenharia AgroPasi
Através de um jogo especial de [mark verde | engrenagens de eixos multiplicadores] projetadas e usinadas em nossa fábrica, o rotor ventilador interno gira em altíssima velocidade mesmo com o motor operando na confortável faixa de economia de [mark amarelo | 1.350 RPM].

### Comparativo de Desempenho e Consumo:
- **Operação Tradicional**: 2.000 RPM de motor = Consumo médio de 9.5 Litros/hora de diesel.
- **Tecnologia AgroPasi**: 1.350 RPM de motor = Consumo médio de [color verde | 5.8 Litros/hora] com a mesma eficiência de vento.

[img https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800 | Trator operando em rotação otimizada de economia de combustível no cafezal]

### Benefícios Diretos no Bolso do Cafeicultor
A redução da rotação de trabalho não só poupa combustível, mas também [color verde | prolonga a vida útil do motor do trator] em até 35% e reduz a fadiga sonora do operador. Menos desgaste de componentes significa mais lucro na ponta do lápis por saca produzida.`,
    date: '15 Mai 2026',
    readTime: '5 min leitura',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400'
  }
];

export default function BlogPage({ onBackToHome }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  const loadPosts = () => {
    const stored = localStorage.getItem('agropasi_cms_blog_posts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPosts(parsed);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setPosts(INITIAL_POSTS);
  };

  useEffect(() => {
    loadPosts();
    window.addEventListener('storage_updated', loadPosts);
    return () => window.removeEventListener('storage_updated', loadPosts);
  }, []);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedPosts[id];
    setLikedPosts(prev => ({
      ...prev,
      [id]: !isLiked
    }));
    setLikes(prev => ({
      ...prev,
      [id]: (prev[id] || (12 + (parseInt(id.split('_')[1] || '0') * 5))) + (isLiked ? -1 : 1)
    }));
  };

  // Extract all categories dynamically
  const categories = ['todas', ...Array.from(new Set(posts.map(post => post.category)))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-zinc-950 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-900 mb-10">
          <div className="space-y-2">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-[#d48743] transition mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar ao Início
            </button>
            <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
              Dicas de Campo & <span className="text-[#d48743]">Sabedoria Prática</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Conselhos de engenharia de safra, manutenção de motopeças e regulagem de arruadores sopradores para otimizar sua produção e aumentar a lucratividade por saca.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start md:self-end">
            <span className="text-[11px] font-mono font-bold text-white bg-[#d48743] px-3.5 py-2 rounded-xl border border-[#d48743] uppercase tracking-wider">
              Escrito por Engenheiros
            </span>
          </div>
        </div>

        {/* Searching & Categories filter row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Search bar */}
          <div className="lg:col-span-4 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar artigos técnicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-150 placeholder-zinc-500 focus:outline-none focus:border-[#d48743] transition font-mono"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider mr-2 hidden sm:inline-block">Categorias:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition uppercase ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-600/10'
                    : 'bg-zinc-900/50 hover:bg-zinc-850 text-zinc-400 border border-zinc-850 hover:text-zinc-150'
                }`}
              >
                {cat === 'todas' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-850 rounded-3xl space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
              <BookOpen className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-200">Nenhum artigo encontrado</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Nossos consultores ainda não escreveram um artigo com esses termos. Experimente limpar os filtros.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('todas');
              }}
              className="text-xs font-bold text-[#d48743] hover:underline"
            >
              Exibir todos os artigos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-zinc-900/40 border border-zinc-850 rounded-2xl overflow-hidden hover:border-[#d48743] hover:shadow-lg transition duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Photo representation */}
                  <div className="relative h-48 overflow-hidden bg-zinc-950">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600';
                      }}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-zinc-950/90 text-emerald-400 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                  </div>

                  {/* Body content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center space-x-3 text-zinc-500 text-xs font-medium font-sans">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {post.date}
                      </span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-[#d48743] transition line-clamp-2 font-sans tracking-tight leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 font-sans">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer read actions */}
                <div className="p-6 border-t border-zinc-900 flex items-center justify-between gap-3 bg-zinc-950/40">
                  <span className="text-xs text-[#d48743] font-bold uppercase tracking-wider flex items-center group-hover:text-amber-400 transition">
                    Ler Artigo Completo
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </span>

                  {/* Likes visual metric */}
                  <button
                    onClick={(e) => handleLike(post.id, e)}
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 border ${
                      likedPosts[post.id]
                        ? 'bg-emerald-950/70 text-emerald-400 border-emerald-600/50 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-[#d48743] border-zinc-800 hover:border-zinc-700'
                    }`}
                    title={likedPosts[post.id] ? 'Você curtiu este artigo' : 'Curtir este artigo'}
                  >
                    <ThumbsUp 
                      className={`w-3.5 h-3.5 transition-transform ${
                        likedPosts[post.id] ? 'fill-emerald-400 text-emerald-400 scale-110' : 'text-zinc-400'
                      }`} 
                    />
                    <span className="tabular-nums font-mono text-[11px]">
                      {likes[post.id] || (12 + (parseInt(post.id.split('_')[1] || '0') * 5))}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Modal display for selected article reading */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative animate-fadeIn text-zinc-100">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedPost(null)}
                type="button"
                className="absolute top-4 right-4 p-2 bg-zinc-950/80 hover:bg-zinc-850 text-zinc-400 hover:text-[#d48743] rounded-full transition border border-zinc-800 z-10 cursor-pointer"
                title="Fechar artigo"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative h-56 bg-zinc-950">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent" />
                <span className="absolute bottom-4 left-6 bg-emerald-600 text-white border border-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  {selectedPost.category}
                </span>
              </div>

              {/* Rich reading panel body */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center space-x-3 text-zinc-400 text-xs font-mono">
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-zinc-500" /> Consultoria AgroPasi
                  </span>
                  <span>•</span>
                  <span>{selectedPost.date}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-zinc-150 font-sans tracking-tight">
                  {selectedPost.title}
                </h3>

                <blockquote className="border-l-4 border-[#d48743] bg-zinc-950/50 p-4 rounded-r-xl text-xs italic text-zinc-300 leading-relaxed font-sans">
                  " {selectedPost.excerpt} "
                </blockquote>

                <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans pt-2">
                  <RichTextRenderer content={selectedPost.content} isDarkMode={true} />
                </div>

                <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                    <BookOpen className="w-4 h-4 text-[#d48743]" />
                    <span>Informativo AgroPasi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPost(null);
                      const el = document.getElementById('contato');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#d48743] hover:bg-[#c27a41] text-white font-sans text-xs font-semibold py-2.5 px-4 rounded-lg transition-all"
                  >
                    Falar com Consultor sobre este Tema
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

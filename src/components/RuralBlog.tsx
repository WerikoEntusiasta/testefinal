import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, BookOpen, Smile, User, ThumbsUp, MessageSquare, X } from 'lucide-react';
import { BlogPost } from '../types';
import RichTextRenderer from './RichTextRenderer';

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

[img https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800 | Aplicação técnica de graxa em engrenagens de transmissão]

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

export default function RuralBlog() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});

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
      [id]: (prev[id] || (12 + (parseInt(id.split('_')[1] || '0') * 4))) + (isLiked ? -1 : 1)
    }));
  };

  return (
    <section id="blog" className="py-20 bg-zinc-50 text-zinc-900 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-12">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              Dicas Técnicas & Sabedoria do Produtor
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-zinc-900">
              Blog do Cafezal
            </h2>
            <p className="text-sm text-zinc-650 mt-1 max-w-xl">
              Artigos produzidos pelos nossos consultores de engenharia para apoiar cafeicultores na regulagem fina de motopeças e ganho de rentabilidade operacional.
            </p>
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-lg transition duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-zinc-200">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600';
                    }}
                    className="w-full h-full object-cover group-hover:scale-103 transition duration-500 font-sans"
                  />
                  <span className="absolute top-3 left-3 bg-zinc-950/90 text-emerald-400 border border-zinc-850 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center space-x-3 text-zinc-400 text-xs font-medium font-sans">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {post.date}
                    </span>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 group-hover:text-emerald-800 transition line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Read button & Like button */}
              <div className="p-5 border-t border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50/50">
                <span className="text-xs text-[#d48743] font-bold uppercase tracking-wider flex items-center group-hover:text-[#b86d2d] transition">
                  Ler Artigo Completo
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </span>

                {/* Polished like pill button */}
                <button
                  onClick={(e) => handleLike(post.id, e)}
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 border ${
                    likedPosts[post.id]
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-2 ring-emerald-400/20'
                      : 'bg-white text-zinc-600 hover:text-[#d48743] hover:bg-amber-50/50 border-zinc-200 hover:border-amber-200'
                  }`}
                  title={likedPosts[post.id] ? 'Você curtiu este artigo' : 'Curtir este artigo'}
                >
                  <ThumbsUp 
                    className={`w-3.5 h-3.5 transition-transform ${
                      likedPosts[post.id] ? 'fill-emerald-600 text-emerald-600 scale-110' : 'text-zinc-400 group-hover/btn:text-[#d48743]'
                    }`} 
                  />
                  <span className="tabular-nums font-mono text-[11px]">
                    {likes[post.id] || (12 + (parseInt(post.id.split('_')[1] || '0') * 4))}
                  </span>
                </button>
              </div>

            </article>
          ))}
        </div>

        {/* Modal for Article Reading */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-300 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
              
              {/* Close Button badge */}
              <button
                onClick={() => setSelectedPost(null)}
                type="button"
                className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[#d48743] rounded-full transition border border-zinc-800 z-10 cursor-pointer"
                title="Fechar artigo"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative h-56 bg-zinc-100">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-4 left-6 bg-emerald-600 text-white border border-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  {selectedPost.category}
                </span>
              </div>

              {/* Content text */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center space-x-3 text-zinc-500 text-xs">
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-zinc-400" /> Engenharia AgroPasi
                  </span>
                  <span>•</span>
                  <span>{selectedPost.date}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 font-sans tracking-tight">
                  {selectedPost.title}
                </h3>

                <blockquote className="border-l-4 border-emerald-600 pl-4 text-xs italic text-zinc-600 font-sans">
                  " {selectedPost.excerpt} "
                </blockquote>

                <div className="text-zinc-800 text-xs sm:text-sm leading-relaxed font-sans pt-2">
                  <RichTextRenderer content={selectedPost.content} isDarkMode={false} />
                </div>

                <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-1.5 text-xs text-zinc-500">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Dicas do Campo AgroPasi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPost(null);
                      const el = document.getElementById('contato');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-emerald-700 hover:bg-emerald-650 text-white font-sans text-xs font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Falar com Consultor sobre esse Artigo
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

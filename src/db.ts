import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const DB_FILE = path.resolve(process.cwd(), 'agropasi.db');
let db = new sqlite3.Database(DB_FILE);

export function recreateDatabaseConnection() {
  try {
    db.close((err) => {
      if (err) console.error('Error closing corrupt db:', err);
    });
  } catch (e) {
    console.error('Error attempting to close db:', e);
  }
  
  const filesToDelete = [
    DB_FILE,
    `${DB_FILE}-wal`,
    `${DB_FILE}-shm`,
    `${DB_FILE}-journal`
  ];

  for (const file of filesToDelete) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log('Successfully deleted database file:', file);
      } catch (e) {
        console.error('Failed to delete database file:', file, e);
      }
    }
  }

  db = new sqlite3.Database(DB_FILE);
  console.log('Recreated database connection.');
}

// Promisify database operations for elegant async/await and robust error handling
export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
};

export const dbAll = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
};

export async function initDatabase() {
  try {
    await runInit();
  } catch (err: any) {
    if (err && (err.message?.includes('SQLITE_CORRUPT') || err.message?.includes('corrupt') || err.code === 'SQLITE_CORRUPT')) {
      console.error('Database corruption detected during init! Attempting self-healing...', err);
      recreateDatabaseConnection();
      await runInit();
      console.log('Self-healing completed successfully! Database recreated and seeded.');
    } else {
      throw err;
    }
  }
}

async function runInit() {
  // Optimize SQLite PRAGMAs for maximum throughput, WAL concurrency and caching
  try {
    await dbRun(`PRAGMA journal_mode = WAL;`);
    await dbRun(`PRAGMA synchronous = NORMAL;`);
    await dbRun(`PRAGMA cache_size = -4000;`); // 4MB memory cache for SQLite (ultra-light RAM usage)
    await dbRun(`PRAGMA mmap_size = 0;`); // Disable memory-mapped I/O to avoid RAM overhead
    await dbRun(`PRAGMA temp_store = FILE;`); // Store temporary tables in file instead of RAM cache
  } catch (e: any) {
    if (e && (e.message?.includes('SQLITE_CORRUPT') || e.message?.includes('corrupt') || e.code === 'SQLITE_CORRUPT')) {
      throw e;
    }
    console.warn('SQLite PRAGMA tuning notice:', e);
  }

  // 1. Create table users (Login and credentials)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL, -- 'vendas' | 'dono'
      failed_login_attempts INTEGER DEFAULT 0,
      lockout_until INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Create table sessions (Stateful server sessions)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      ip TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      last_active_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 3. Create table leads (CRM contact requests)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      cep TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      tractorModel TEXT,
      message TEXT NOT NULL,
      representativeId TEXT,
      representativeName TEXT,
      date TEXT NOT NULL,
      status TEXT CHECK(status IN ('Pendente', 'Atendido', 'Arquivado')) DEFAULT 'Pendente',
      consent_given INTEGER DEFAULT 1, -- LGPD compliance (1 = Yes)
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Create table tractors (Compatibility search)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS tractors (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      hpRequired TEXT NOT NULL,
      compatibility TEXT CHECK(compatibility IN ('Compatível', 'Recomenda-se Redutor', 'Consultar Engenharia')) DEFAULT 'Compatível',
      ptoRpm TEXT NOT NULL,
      hitchType TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Create table faqs (Dynamic FAQ Content)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Create table blog_posts (Dynamic Rural Blog)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      readTime TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 7. Create table gallery (Products in Action)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'video' | 'photo' | 'factory'
      categoryLabel TEXT NOT NULL,
      mediaUrl TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      duration TEXT,
      videoUrl TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 8. Create table representatives (Zip search)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS representatives (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      coverCeps TEXT NOT NULL, -- JSON serialized array of strings
      avatarUrl TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 9. Create table product_overrides (Products page)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS product_overrides (
      id TEXT PRIMARY KEY, -- 'varrefort-s' | 'varremax-x' | 'pasiparts'
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      badge TEXT NOT NULL,
      tag TEXT NOT NULL,
      competitorLiters REAL,
      ourLiters REAL,
      specsJson TEXT,
      benefitsJson TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Run migrations to add dynamic columns to existing SQLite table
  try {
    await dbRun('ALTER TABLE product_overrides ADD COLUMN specsJson TEXT');
  } catch (e) {
    // Column already exists
  }
  try {
    await dbRun('ALTER TABLE product_overrides ADD COLUMN benefitsJson TEXT');
  } catch (e) {
    // Column already exists
  }
  try {
    await dbRun('ALTER TABLE cms_hero ADD COLUMN logoUrl TEXT');
  } catch (e) {
    // Column already exists
  }

  // 10. Create table cms_hero (Site content)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS cms_hero (
      id TEXT PRIMARY KEY,
      badge TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      photoUrl TEXT NOT NULL,
      logoUrl TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 11. Create table cms_about (Site content)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS cms_about (
      id TEXT PRIMARY KEY,
      grandpaPhoto TEXT NOT NULL,
      grandpaTitle TEXT NOT NULL,
      grandpaText TEXT NOT NULL,
      grandpaQuote TEXT NOT NULL,
      industrialPhoto TEXT NOT NULL,
      industrialTitle TEXT NOT NULL,
      industrialText TEXT NOT NULL,
      sectionBadge TEXT NOT NULL,
      sectionTitle TEXT NOT NULL,
      sectionDesc1 TEXT NOT NULL,
      sectionDesc2 TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 12. Create table audit_logs (Security logs and audit history)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      role TEXT,
      action TEXT NOT NULL,
      ip TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      before_state TEXT, -- JSON string of state before change
      after_state TEXT,  -- JSON string of state after change
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed or sync admin accounts with environment variables
  const vendasEmail = process.env.VENDAS_EMAIL || 'vendas@agropasi.com.br';
  const vendasPassword = process.env.VENDAS_PASSWORD || 'Vendas@AgroPasi2026!';
  const donoEmail = process.env.DONO_EMAIL || 'dono@agropasi.com.br';
  const donoPassword = process.env.DONO_PASSWORD || 'Dono@AgroPasi2026!';

  // Equipe de Vendas Account
  const salesUser = await dbGet('SELECT id FROM users WHERE role = ?', ['vendas']);
  const salesHash = bcrypt.hashSync(vendasPassword, 12);
  if (salesUser) {
    await dbRun(
      'UPDATE users SET email = ?, password_hash = ? WHERE id = ?',
      [vendasEmail, salesHash, salesUser.id]
    );
  } else {
    const salesId = crypto.randomUUID();
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [salesId, vendasEmail, salesHash, 'vendas']
    );
  }

  // Proprietário Account (Dono)
  const ownerUser = await dbGet('SELECT id FROM users WHERE role = ?', ['dono']);
  const ownerHash = bcrypt.hashSync(donoPassword, 12);
  if (ownerUser) {
    await dbRun(
      'UPDATE users SET email = ?, password_hash = ? WHERE id = ?',
      [donoEmail, ownerHash, ownerUser.id]
    );
  } else {
    const ownerId = crypto.randomUUID();
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [ownerId, donoEmail, ownerHash, 'dono']
    );
  }

  // Seed default tractors if empty
  const tractorCount = await dbGet('SELECT COUNT(*) as count FROM tractors');
  if (tractorCount && tractorCount.count === 0) {
    console.log('Seeding initial compatibility data...');
    const defaultTractors = [
      { id: 't_1', brand: 'Valtra', model: 'A750', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_2', brand: 'Valtra', model: 'F75', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_3', brand: 'Massey Ferguson', model: 'MF 275', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_4', brand: 'Massey Ferguson', model: 'MF 4275', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_5', brand: 'John Deere', model: '5075N', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540E Econômica', hitchType: '3 Pontos - Cat. II' },
      { id: 't_6', brand: 'John Deere', model: '5078E', hpRequired: '78 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_7', brand: 'New Holland', model: 'T4.75F', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_8', brand: 'New Holland', model: 'TL5.80', hpRequired: '80 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_9', brand: 'Case IH', model: 'Farmall 80', hpRequired: '80 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_10', brand: 'Solis', model: 'S75', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_11', brand: 'Solis', model: 'S90', hpRequired: '90 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_12', brand: 'Valtra', model: 'A950', hpRequired: '95 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_13', brand: 'LS Tractor', model: 'R50', hpRequired: '50 cv', compatibility: 'Recomenda-se Redutor', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_14', brand: 'Yanmar', model: 'Solari 1155', hpRequired: '55 cv', compatibility: 'Recomenda-se Redutor', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_15', brand: 'Budny', model: 'BDY 7540', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' },
      { id: 't_16', brand: 'Agrale', model: '575.4', hpRequired: '75 cv', compatibility: 'Compatível', ptoRpm: '540 RPM', hitchType: '3 Pontos - Cat. II' }
    ];
    for (const t of defaultTractors) {
      await dbRun(
        'INSERT INTO tractors (id, brand, model, hpRequired, compatibility, ptoRpm, hitchType) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.brand, t.model, t.hpRequired, t.compatibility, t.ptoRpm, t.hitchType]
      );
    }
  }

  // Seed default CMS content if empty
  const heroCount = await dbGet('SELECT COUNT(*) as count FROM cms_hero');
  if (heroCount && heroCount.count === 0) {
    await dbRun(
      'INSERT INTO cms_hero (id, badge, title, description, photoUrl, logoUrl) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'main_hero',
        'FAMÍLIA INDUSTRIAL DESDE 1960',
        'Menos Café no Chão. Mais Economia de Diesel. Mais Lucro na Colheita.',
        'Não somos estreantes. A AgroPasi carrega 60 anos de indústria familiar para dentro do campo. Cada implemento que fabricamos nasce com um objetivo claro: trabalhar mais com menos combustível — e deixar menos café no chão.',
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1600',
        'https://i.ibb.co/fGtfCqR2/Design-sem-nome-removebg-preview.png'
      ]
    );
  } else {
    // Always ensure existing hero has valid logoUrl pointing to official logo
    await dbRun(
      "UPDATE cms_hero SET logoUrl = 'https://i.ibb.co/fGtfCqR2/Design-sem-nome-removebg-preview.png'"
    );
  }

  const aboutCount = await dbGet('SELECT COUNT(*) as count FROM cms_about');
  if (aboutCount && aboutCount.count === 0) {
    await dbRun(`
      INSERT INTO cms_about (
        id, grandpaPhoto, grandpaTitle, grandpaText, grandpaQuote,
        industrialPhoto, industrialTitle, industrialText,
        sectionBadge, sectionTitle, sectionDesc1, sectionDesc2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'main_about',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
      'O Rosto do Avô Pasiani: Legado, Autoridade e Confiança',
      'Este projeto de identidade visual busca resgatar a autoridade e a credibilidade estabelecidas pela família Pasiani, transformando o sobrenome em um selo de qualidade inquestionável. Ele representa o ponto de ancoragem emocional e simboliza a visão original e a qualidade artesanal.',
      '"Esta empresa tem história, tem raízes e honra o compromisso de seus fundadores com o homem do campo."',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800',
      'Estrutura Industrial Própria',
      'Cada peça passa pelo nosso processo. Nada é improvisado. Tudo é controlado.',
      'Nossas Raízes',
      'Três gerações, três indústrias, o mesmo compromisso com qualidade.',
      'Começamos com equipamentos para a gastronomia industrial. Décadas depois, investimos na construção civil. Hoje, chegamos ao agronegócio.',
      'Não expandimos por acaso. Expandimos porque uma família que vive de indústria aprende, a cada geração, a dominar um novo desafio com a mesma seriedade de sempre. A AgroPasi nasceu de 60 anos de indústria.'
    ]);
  }

  // Seed default FAQs if empty
  const faqCount = await dbGet('SELECT COUNT(*) as count FROM faqs');
  if (faqCount && faqCount.count === 0) {
    const defaultFaqs = [
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
    for (const faq of defaultFaqs) {
      await dbRun('INSERT INTO faqs (id, category, question, answer) VALUES (?, ?, ?, ?)', [faq.id, faq.category, faq.question, faq.answer]);
    }
  }

  // Seed default blog posts if empty
  const blogCount = await dbGet('SELECT COUNT(*) as count FROM blog_posts');
  const defaultPosts = [
    {
      id: 'p_1',
      title: 'Como regular o arruador de café para evitar perdas no chão',
      category: 'Regulagem de Máquinas',
      excerpt: 'Ajustar a altura das cerdas dianteiras e regular a pressão hidráulica das sapatas deslizes previne danos mecânicos na lavoura e garante 100% de recolhimento de grãos.',
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
      title: 'Por que o menor RPM de operation economiza diesel no trator?',
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

  if (blogCount && blogCount.count === 0) {
    for (const p of defaultPosts) {
      await dbRun(
        'INSERT INTO blog_posts (id, title, category, excerpt, content, date, readTime, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.title, p.category, p.excerpt, p.content, p.date, p.readTime, p.imageUrl]
      );
    }
  } else {
    for (const p of defaultPosts) {
      await dbRun(
        'UPDATE blog_posts SET content = ?, title = ?, category = ?, excerpt = ? WHERE id = ?',
        [p.content, p.title, p.category, p.excerpt, p.id]
      );
    }
  }

  // Seed default representatives if empty
  const repCount = await dbGet('SELECT COUNT(*) as count FROM representatives');
  if (repCount && repCount.count === 0) {
    const defaultReps = [
      {
        id: 'rep_hq',
        name: 'José (Escritório Central / Vendas SP)',
        region: 'Todo o Brasil / Catanduva-SP',
        phone: '17991066796',
        email: 'jose.vendas@agropasi.com.br',
        coverCeps: JSON.stringify([]),
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200'
      },
      {
        id: 'rep_mogiana',
        name: 'José (Oeste Paulista & Mogiana)',
        region: 'Alta Mogiana, Catanduva e Oeste de SP',
        phone: '17991066796',
        email: 'jose.vendas@agropasi.com.br',
        coverCeps: JSON.stringify(['11', '12', '13', '14', '15', '16', '17', '18', '19', '01', '02', '03', '04', '05', '06', '07', '08', '09']),
        avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200&h=200'
      },
      {
        id: 'rep_minas',
        name: 'Djalma (Cerrado & Sul de Minas)',
        region: 'Sul de Minas, Varginha, Patrocínio e Cerrado Mineiro',
        phone: '35998993966',
        email: 'djalma.vendas@agropasi.com.br',
        coverCeps: JSON.stringify(['30', '31', '32', '33', '34', '35', '36', '37', '38', '39']),
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200'
      },
      {
        id: 'rep_vitoria',
        name: 'Felipe Lourenço (Espírito Santo Conilon)',
        region: 'Espírito Santo, Região Caparaó e Norte Fluminense',
        phone: '17991066796',
        email: 'felipe.l@agropasi.com.br',
        coverCeps: JSON.stringify(['29', '20', '21', '22', '24', '25', '26', '27', '28']),
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200'
      },
      {
        id: 'rep_parana',
        name: 'José / Ronaldo (Região Sul)',
        region: 'Norte Pioneiro do Paraná e Santa Catarina',
        phone: '17991066796',
        email: 'ronaldo.s@agropasi.com.br',
        coverCeps: JSON.stringify(['80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99']),
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
      }
    ];
    for (const r of defaultReps) {
      await dbRun(
        'INSERT INTO representatives (id, name, region, phone, email, coverCeps, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [r.id, r.name, r.region, r.phone, r.email, r.coverCeps, r.avatarUrl]
      );
    }
  }

  // Seed default gallery items if empty
  const galCount = await dbGet('SELECT COUNT(*) as count FROM gallery');
  if (galCount && galCount.count === 0) {
    const defaultGalleryItems = [
      {
        id: 'act_vid_1',
        title: 'Arruador de Café AgroPasi Operando em Declive',
        category: 'video',
        categoryLabel: 'Vídeo Operacional',
        mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
        description: 'Veja o varredor limpando as linhas sob os cafeeiros no espalhado, organizando grãos e operando a 1.400 RPM com trator comum.',
        location: 'Alta Mogiana - Franca/SP',
        duration: '01:45',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'act_vid_2',
        title: 'Drone: Enleiramento Rápido de Grãos',
        category: 'video',
        categoryLabel: 'Vídeo Aéreo',
        mediaUrl: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=600',
        description: 'Imagens aéreas mostrando o alinhamento central uniforme obtido em uma lavoura de café adensada de 4 anos.',
        location: 'Sul de Minas - Varginha/MG',
        duration: '00:58',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'act_pic_1',
        title: 'Acréscimo de Linha: Zero Perda na Varrição',
        category: 'photo',
        categoryLabel: 'Fotografia de Campo',
        mediaUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
        description: 'Grãos perfeitamente varridos e acumulados longe das saias das árvores, desobstruindo a passagem dos colhedores manuais.',
        location: 'Cerrado Mineiro - Patrocínio/MG',
        duration: '',
        videoUrl: ''
      },
      {
        id: 'act_fac_1',
        title: 'Corte Laser de Chapa de Aço ASTM-36',
        category: 'factory',
        categoryLabel: 'Estrutura Industrial',
        mediaUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=605',
        description: 'Chassis estruturais do arruador recortados com precisão micrométrica sobre tecnologia laser de fibra ótica de alta potência.',
        location: 'Metalúrgica AgroPasi - Catanduva/SP',
        duration: '',
        videoUrl: ''
      },
      {
        id: 'act_fac_2',
        title: 'Acabamento e Engenharia Mecânica de Precisão',
        category: 'factory',
        categoryLabel: 'Estrutura Industrial',
        mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
        description: 'Nossa equipe de engenharia revisando as engrenagens de transmissão tratadas contra corrosão e desgaste mecânico severo.',
        location: 'Central Fabril - Catanduva/SP',
        duration: '',
        videoUrl: ''
      },
      {
        id: 'act_pic_2',
        title: 'Acoplamento no Terceiro Ponto Traseiro',
        category: 'photo',
        categoryLabel: 'Fotografia de Campo',
        mediaUrl: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&q=80&w=600',
        description: 'Detalhe do engate robusto universal que facilita o trabalho de manobra em passagens estreitas de cafezal.',
        location: 'Norte Pioneiro - Paraná',
        duration: '',
        videoUrl: ''
      }
    ];
    for (const item of defaultGalleryItems) {
      await dbRun(
        'INSERT INTO gallery (id, title, category, categoryLabel, mediaUrl, description, location, duration, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.title, item.category, item.categoryLabel, item.mediaUrl, item.description, item.location, item.duration, item.videoUrl]
      );
    }
  }

  // Seed default product overrides if empty (VarreFort-S, RecolheFort-C, etc. with correct spellings and descriptions)
  const overrideCount = await dbGet('SELECT COUNT(*) as count FROM product_overrides');
  if (overrideCount && overrideCount.count === 0) {
    console.log('Seeding default product overrides into database...');
    const defaultOverrides = [
      {
        id: 'varrefort-s',
        title: 'Arruador Soprador VarreFort-S',
        description: 'O arruador soprador projetado para trabalhar em baixa rotação — 1.300 a 1.500 RPM — garantindo ventilação máxima, reduzindo bastante as perdas na varrição e economizando combustível a cada hora de trabalho.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
        badge: 'Arruador Soprador de Café',
        tag: 'Arruador / Soprador',
        competitorLiters: 5.0,
        ourLiters: 3.5,
        specsJson: JSON.stringify({
          larguraAberto: '2,18 m',
          larguraFechado: '1,98 m',
          comprimento: '1,80 m',
          alturaTotal: '1,40 m',
          pesoLiquido: '456 kg',
          potenciaMinima: '50 cv',
          vazaoHidraulica: '30 L/min',
          rotacaoTdp: '540 rpm',
          acoplamento: '3 Pontos Cat. II'
        }),
        benefitsJson: JSON.stringify([
          { title: 'Economia Direta de Diesel', desc: 'Multiplicadores de torque próprios permitem vento máximo em baixa rotação.' },
          { title: 'Preservação das Raízes', desc: 'Chassis leve de 456kg evita a compactação severa sob as copas.' },
          { title: 'Peças de Reposição 100% Prontas', desc: 'Todo o fornecimento é usinado internamente com envio em 24h.' }
        ])
      },
      {
        id: 'varremax-x',
        title: 'Recolhedora de Café RecolheFort-C',
        description: 'Planejada sob o mesmo processo industrial que originou o VarreFort-S — está sendo testada e validada em campo para máxima durabilidade. Uma máquina concebida para o cafeicultor que busca alto rendimento na recolha.',
        imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600',
        badge: 'Próximo Lançamento AgroPasi',
        tag: 'Colheita Mecanizada',
        competitorLiters: 8.5,
        ourLiters: 6.0,
        specsJson: JSON.stringify({
          larguraAberto: '1,50 m a 2,00 m',
          larguraFechado: '1,30 m',
          comprimento: '2,20 m',
          alturaTotal: '1,80 m',
          pesoLiquido: '1.250 kg',
          potenciaMinima: 'Mínimo 60 cv',
          vazaoHidraulica: '40 L/min',
          rotacaoTdp: '540 rpm',
          acoplamento: 'Engate de Reboque Traseiro',
          capacidadeCarga: '1.500 Litros',
          rendimentoEstimado: 'Até 2.500 kg/hora',
          sistemaSeparador: 'Turbina de sucção dupla com peneira vibratória autolimpante'
        }),
        benefitsJson: JSON.stringify([
          { title: 'Sucção Dupla de Alta Eficiência', desc: 'Turbina balanceada com sistema duplo que separa folhas, galhos e poeira antes do armazenamento.' },
          { title: 'Caçamba Basculante de Alta Capacidade', desc: '1.500 Litros de volume útil que evitam paradas frequentes para descarga.' },
          { title: 'Fácil Manobrabilidade', desc: 'Chassi articulado projetado especificamente para o tráfego em carreadores estreitos de montanha.' }
        ])
      },
      {
        id: 'pasiparts',
        title: 'Peças de Reposição & Suporte Técnico',
        description: 'Você não compra apenas um implemento AgroPasi — você adquire a segurança de uma indústria completa à sua disposição. Fabricamos 100% das nossas engrenagens, rotores e componentes metálicos com envio imediato.',
        imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600',
        badge: 'Peças 100% Prontas',
        tag: 'Metalurgia e Suporte',
        competitorLiters: 5.2,
        ourLiters: 3.6,
        specsJson: JSON.stringify({
          larguraAberto: '',
          larguraFechado: '',
          comprimento: '',
          alturaTotal: '',
          pesoLiquido: '',
          potenciaMinima: '',
          vazaoHidraulica: '',
          rotacaoTdp: '',
          acoplamento: ''
        }),
        benefitsJson: JSON.stringify([
          { title: 'Metalurgia Certificada ASTM-36', desc: 'Chapas de aço cortadas a laser de fibra ótica de alta potência, sem rebarbas.' },
          { title: 'Envio Imediato para Todo o Brasil', desc: 'Nossas peças usinadas têm estoque regulador permanente para despacho em até 24 horas.' },
          { title: 'Suporte de Fábrica Direto no Whatsapp', desc: 'Sem burocracia ou intermediários. Você fala direto com quem construiu o seu equipamento.' }
        ])
      }
    ];

    for (const ov of defaultOverrides) {
      await dbRun(
        `INSERT INTO product_overrides (id, title, description, imageUrl, badge, tag, competitorLiters, ourLiters, specsJson, benefitsJson)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ov.id, ov.title, ov.description, ov.imageUrl, ov.badge, ov.tag, ov.competitorLiters, ov.ourLiters, ov.specsJson, ov.benefitsJson]
      );
    }
  }
}

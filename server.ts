import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { 
  initDatabase, dbRun, dbGet, dbAll 
} from './src/db.js';

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Database initialization will be executed inside startServer() below

function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// -------------------------------------------------------------------------
// 1. INPUT SANITIZATION UTILITY
// -------------------------------------------------------------------------
function sanitizeInput(val: any, isJsonString = false): any {
  if (typeof val === 'string') {
    // Strip script tags and HTML elements completely to avoid XSS
    let cleaned = val.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    if (isJsonString) {
      return cleaned;
    }
    // Escape specific HTML characters for extra safety
    return cleaned
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(val)) {
    return val.map((item) => sanitizeInput(item));
  }
  if (val !== null && typeof val === 'object') {
    const res: Record<string, any> = {};
    for (const key in val) {
      const isJsonField = key === 'specsJson' || key === 'benefitsJson';
      res[key] = sanitizeInput(val[key], isJsonField);
    }
    return res;
  }
  return val;
}

// Middleware to sanitize request bodies automatically
const sanitizeBodyMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};

// -------------------------------------------------------------------------
// 2. IN-MEMORY RATE LIMITER
// -------------------------------------------------------------------------
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimiterStore = new Map<string, RateLimitInfo>();

// Periodic cleanup of expired rate-limit entries every 10 minutes to prevent RAM growth
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of rateLimiterStore.entries()) {
    if (now > info.resetTime) {
      rateLimiterStore.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

const customRateLimiter = (options: { max: number; windowMs: number }) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1';
    const route = req.path;
    const key = `${ip}:${route}`;
    const now = Date.now();

    const limitInfo = rateLimiterStore.get(key);

    if (!limitInfo || now > limitInfo.resetTime) {
      rateLimiterStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return next();
    }

    limitInfo.count++;
    if (limitInfo.count > options.max) {
      return res.status(429).json({ 
        error: 'Tentativas excessivas. Por favor, aguarde antes de tentar novamente.' 
      });
    }

    next();
  };
};

// -------------------------------------------------------------------------
// HEALTH CHECK ENDPOINTS FOR EASYPANEL / DOCKER
// -------------------------------------------------------------------------
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// -------------------------------------------------------------------------
// 3. SECURE HEADERS MIDDLEWARE
// -------------------------------------------------------------------------
app.use((req, res, next) => {
  // To allow preview inside the AI Studio web iframe, we do not send X-Frame-Options: SAMEORIGIN
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Safe Content Security Policy (allows embedding in frames, styles, fonts, images, and flexible connections)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https: http:",
    "font-src 'self' data: https: http:",
    "img-src 'self' data: blob: https: http:",
    "frame-src 'self' https: http:",
    "frame-ancestors 'self' *",
    "connect-src 'self' https: http: ws: wss: *"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// -------------------------------------------------------------------------
// 4. PARSERS, COMPRESSION & COOKIES SETUP
// -------------------------------------------------------------------------
app.use(compression());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser('AGROPASI_SECURE_COOKIE_SECRET_2026'));

// -------------------------------------------------------------------------
// 5. CSRF PROTECTION MIDDLEWARE (Double Submit Cookie)
// -------------------------------------------------------------------------
// Inject CSRF token cookie on every request
app.use((req, res, next) => {
  let csrfToken = req.cookies['_csrf'];
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(24).toString('hex');
    // Save as HTTP-accessible cookie so client frontend JS can read and send it as header
    res.cookie('_csrf', csrfToken, {
      path: '/',
      sameSite: 'none',
      secure: true
    });
  }
  next();
});

// Validate CSRF for sensitive mutating requests (POST, PUT, DELETE)
const csrfCheckMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const cookieToken = req.cookies['_csrf'];
    const headerToken = req.headers['x-csrf-token'] || req.body?.csrfToken;

    if (!cookieToken || cookieToken !== headerToken) {
      console.warn(`[SECURITY WARNING] CSRF Blocked! Cookie: ${cookieToken}, Header: ${headerToken}`);
      return res.status(403).json({ error: 'Erro de validação CSRF de segurança. Operação rejeitada.' });
    }
  }
  next();
};

app.use(csrfCheckMiddleware);
app.use(sanitizeBodyMiddleware);

// -------------------------------------------------------------------------
// 6. SESSION SECURE TRACKING & AUDITING MIDDLEWARE
// -------------------------------------------------------------------------
const sessionAuthMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const sessionId = req.cookies['agropasi_session'];
  if (!sessionId) {
    return res.status(401).json({ error: 'Sessão expirada ou não autenticada.' });
  }

  const session = await dbGet('SELECT * FROM sessions WHERE id = ?', [sessionId]);
  if (!session) {
    res.clearCookie('agropasi_session');
    return res.status(401).json({ error: 'Sessão inválida. Por favor, faça login novamente.' });
  }

  const now = Date.now();
  // 1. Session Expiration check (Item 1: Sessions expire after period of inactivity)
  const maxInactivityMs = 30 * 60 * 1000; // 30 minutes
  if (now > session.expires_at || (now - session.last_active_at) > maxInactivityMs) {
    await dbRun('DELETE FROM sessions WHERE id = ?', [sessionId]);
    res.clearCookie('agropasi_session');
    return res.status(401).json({ error: 'Sessão expirada por inatividade.' });
  }

  // 2. Update last active timestamp
  await dbRun('UPDATE sessions SET last_active_at = ? WHERE id = ?', [now, sessionId]);

  // Attach session info to req
  (req as any).session = session;
  next();
};

// Log audit events to SQLite database
async function writeAuditLog(
  userEmail: string | null,
  role: string | null,
  action: string,
  req: express.Request,
  beforeState: any = null,
  afterState: any = null
) {
  const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const id = crypto.randomUUID();

  await dbRun(
    `INSERT INTO audit_logs (id, user_email, role, action, ip, user_agent, before_state, after_state)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userEmail,
      role,
      action,
      ip,
      userAgent,
      beforeState ? JSON.stringify(beforeState) : null,
      afterState ? JSON.stringify(afterState) : null
    ]
  );
}

// -------------------------------------------------------------------------
// 7. PUBLIC CATALOG CONTENT API
// -------------------------------------------------------------------------
app.get('/api/public/data', async (req, res) => {
  try {
    const hero = await dbGet('SELECT * FROM cms_hero LIMIT 1');
    const about = await dbGet('SELECT * FROM cms_about LIMIT 1');
    const faqs = await dbAll('SELECT * FROM faqs ORDER BY created_at DESC');
    const blog = await dbAll('SELECT * FROM blog_posts ORDER BY created_at DESC');
    const gallery = await dbAll('SELECT * FROM gallery ORDER BY created_at DESC');
    const tractors = await dbAll('SELECT * FROM tractors ORDER BY brand ASC, model ASC');
    
    const representativesRaw = await dbAll('SELECT * FROM representatives ORDER BY name ASC');
    const representatives = representativesRaw.map(r => ({
      ...r,
      coverCeps: JSON.parse(r.coverCeps)
    }));

    const overridesRaw = await dbAll('SELECT * FROM product_overrides');
    const overrides: Record<string, any> = {};
    overridesRaw.forEach(o => {
      overrides[o.id] = {
        title: o.title,
        description: o.description,
        imageUrl: o.imageUrl,
        badge: o.badge,
        tag: o.tag,
        competitorLiters: o.competitorLiters,
        ourLiters: o.ourLiters,
        specsJson: o.specsJson ? decodeHtmlEntities(o.specsJson) : o.specsJson,
        benefitsJson: o.benefitsJson ? decodeHtmlEntities(o.benefitsJson) : o.benefitsJson
      };
    });

    res.json({
      hero,
      about,
      faqs,
      blog,
      gallery,
      representatives,
      tractors,
      productOverrides: overrides
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar dados do catálogo.' });
  }
});

// -------------------------------------------------------------------------
// 8. CRM LEAD SUBMISSION (LGPD Gated and Validated)
// -------------------------------------------------------------------------
app.post(
  '/api/public/lead',
  customRateLimiter({ max: 5, windowMs: 60 * 1000 }), // Max 5 requests per minute
  async (req, res) => {
    try {
      const { name, phone, email, cep, tractorModel, message, representativeId, representativeName, consentGiven } = req.body;

      // STRICT VALIDATION (Item 12: Validate all inputs on server-side)
      if (!name || name.trim().length < 3) {
        return res.status(400).json({ error: 'O nome inserido é inválido. Digite pelo menos 3 caracteres.' });
      }
      if (!phone || phone.trim().length < 10) {
        return res.status(400).json({ error: 'O telefone fornecido é inválido. Digite DDD + número completo.' });
      }
      if (email && email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'O e-mail digitado possui formato inválido.' });
      }
      if (!consentGiven) {
        return res.status(400).json({ error: 'É necessário aceitar os termos de privacidade para enviar a solicitação (LGPD).' });
      }

      const id = `lead_${Date.now()}`;
      const date = new Date().toLocaleDateString('pt-BR');
      const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1';
      const ua = req.headers['user-agent'] || 'Unknown';

      // Insert lead safely with Prepared Statement
      await dbRun(
        `INSERT INTO leads (
          id, name, phone, email, cep, city, state, tractorModel, message,
          representativeId, representativeName, date, status, consent_given, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          name.trim(),
          phone.trim(),
          email ? email.trim() : 'Não informado',
          cep ? cep.trim() : 'Não informado',
          cep ? 'Simulado via CEP' : 'Não informado',
          'SP',
          tractorModel ? tractorModel.trim() : 'Não informado',
          message ? message.trim() : 'Solicitação Geral de Implemento',
          representativeId || 'rep_hq',
          representativeName || 'Vendas HQ',
          date,
          'Pendente',
          1,
          ip,
          ua
        ]
      );

      // Audit log (Item 10: Register IP, Browser, Action, User)
      await writeAuditLog(null, null, `Lead de contato submetido por: ${name.trim()} (${phone.trim()})`, req, null, { id, name });

      res.json({ success: true, leadId: id });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Falha ao registrar solicitação de contato.' });
    }
  }
);

// -------------------------------------------------------------------------
// 9. LGPD EXPORT & DELETE DATA REQUESTS
// -------------------------------------------------------------------------
app.post('/api/public/my-data', async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.trim().length < 8) {
    return res.status(400).json({ error: 'Digite seu telefone completo para buscar seus dados.' });
  }

  try {
    const leadsList = await dbAll('SELECT name, phone, email, cep, message, date, status, created_at FROM leads WHERE phone = ?', [phone.trim()]);
    res.json({ leads: leadsList });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao exportar dados.' });
  }
});

app.post('/api/public/delete-my-data', async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.trim().length < 8) {
    return res.status(400).json({ error: 'Digite seu telefone completo para solicitar a exclusão.' });
  }

  try {
    const countRow = await dbGet('SELECT COUNT(*) as count FROM leads WHERE phone = ?', [phone.trim()]);
    if (!countRow || countRow.count === 0) {
      return res.status(404).json({ error: 'Nenhum lead de contato localizado para este telefone.' });
    }

    await dbRun('DELETE FROM leads WHERE phone = ?', [phone.trim()]);
    await writeAuditLog(null, null, `LGPD: Dados deletados para o telefone: ${phone.trim()}`, req);
    res.json({ success: true, deletedCount: countRow.count });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover dados de contato.' });
  }
});

// -------------------------------------------------------------------------
// 10. AUTHENTICATION & LOCKOUT SUITE (Item 1, 6, 16)
// -------------------------------------------------------------------------
app.post(
  '/api/admin/login',
  customRateLimiter({ max: 5, windowMs: 60 * 1000 }), // Limit to 5 attempts per minute
  async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor, informe e-mail e senha.' });
    }

    try {
      const user = await dbGet('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
      if (!user) {
        // Safe standard message to prevent enumeration
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const now = Date.now();
      // Lockout check
      if (user.lockout_until && now < user.lockout_until) {
        const remainingMin = Math.ceil((user.lockout_until - now) / (60 * 1000));
        return res.status(403).json({ 
          error: `Esta conta está bloqueada temporariamente devido a tentativas incorretas. Tente novamente em ${remainingMin} minutos.` 
        });
      }

      // Password comparison
      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        const newFailCount = user.failed_login_attempts + 1;
        let lockoutUntil = 0;
        let message = 'E-mail ou senha incorretos.';

        if (newFailCount >= 5) {
          lockoutUntil = now + 15 * 60 * 1000; // Locked for 15 minutes (Item 9: Lockout after 5 attempts)
          await dbRun(
            'UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?',
            [0, lockoutUntil, user.id]
          );
          message = 'E-mail ou senha incorretos. Conta bloqueada temporariamente por 15 minutos por segurança.';
        } else {
          await dbRun(
            'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
            [newFailCount, user.id]
          );
        }

        await writeAuditLog(null, null, `Tentativa fracassada de login para: ${email.trim()}`, req);
        return res.status(401).json({ error: message });
      }

      // Success! Reset failures
      await dbRun(
        'UPDATE users SET failed_login_attempts = 0, lockout_until = 0 WHERE id = ?',
        [user.id]
      );

      // Generate secure session (Item 8: Generate new session ID on login)
      const sessionId = crypto.randomUUID();
      const expiresAt = now + 12 * 60 * 60 * 1000; // 12 hours max session duration
      const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1';
      const ua = req.headers['user-agent'] || 'Unknown';

      await dbRun(
        `INSERT INTO sessions (id, user_id, email, role, ip, user_agent, created_at, expires_at, last_active_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, user.id, user.email, user.role, ip, ua, now, expiresAt, now]
      );

      // Set cookie (Item 7: Secure, HttpOnly, SameSite cookies)
      res.cookie('agropasi_session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
      });

      await writeAuditLog(user.email, user.role, 'Login bem-sucedido na plataforma administrativa.', req);

      res.json({
        success: true,
        user: {
          email: user.email,
          role: user.role
        }
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Erro no servidor durante o login.' });
    }
  }
);

app.post('/api/admin/logout', async (req, res) => {
  const sessionId = req.cookies['agropasi_session'];
  if (sessionId) {
    const session = await dbGet('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (session) {
      await writeAuditLog(session.email, session.role, 'Usuário efetuou logout.', req);
    }
    // Delete session from database completely (Item 8: Destroy completely on logout)
    await dbRun('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }
  res.clearCookie('agropasi_session');
  res.json({ success: true });
});

app.get('/api/admin/me', async (req, res) => {
  const sessionId = req.cookies['agropasi_session'];
  if (!sessionId) {
    return res.json({ user: null });
  }

  try {
    const session = await dbGet('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session) {
      res.clearCookie('agropasi_session');
      return res.json({ user: null });
    }

    const now = Date.now();
    const maxInactivityMs = 30 * 60 * 1000;
    if (now > session.expires_at || (now - session.last_active_at) > maxInactivityMs) {
      await dbRun('DELETE FROM sessions WHERE id = ?', [sessionId]);
      res.clearCookie('agropasi_session');
      return res.json({ user: null });
    }

    res.json({
      user: {
        email: session.email,
        role: session.role
      }
    });
  } catch (err) {
    res.json({ user: null });
  }
});

// -------------------------------------------------------------------------
// 11. SECURE FILE UPLOADER (Item 5: Protect against malicious uploads)
// -------------------------------------------------------------------------
app.post('/api/admin/upload', sessionAuthMiddleware, async (req, res) => {
  const { fileName, fileType, fileData } = req.body; // Expects base64 encoded data
  const session = (req as any).session;

  if (!fileName || !fileType || !fileData) {
    return res.status(400).json({ error: 'Parâmetros de arquivo ausentes.' });
  }

  // 1. EXTENSION CHECK
  const ext = path.extname(fileName).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({ error: 'Extensão de arquivo não permitida. Use apenas JPG, JPEG, PNG, WEBP ou SVG.' });
  }

  // 2. MIME TYPE CHECK
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(fileType)) {
    return res.status(400).json({ error: 'Tipo MIME inválido. O arquivo deve ser uma imagem (JPG, PNG, WEBP ou SVG).' });
  }

  // 3. SIZE CHECK (Max 5MB)
  const buffer = Buffer.from(fileData, 'base64');
  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'O tamanho do arquivo excede o limite máximo de 5MB.' });
  }

  try {
    // 4. RANDOM SECURE RENAMING
    const secureFileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, secureFileName);

    // Save outside public, inside dedicated folder, and write
    fs.writeFileSync(filePath, buffer);

    await writeAuditLog(
      session.email,
      session.role,
      `Upload efetuado: Arquivo salvo como ${secureFileName}`,
      req,
      null,
      { secureFileName, originalName: fileName }
    );

    res.json({
      success: true,
      url: `/api/uploads/${secureFileName}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao salvar o arquivo.' });
  }
});

// Endpoint to fetch uploaded images safely
app.get('/api/uploads/:id', (req, res) => {
  const fileId = req.params.id;
  // Prevent directory traversal attacks!
  const sanitizedId = path.basename(fileId);
  const filePath = path.join(UPLOAD_DIR, sanitizedId);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo não encontrado.');
  }

  // Infer Content-Type
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'image/jpeg';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.webp') contentType = 'image/webp';
  if (ext === '.svg') contentType = 'image/svg+xml';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  fs.createReadStream(filePath).pipe(res);
});

// -------------------------------------------------------------------------
// 12. SECURE BACKEND CRUD (Requires Session Authentication)
// -------------------------------------------------------------------------

// LEADS
app.get('/api/admin/leads', sessionAuthMiddleware, async (req, res) => {
  try {
    const leads = await dbAll('SELECT * FROM leads ORDER BY created_at DESC');
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar leads.' });
  }
});

app.put('/api/admin/leads/:id', sessionAuthMiddleware, async (req, res) => {
  const { status } = req.body;
  const leadId = req.params.id;
  const session = (req as any).session;

  if (!['Pendente', 'Atendido', 'Arquivado'].includes(status)) {
    return res.status(400).json({ error: 'Status de lead inválido.' });
  }

  try {
    const before = await dbGet('SELECT * FROM leads WHERE id = ?', [leadId]);
    if (!before) return res.status(404).json({ error: 'Lead não encontrado.' });

    await dbRun('UPDATE leads SET status = ? WHERE id = ?', [status, leadId]);
    const after = await dbGet('SELECT * FROM leads WHERE id = ?', [leadId]);

    await writeAuditLog(session.email, session.role, `Atualizou status do lead #${leadId} para: ${status}`, req, before, after);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar lead.' });
  }
});

app.delete('/api/admin/leads/:id', sessionAuthMiddleware, async (req, res) => {
  const leadId = req.params.id;
  const session = (req as any).session;

  try {
    const before = await dbGet('SELECT * FROM leads WHERE id = ?', [leadId]);
    if (!before) return res.status(404).json({ error: 'Lead não localizado.' });

    await dbRun('DELETE FROM leads WHERE id = ?', [leadId]);
    await writeAuditLog(session.email, session.role, `Deletou permanentemente lead #${leadId}`, req, before, null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar lead.' });
  }
});

// TRACTORS COMPATIBILITY (Item 1: Exclusive to DONO)
app.post('/api/admin/tractors', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado. Apenas o Proprietário pode homologar tratores.' });
  }

  const { brand, model, hpRequired, compatibility, ptoRpm, hitchType } = req.body;
  if (!brand || !model || !hpRequired) {
    return res.status(400).json({ error: 'Marca, Modelo e Potência são obrigatórios.' });
  }

  try {
    const id = `t_user_${Date.now()}`;
    await dbRun(
      `INSERT INTO tractors (id, brand, model, hpRequired, compatibility, ptoRpm, hitchType)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, brand, model, hpRequired, compatibility || 'Compatível', ptoRpm || '540 RPM', hitchType || '3 Pontos - Cat. II']
    );

    const inserted = await dbGet('SELECT * FROM tractors WHERE id = ?', [id]);
    await writeAuditLog(session.email, session.role, `Homologou novo trator: ${brand} ${model}`, req, null, inserted);

    res.json({ success: true, tractor: inserted });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar trator.' });
  }
});

app.delete('/api/admin/tractors/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado. Apenas o Proprietário pode excluir tratores.' });
  }

  const tractorId = req.params.id;
  try {
    const before = await dbGet('SELECT * FROM tractors WHERE id = ?', [tractorId]);
    if (!before) return res.status(404).json({ error: 'Trator não localizado.' });

    await dbRun('DELETE FROM tractors WHERE id = ?', [tractorId]);
    await writeAuditLog(session.email, session.role, `Removeu trator cadastrado: ${before.brand} ${before.model}`, req, before, null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar trator.' });
  }
});

// FAQS
app.post('/api/admin/faqs', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado. Exclusivo para Proprietário.' });
  }

  const { category, question, answer } = req.body;
  if (!category || !question || !answer) {
    return res.status(400).json({ error: 'Categoria, Pergunta e Resposta são obrigatórias.' });
  }

  try {
    const id = `faq_user_${Date.now()}`;
    await dbRun('INSERT INTO faqs (id, category, question, answer) VALUES (?, ?, ?, ?)', [id, category, question, answer]);
    const inserted = await dbGet('SELECT * FROM faqs WHERE id = ?', [id]);

    await writeAuditLog(session.email, session.role, `Adicionou nova pergunta FAQ: "${question}"`, req, null, inserted);
    res.json({ success: true, faq: inserted });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar FAQ.' });
  }
});

app.delete('/api/admin/faqs/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const faqId = req.params.id;
  try {
    const before = await dbGet('SELECT * FROM faqs WHERE id = ?', [faqId]);
    if (!before) return res.status(404).json({ error: 'FAQ não localizada.' });

    await dbRun('DELETE FROM faqs WHERE id = ?', [faqId]);
    await writeAuditLog(session.email, session.role, `Removeu pergunta FAQ: "${before.question}"`, req, before, null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar FAQ.' });
  }
});

// BLOG
app.post('/api/admin/blog', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { title, category, excerpt, content, readTime, imageUrl } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Título, Categoria e Conteúdo do blog são obrigatórios.' });
  }

  try {
    const id = `p_user_${Date.now()}`;
    const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const realExcerpt = excerpt || content.substring(0, 110) + '...';
    const realImg = imageUrl || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400';

    await dbRun(
      `INSERT INTO blog_posts (id, title, category, excerpt, content, date, readTime, imageUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, category, realExcerpt, content, date, readTime || '5 min leitura', realImg]
    );

    const inserted = await dbGet('SELECT * FROM blog_posts WHERE id = ?', [id]);
    await writeAuditLog(session.email, session.role, `Publicou artigo no blog: "${title}"`, req, null, inserted);

    res.json({ success: true, post: inserted });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar artigo de blog.' });
  }
});

app.delete('/api/api/admin/blog/:id', sessionAuthMiddleware, async (req, res) => { // Support nested or normal paths
  // Redirect to normal handler
});

app.delete('/api/admin/blog/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const blogId = req.params.id;
  try {
    const before = await dbGet('SELECT * FROM blog_posts WHERE id = ?', [blogId]);
    if (!before) return res.status(404).json({ error: 'Artigo não localizado.' });

    await dbRun('DELETE FROM blog_posts WHERE id = ?', [blogId]);
    await writeAuditLog(session.email, session.role, `Removeu artigo do blog: "${before.title}"`, req, before, null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir artigo.' });
  }
});

// GALLERY
app.post('/api/admin/gallery', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { title, category, categoryLabel, mediaUrl, description, location, duration, videoUrl } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Título e Descrição da Galeria são obrigatórios.' });
  }

  try {
    const id = `gal_user_${Date.now()}`;
    await dbRun(
      `INSERT INTO gallery (id, title, category, categoryLabel, mediaUrl, description, location, duration, videoUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        category || 'photo',
        categoryLabel || 'Fotografia de Campo',
        mediaUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
        description,
        location || null,
        duration || null,
        videoUrl || null
      ]
    );

    const inserted = await dbGet('SELECT * FROM gallery WHERE id = ?', [id]);
    await writeAuditLog(session.email, session.role, `Adicionou item à galeria operacional: "${title}"`, req, null, inserted);
    res.json({ success: true, item: inserted });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar item de galeria.' });
  }
});

app.delete('/api/admin/gallery/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const itemId = req.params.id;
  try {
    const before = await dbGet('SELECT * FROM gallery WHERE id = ?', [itemId]);
    if (!before) return res.status(404).json({ error: 'Item não localizado.' });

    await dbRun('DELETE FROM gallery WHERE id = ?', [itemId]);
    await writeAuditLog(session.email, session.role, `Removeu item de galeria: "${before.title}"`, req, before, null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir item de galeria.' });
  }
});

app.put('/api/admin/gallery/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const itemId = req.params.id;
  const { title, category, categoryLabel, mediaUrl, description, location, duration, videoUrl } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Título e Descrição da Galeria são obrigatórios.' });
  }

  try {
    const before = await dbGet('SELECT * FROM gallery WHERE id = ?', [itemId]);
    if (!before) return res.status(404).json({ error: 'Item não localizado.' });

    await dbRun(
      `UPDATE gallery 
       SET title = ?, category = ?, categoryLabel = ?, mediaUrl = ?, description = ?, location = ?, duration = ?, videoUrl = ?
       WHERE id = ?`,
      [
        title,
        category || 'photo',
        categoryLabel || 'Fotografia de Campo',
        mediaUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
        description,
        location || null,
        duration || null,
        videoUrl || null,
        itemId
      ]
    );

    const updated = await dbGet('SELECT * FROM gallery WHERE id = ?', [itemId]);
    await writeAuditLog(session.email, session.role, `Editou item de galeria: "${title}"`, req, before, updated);
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao editar item de galeria.' });
  }
});

// REPRESENTATIVES
app.post('/api/admin/reps', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { name, region, phone, email, coverCeps, avatarUrl } = req.body;
  if (!name || !phone || !region) {
    return res.status(400).json({ error: 'Nome, Telefone e Região são obrigatórios.' });
  }

  try {
    const id = `rep_user_${Date.now()}`;
    const cepsArray = Array.isArray(coverCeps) ? coverCeps : [];
    const phoneOnly = phone.replace(/\D/g, '');

    await dbRun(
      `INSERT INTO representatives (id, name, region, phone, email, coverCeps, avatarUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        region,
        phoneOnly,
        email || 'comercial@agropasi.com.br',
        JSON.stringify(cepsArray),
        avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250&h=250'
      ]
    );

    const inserted = await dbGet('SELECT * FROM representatives WHERE id = ?', [id]);
    await writeAuditLog(session.email, session.role, `Adicionou representante de vendas: ${name}`, req, null, inserted);
    res.json({ success: true, representative: { ...inserted, coverCeps: JSON.parse(inserted.coverCeps) } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar representante.' });
  }
});

app.delete('/api/admin/reps/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const repId = req.params.id;
  try {
    const before = await dbGet('SELECT * FROM representatives WHERE id = ?', [repId]);
    if (!before) return res.status(404).json({ error: 'Representante não localizado.' });

    await dbRun('DELETE FROM representatives WHERE id = ?', [repId]);
    await writeAuditLog(session.email, session.role, `Removeu representante comercial: ${before.name}`, req, before, null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir representante.' });
  }
});

app.put('/api/admin/reps/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const repId = req.params.id;
  const { name, region, phone, email, coverCeps, avatarUrl } = req.body;
  if (!name || !phone || !region) {
    return res.status(400).json({ error: 'Nome, Telefone e Região são obrigatórios.' });
  }

  try {
    const before = await dbGet('SELECT * FROM representatives WHERE id = ?', [repId]);
    if (!before) return res.status(404).json({ error: 'Representante não localizado.' });

    const cepsArray = Array.isArray(coverCeps) ? coverCeps : [];
    const phoneOnly = phone.replace(/\D/g, '');

    await dbRun(
      `UPDATE representatives 
       SET name = ?, region = ?, phone = ?, email = ?, coverCeps = ?, avatarUrl = ?
       WHERE id = ?`,
      [
        name,
        region,
        phoneOnly,
        email || 'comercial@agropasi.com.br',
        JSON.stringify(cepsArray),
        avatarUrl || before.avatarUrl,
        repId
      ]
    );

    const updated = await dbGet('SELECT * FROM representatives WHERE id = ?', [repId]);
    await writeAuditLog(session.email, session.role, `Atualizou dados do representante de vendas: ${name}`, req, before, updated);
    res.json({ success: true, representative: { ...updated, coverCeps: JSON.parse(updated.coverCeps) } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar representante.' });
  }
});

// CMS SITE CONTENT UPDATE (Hero & About)
app.post('/api/admin/cms/hero', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { badge, title, description, photoUrl, logoUrl } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Título e Descrição do Hero são obrigatórios.' });
  }

  try {
    const before = await dbGet('SELECT * FROM cms_hero WHERE id = ?', ['main_hero']);
    
    await dbRun(
      `UPDATE cms_hero 
       SET badge = ?, title = ?, description = ?, photoUrl = ?, logoUrl = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [badge || '', title, description, photoUrl || '', logoUrl || '', 'main_hero']
    );

    const after = await dbGet('SELECT * FROM cms_hero WHERE id = ?', ['main_hero']);
    await writeAuditLog(session.email, session.role, 'Atualizou os textos, logo da marca e banner do Hero principal', req, before, after);

    res.json({ success: true, hero: after });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar dados do Hero.' });
  }
});

app.post('/api/admin/cms/logo', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  let { logoUrl } = req.body;
  if (
    logoUrl &&
    (logoUrl.includes('ibb.co/dJ6FQj9r') ||
      logoUrl.includes('ibb.co/dJ6FQj9') ||
      logoUrl.includes('ibb.co/cqGr40S') ||
      logoUrl.includes('ibb.co/23HM5cz2') ||
      logoUrl.includes('ibb.co/23HM5cz'))
  ) {
    logoUrl = 'https://i.ibb.co/fGtfCqR2/Design-sem-nome-removebg-preview.png';
  }

  try {
    const before = await dbGet('SELECT * FROM cms_hero WHERE id = ?', ['main_hero']);
    
    if (!before) {
      await dbRun(
        'INSERT INTO cms_hero (id, badge, title, description, photoUrl, logoUrl) VALUES (?, ?, ?, ?, ?, ?)',
        ['main_hero', '', 'AgroPasi', '', '', logoUrl || '']
      );
    } else {
      await dbRun(
        `UPDATE cms_hero 
         SET logoUrl = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [logoUrl || '', 'main_hero']
      );
    }

    const after = await dbGet('SELECT * FROM cms_hero WHERE id = ?', ['main_hero']);
    await writeAuditLog(session.email, session.role, 'Atualizou a logo oficial do site', req, before, after);

    res.json({ success: true, hero: after, logoUrl: logoUrl || '' });
  } catch (err) {
    console.error('Erro ao atualizar logo:', err);
    res.status(500).json({ error: 'Erro ao atualizar logo do site.' });
  }
});

app.post('/api/admin/cms/about', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { 
    grandpaPhoto, grandpaTitle, grandpaText, grandpaQuote,
    industrialPhoto, industrialTitle, industrialText,
    sectionBadge, sectionTitle, sectionDesc1, sectionDesc2
  } = req.body;

  try {
    const before = await dbGet('SELECT * FROM cms_about WHERE id = ?', ['main_about']);

    await dbRun(
      `UPDATE cms_about
       SET grandpaPhoto = ?, grandpaTitle = ?, grandpaText = ?, grandpaQuote = ?,
           industrialPhoto = ?, industrialTitle = ?, industrialText = ?,
           sectionBadge = ?, sectionTitle = ?, sectionDesc1 = ?, sectionDesc2 = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        grandpaPhoto || '', grandpaTitle || '', grandpaText || '', grandpaQuote || '',
        industrialPhoto || '', industrialTitle || '', industrialText || '',
        sectionBadge || '', sectionTitle || '', sectionDesc1 || '', sectionDesc2 || '',
        'main_about'
      ]
    );

    const after = await dbGet('SELECT * FROM cms_about WHERE id = ?', ['main_about']);
    await writeAuditLog(session.email, session.role, 'Atualizou a seção "Quem Somos / Família Pasiani"', req, before, after);

    res.json({ success: true, about: after });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar dados Quem Somos.' });
  }
});

// HIGHLIGHT PRODUCTS OVERRIDES (EXCLUSIVE TO OWNER / DONO & VENDAS)
app.post('/api/admin/product-overrides', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  const { id, title, description, imageUrl, badge, tag, competitorLiters, ourLiters, specsJson, benefitsJson } = req.body;

  if (!id || !title || !description) {
    return res.status(400).json({ error: 'Identificador, Título e Descrição do produto são obrigatórios.' });
  }

  try {
    const before = await dbGet('SELECT * FROM product_overrides WHERE id = ?', [id]);

    if (before) {
      await dbRun(
        `UPDATE product_overrides
         SET title = ?, description = ?, imageUrl = ?, badge = ?, tag = ?, competitorLiters = ?, ourLiters = ?, specsJson = ?, benefitsJson = ?, created_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, description, imageUrl || '', badge || '', tag || '', competitorLiters || 0, ourLiters || 0, specsJson || '', benefitsJson || '', id]
      );
    } else {
      await dbRun(
        `INSERT INTO product_overrides (id, title, description, imageUrl, badge, tag, competitorLiters, ourLiters, specsJson, benefitsJson)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, title, description, imageUrl || '', badge || '', tag || '', competitorLiters || 0, ourLiters || 0, specsJson || '', benefitsJson || '']
      );
    }

    const after = await dbGet('SELECT * FROM product_overrides WHERE id = ?', [id]);
    await writeAuditLog(session.email, session.role, `Atualizou especificações do produto destacado: "${title}"`, req, before, after);

    if (after) {
      after.specsJson = after.specsJson ? decodeHtmlEntities(after.specsJson) : after.specsJson;
      after.benefitsJson = after.benefitsJson ? decodeHtmlEntities(after.benefitsJson) : after.benefitsJson;
    }

    res.json({ success: true, override: after });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar alterações no produto.' });
  }
});

app.delete('/api/admin/product-overrides/:id', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  const prodId = req.params.id;

  try {
    const before = await dbGet('SELECT * FROM product_overrides WHERE id = ?', [prodId]);
    if (!before) return res.status(404).json({ error: 'Override não localizado.' });

    await dbRun('DELETE FROM product_overrides WHERE id = ?', [prodId]);
    await writeAuditLog(session.email, session.role, `Resetou especificações customizadas do produto destacado: "${before.title}"`, req, before, null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar override.' });
  }
});

// GET SECURITY LOGS & AUDIT HISTORY (Item 10 and 11: Only OWNER role can view audit trails)
app.get('/api/admin/logs', sessionAuthMiddleware, async (req, res) => {
  const session = (req as any).session;
  if (session.role !== 'dono') {
    return res.status(403).json({ error: 'Acesso negado. Apenas o Proprietário tem acesso aos logs de segurança.' });
  }

  try {
    const logs = await dbAll('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar logs de segurança.' });
  }
});

// -------------------------------------------------------------------------
// 13. BOOTSTRAP ASYNC START FLOW
// -------------------------------------------------------------------------
async function startServer() {
  // Initialize Database
  try {
    await initDatabase();
    console.log('✔ SQLite Database initialized successfully!');
  } catch (err) {
    console.error('❌ Failed to initialize SQLite database:', err);
  }

  // Vite middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Cache static assets (JS, CSS, images with hash) for 1 year
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    // Serve HTML and other static files with ETag verification
    app.use(express.static(distPath, {
      maxAge: '1h',
      etag: true,
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Secure Server successfully running at: http://0.0.0.0:${PORT}`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`${signal} recebido. Encerrando servidor graciosamente...`);
    server.close(() => {
      console.log('Servidor encerrado com sucesso.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer();

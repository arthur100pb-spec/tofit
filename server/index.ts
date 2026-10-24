import express, { type NextFunction, type Request, type Response } from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

try { process.loadEnvFile?.(); } catch { /* .env is optional in development */ }

const PORT = Number(process.env.PORT || 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'desenvolvimento-local-troque-em-producao';
const databasePath = resolve(process.env.DATABASE_PATH || './data/tofit.db');
mkdirSync(dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    price_cents INTEGER NOT NULL CHECK(price_cents >= 0),
    compare_price_cents INTEGER,
    image_key TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0)
  );
  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, product_id)
  );
  CREATE TABLE IF NOT EXISTS cart_items (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    PRIMARY KEY(user_id, variant_id)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','preparing','shipped','delivered','cancelled')),
    total_cents INTEGER NOT NULL,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id),
    product_name TEXT NOT NULL,
    variant_label TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    quantity INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT
  );
`);

const seed = db.transaction(() => {
  db.prepare("INSERT OR IGNORE INTO categories(name, slug) VALUES ('Slim', 'slim'), ('Plus Size', 'plus-size')").run();
  const categories = db.prepare('SELECT id, slug FROM categories').all() as { id: number; slug: string }[];
  const ids = Object.fromEntries(categories.map((item) => [item.slug, item.id]));
  const insertProduct = db.prepare(`INSERT OR IGNORE INTO products(name,slug,description,category_id,price_cents,compare_price_cents,image_key) VALUES (?,?,?,?,?,?,?)`);
  insertProduct.run('Top Tube - Coleção MOOD', 'top-tube-mood', 'Top confortável e versátil para treinos e produções casuais.', ids.slim, 6590, 8990, 'toptube');
  insertProduct.run('Macaquinho EVE', 'macaquinho-eve', 'Macaquinho esportivo com ajuste firme e liberdade de movimento.', ids.slim, 16990, 18590, 'macaquinhoeve');
  insertProduct.run('Macaquinho PLUS', 'macaquinho-plus', 'Modelagem plus size pensada para conforto, sustentação e confiança.', ids['plus-size'], 17590, 19990, 'macaquinhoplus');
  const products = db.prepare('SELECT id, slug FROM products').all() as { id: number; slug: string }[];
  const insertVariant = db.prepare('INSERT OR IGNORE INTO product_variants(product_id,size,color,sku,stock) VALUES (?,?,?,?,?)');
  for (const product of products) {
    const sizes = product.slug === 'macaquinho-plus' ? ['G1', 'G2', 'G3'] : ['P', 'M', 'G'];
    for (const size of sizes) insertVariant.run(product.id, size, 'Preto', `${product.slug.toUpperCase()}-${size}`, 8);
  }
});
seed();

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword && adminPassword !== 'troque-esta-senha') {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  const hash = bcrypt.hashSync(adminPassword, 12);
  if (existing) db.prepare("UPDATE users SET role='admin', password_hash=? WHERE email=?").run(hash, adminEmail);
  else db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES ('Administrador',?,?,'admin')").run(adminEmail, hash);
}

type AuthUser = { id: number; name: string; email: string; role: 'customer' | 'admin' };
type AuthRequest = Request & { user?: AuthUser };

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter);

function publicUser(id: number): AuthUser | undefined {
  return db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(id) as AuthUser | undefined;
}
function signIn(res: Response, user: AuthUser) {
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('tofit_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 86400000, path: '/' });
}
function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.tofit_session as string | undefined;
  if (!token) return res.status(401).json({ message: 'Faça login para continuar.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user = publicUser(Number(payload.sub));
    if (!user) return res.status(401).json({ message: 'Sessão inválida.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Sua sessão expirou. Entre novamente.' });
  }
}
function admin(req: AuthRequest, res: Response, next: NextFunction) {
  auth(req, res, () => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Acesso restrito ao administrador.' }));
}
function validate<T>(schema: z.ZodType<T>, value: unknown, res: Response): T | undefined {
  const result = schema.safeParse(value);
  if (!result.success) {
    res.status(400).json({ message: result.error.issues[0]?.message || 'Dados inválidos.' });
    return;
  }
  return result.data;
}
function productRows(where = 'p.active=1', params: unknown[] = []) {
  return db.prepare(`
    SELECT p.id,p.name,p.slug,p.description,p.price_cents AS priceCents,
      p.compare_price_cents AS comparePriceCents,p.image_key AS imageKey,
      c.name AS category,c.slug AS categorySlug,
      COALESCE(SUM(v.stock),0) AS stock
    FROM products p JOIN categories c ON c.id=p.category_id
    LEFT JOIN product_variants v ON v.product_id=p.id
    WHERE ${where} GROUP BY p.id ORDER BY p.id
  `).all(...params);
}

app.get('/api/health', (_req, res) => res.json({ ok: true, database: 'connected' }));

const credentialsSchema = z.object({ email: z.string().email('Informe um e-mail válido.').transform((v) => v.toLowerCase()), password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.') });
app.post('/api/auth/register', (req, res) => {
  const data = validate(credentialsSchema.extend({ name: z.string().trim().min(2, 'Informe seu nome.').max(80) }), req.body, res);
  if (!data) return;
  if (db.prepare('SELECT id FROM users WHERE email=?').get(data.email)) return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
  const result = db.prepare('INSERT INTO users(name,email,password_hash) VALUES (?,?,?)').run(data.name, data.email, bcrypt.hashSync(data.password, 12));
  const user = publicUser(Number(result.lastInsertRowid))!;
  signIn(res, user);
  res.status(201).json({ user });
});
app.post('/api/auth/login', (req, res) => {
  const data = validate(credentialsSchema, req.body, res);
  if (!data) return;
  const row = db.prepare('SELECT id,password_hash FROM users WHERE email=?').get(data.email) as { id: number; password_hash: string } | undefined;
  if (!row || !bcrypt.compareSync(data.password, row.password_hash)) return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  const user = publicUser(row.id)!;
  signIn(res, user);
  res.json({ user });
});
app.post('/api/auth/logout', (_req, res) => { res.clearCookie('tofit_session', { path: '/' }); res.status(204).end(); });
app.get('/api/auth/me', auth, (req: AuthRequest, res) => res.json({ user: req.user }));
app.post('/api/auth/forgot-password', (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (parsed.success) {
    const user = db.prepare('SELECT id FROM users WHERE email=?').get(parsed.data.email.toLowerCase()) as { id: number } | undefined;
    if (user) {
      const token = randomBytes(32).toString('hex');
      const hash = createHash('sha256').update(token).digest('hex');
      const expires = new Date(Date.now() + 30 * 60000).toISOString();
      db.prepare('INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES (?,?,?)').run(user.id, hash, expires);
      if (process.env.NODE_ENV !== 'production') console.log(`[ToFit] Link de recuperação: ${CLIENT_ORIGIN}/redefinir-senha?token=${token}`);
    }
  }
  res.json({ message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.' });
});
app.post('/api/auth/reset-password', (req, res) => {
  const data = validate(z.object({ token: z.string().min(20), password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.') }), req.body, res);
  if (!data) return;
  const hash = createHash('sha256').update(data.token).digest('hex');
  const row = db.prepare("SELECT id,user_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND datetime(expires_at) > datetime('now')").get(hash) as { id: number; user_id: number } | undefined;
  if (!row) return res.status(400).json({ message: 'Link inválido ou expirado.' });
  db.transaction(() => {
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(data.password, 12), row.user_id);
    db.prepare('UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?').run(row.id);
  })();
  res.json({ message: 'Senha alterada. Você já pode entrar.' });
});

app.get('/api/products', (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : '';
  res.json({ products: category ? productRows('p.active=1 AND c.slug=?', [category]) : productRows() });
});
app.get('/api/products/:id', (req, res) => {
  const products = productRows('p.active=1 AND p.id=?', [Number(req.params.id)]);
  if (!products.length) return res.status(404).json({ message: 'Produto não encontrado.' });
  const variants = db.prepare('SELECT id,size,color,sku,stock FROM product_variants WHERE product_id=? ORDER BY id').all(Number(req.params.id));
  res.json({ product: { ...(products[0] as object), variants } });
});

app.get('/api/favorites', auth, (req: AuthRequest, res) => res.json({ products: productRows('p.active=1 AND EXISTS (SELECT 1 FROM favorites f WHERE f.product_id=p.id AND f.user_id=?)', [req.user!.id]) }));
app.post('/api/favorites/:productId', auth, (req: AuthRequest, res) => {
  db.prepare('INSERT OR IGNORE INTO favorites(user_id,product_id) VALUES (?,?)').run(req.user!.id, Number(req.params.productId));
  res.status(201).json({ message: 'Produto adicionado aos favoritos.' });
});
app.delete('/api/favorites/:productId', auth, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id=? AND product_id=?').run(req.user!.id, Number(req.params.productId));
  res.status(204).end();
});

function cartFor(userId: number) {
  const items = db.prepare(`SELECT ci.variant_id AS variantId,ci.quantity,v.size,v.color,v.stock,p.id AS productId,p.name,p.price_cents AS priceCents,p.image_key AS imageKey
    FROM cart_items ci JOIN product_variants v ON v.id=ci.variant_id JOIN products p ON p.id=v.product_id WHERE ci.user_id=? ORDER BY p.id`).all(userId) as Array<{ variantId: number; quantity: number; size: string; color: string; stock: number; productId: number; name: string; priceCents: number; imageKey: string }>;
  return { items, totalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0), count: items.reduce((sum, item) => sum + item.quantity, 0) };
}
app.get('/api/cart', auth, (req: AuthRequest, res) => res.json({ cart: cartFor(req.user!.id) }));
app.post('/api/cart', auth, (req: AuthRequest, res) => {
  const data = validate(z.object({ variantId: z.number().int().positive(), quantity: z.number().int().min(1).max(10).default(1) }), req.body, res);
  if (!data) return;
  const variant = db.prepare('SELECT stock FROM product_variants WHERE id=?').get(data.variantId) as { stock: number } | undefined;
  if (!variant) return res.status(404).json({ message: 'Variação não encontrada.' });
  const current = db.prepare('SELECT quantity FROM cart_items WHERE user_id=? AND variant_id=?').get(req.user!.id, data.variantId) as { quantity: number } | undefined;
  const finalQuantity = (current?.quantity || 0) + data.quantity;
  if (finalQuantity > variant.stock) return res.status(409).json({ message: 'Quantidade maior que o estoque disponível.' });
  db.prepare(`INSERT INTO cart_items(user_id,variant_id,quantity) VALUES (?,?,?) ON CONFLICT(user_id,variant_id) DO UPDATE SET quantity=excluded.quantity`).run(req.user!.id, data.variantId, finalQuantity);
  res.status(201).json({ cart: cartFor(req.user!.id) });
});
app.patch('/api/cart/:variantId', auth, (req: AuthRequest, res) => {
  const data = validate(z.object({ quantity: z.number().int().min(1).max(10) }), req.body, res);
  if (!data) return;
  const variantId = Number(req.params.variantId);
  const variant = db.prepare('SELECT stock FROM product_variants WHERE id=?').get(variantId) as { stock: number } | undefined;
  if (!variant || data.quantity > variant.stock) return res.status(409).json({ message: 'Quantidade indisponível.' });
  db.prepare('UPDATE cart_items SET quantity=? WHERE user_id=? AND variant_id=?').run(data.quantity, req.user!.id, variantId);
  res.json({ cart: cartFor(req.user!.id) });
});
app.delete('/api/cart/:variantId', auth, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id=? AND variant_id=?').run(req.user!.id, Number(req.params.variantId));
  res.status(204).end();
});

app.get('/api/orders', auth, (req: AuthRequest, res) => {
  const orders = db.prepare('SELECT id,status,total_cents AS totalCents,shipping_name AS shippingName,shipping_address AS shippingAddress,created_at AS createdAt FROM orders WHERE user_id=? ORDER BY id DESC').all(req.user!.id);
  res.json({ orders });
});
app.post('/api/orders', auth, (req: AuthRequest, res) => {
  const data = validate(z.object({ shippingName: z.string().trim().min(2), shippingPhone: z.string().trim().min(8), shippingAddress: z.string().trim().min(10) }), req.body, res);
  if (!data) return;
  try {
    const orderId = db.transaction(() => {
      const cart = cartFor(req.user!.id);
      if (!cart.items.length) throw new Error('Seu carrinho está vazio.');
      for (const item of cart.items) if (item.quantity > (item as typeof item & { stock: number }).stock) throw new Error(`Estoque insuficiente para ${item.name}.`);
      const result = db.prepare('INSERT INTO orders(user_id,total_cents,shipping_name,shipping_phone,shipping_address) VALUES (?,?,?,?,?)').run(req.user!.id, cart.totalCents, data.shippingName, data.shippingPhone, data.shippingAddress);
      const orderId = Number(result.lastInsertRowid);
      const addItem = db.prepare('INSERT INTO order_items(order_id,variant_id,product_name,variant_label,unit_price_cents,quantity) VALUES (?,?,?,?,?,?)');
      const updateStock = db.prepare('UPDATE product_variants SET stock=stock-? WHERE id=? AND stock>=?');
      for (const item of cart.items as Array<typeof cart.items[number] & { stock: number; name: string; size: string; color: string; variantId: number }>) {
        if (updateStock.run(item.quantity, item.variantId, item.quantity).changes !== 1) throw new Error(`Estoque insuficiente para ${item.name}.`);
        addItem.run(orderId, item.variantId, item.name, `${item.size} / ${item.color}`, item.priceCents, item.quantity);
      }
      db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user!.id);
      return orderId;
    })();
    res.status(201).json({ message: 'Pedido criado com sucesso.', orderId, paymentStatus: 'pending', paymentNotice: 'Pagamento online ainda não está habilitado. Combine o pagamento pelo atendimento da loja.' });
  } catch (error) {
    res.status(409).json({ message: error instanceof Error ? error.message : 'Não foi possível criar o pedido.' });
  }
});

app.get('/api/admin/summary', admin, (_req, res) => {
  const counts = {
    users: (db.prepare('SELECT COUNT(*) AS total FROM users').get() as { total: number }).total,
    products: (db.prepare('SELECT COUNT(*) AS total FROM products WHERE active=1').get() as { total: number }).total,
    orders: (db.prepare('SELECT COUNT(*) AS total FROM orders').get() as { total: number }).total,
    revenueCents: (db.prepare("SELECT COALESCE(SUM(total_cents),0) AS total FROM orders WHERE status!='cancelled'").get() as { total: number }).total,
  };
  const orders = db.prepare('SELECT o.id,o.status,o.total_cents AS totalCents,o.created_at AS createdAt,u.name,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.id DESC LIMIT 20').all();
  res.json({ counts, orders, products: productRows('1=1') });
});
app.patch('/api/admin/orders/:id', admin, (req, res) => {
  const data = validate(z.object({ status: z.enum(['pending','paid','preparing','shipped','delivered','cancelled']) }), req.body, res);
  if (!data) return;
  db.prepare('UPDATE orders SET status=? WHERE id=?').run(data.status, Number(req.params.id));
  res.json({ message: 'Status atualizado.' });
});
app.get('/api/admin/products/:id/variants', admin, (req, res) => {
  const variants = db.prepare('SELECT id,size,color,sku,stock FROM product_variants WHERE product_id=? ORDER BY id').all(Number(req.params.id));
  res.json({ variants });
});
app.patch('/api/admin/products/:id/stock', admin, (req, res) => {
  const data = validate(z.object({ variantId: z.number().int().positive(), stock: z.number().int().min(0).max(999) }), req.body, res);
  if (!data) return;
  db.prepare('UPDATE product_variants SET stock=? WHERE id=? AND product_id=?').run(data.stock, data.variantId, Number(req.params.id));
  res.json({ message: 'Estoque atualizado.' });
});

app.use('/api', (_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Ocorreu um erro interno. Tente novamente.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '127.0.0.1', () => console.log(`[ToFit] API e banco prontos em http://localhost:${PORT}`));
}
export { app, db };

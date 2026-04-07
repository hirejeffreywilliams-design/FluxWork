// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import type { Express, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { storage } from './storage.js';
import { insertUserSchema, createItemSchema, updateItemSchema, searchSchema, omnivexNcHookSchema } from '../shared/schema.js';
import type { ApiResponse } from '../shared/types.js';

// Middleware: require authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ success: false, error: 'Authentication required' });
}

// Omnivex NC Engine integration hook
async function omnivexNcHook(eventType: string, entityId: string, entityType: string, payload: Record<string, unknown>) {
  const endpoint = process.env.OMNIVEX_NC_ENDPOINT;
  const apiKey = process.env.OMNIVEX_NC_API_KEY;
  if (endpoint && apiKey) {
    try {
      await fetch(`${endpoint}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify({ eventType, entityId, entityType, payload, service: 'FluxWork', timestamp: new Date().toISOString() }),
      });
    } catch (err) {
      console.warn('[FluxWork] NC Engine hook failed:', err);
    }
  }
  await storage.logNcEvent(eventType, entityId, payload);
}

function paginate(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

export function registerRoutes(app: Express) {

  // ============================================================
  // AUTH ROUTES
  // ============================================================

  // POST /api/auth/register
  app.post('/api/auth/register', async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ success: false, error: result.error.message });
    const { username, email, password, displayName } = result.data;
    const existing = await storage.getUserByUsername(username);
    if (existing) return res.status(409).json({ success: false, error: 'Username already taken' });
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) return res.status(409).json({ success: false, error: 'Email already registered' });
    const user = await storage.createUser({ username, email, password, displayName });
    await omnivexNcHook('user.registered', String(user.id), 'user', { username, email });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ success: false, error: 'Login failed after registration' });
      res.status(201).json({ success: true, data: user });
    });
  });

  // POST /api/auth/login
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: Error, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ success: false, error: info?.message || 'Invalid credentials' });
      req.login(user, async (loginErr) => {
        if (loginErr) return next(loginErr);
        await omnivexNcHook('user.login', String(user.id), 'user', { username: user.username });
        res.json({ success: true, data: user });
      });
    })(req, res, next);
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', requireAuth, async (req, res) => {
    const userId = (req.user as any)?.id;
    await omnivexNcHook('user.logout', String(userId), 'user', {});
    req.logout((err) => {
      if (err) return res.status(500).json({ success: false, error: 'Logout failed' });
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ success: true, data: req.user });
  });

  // PUT /api/auth/profile
  app.put('/api/auth/profile', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const updated = await storage.updateUser(userId, req.body);
    await omnivexNcHook('user.profile.updated', String(userId), 'user', req.body);
    res.json({ success: true, data: updated });
  });

  // ============================================================
  // GIG_LISTINGS ROUTES
  // ============================================================

  app.get('/api/gig/gig_listings', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const userId = (req.user as any).id;
    const result = await storage.listEntities('gig_listings', { userId }, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.get('/api/gig/gig_listings/:id', requireAuth, async (req, res) => {
    const item = await storage.getEntity('gig_listings', Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.post('/api/gig/gig_listings', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('gig_listings', { ...req.body, userId });
    await omnivexNcHook('gig_listings.created', String(item.id), 'gig_listings', item);
    res.status(201).json({ success: true, data: item });
  });

  app.put('/api/gig/gig_listings/:id', requireAuth, async (req, res) => {
    const item = await storage.updateEntity('gig_listings', Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    await omnivexNcHook('gig_listings.updated', String(item.id), 'gig_listings', item);
    res.json({ success: true, data: item });
  });

  app.delete('/api/gig/gig_listings/:id', requireAuth, async (req, res) => {
    const deleted = await storage.deleteEntity('gig_listings', Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    await omnivexNcHook('gig_listings.deleted', req.params.id, 'gig_listings', {});
    res.json({ success: true, message: 'Deleted successfully' });
  });

  // ============================================================
  // SKILLS ROUTES
  // ============================================================

  app.get('/api/gig/skills', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const result = await storage.listEntities('skills', undefined, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.get('/api/gig/skills/:id', requireAuth, async (req, res) => {
    const item = await storage.getEntity('skills', Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.post('/api/gig/skills', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('skills', { ...req.body, userId });
    await omnivexNcHook('skills.created', String(item.id), 'skills', item);
    res.status(201).json({ success: true, data: item });
  });

  app.put('/api/gig/skills/:id', requireAuth, async (req, res) => {
    const item = await storage.updateEntity('skills', Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    await omnivexNcHook('skills.updated', String(item.id), 'skills', item);
    res.json({ success: true, data: item });
  });

  app.delete('/api/gig/skills/:id', requireAuth, async (req, res) => {
    const deleted = await storage.deleteEntity('skills', Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  });

  // ============================================================
  // USER_SKILLS ROUTES
  // ============================================================

  app.get('/api/gig/user_skills', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const result = await storage.listEntities('user_skills', undefined, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.get('/api/gig/user_skills/:id', requireAuth, async (req, res) => {
    const item = await storage.getEntity('user_skills', Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.post('/api/gig/user_skills', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('user_skills', { ...req.body, userId });
    await omnivexNcHook('user_skills.created', String(item.id), 'user_skills', item);
    res.status(201).json({ success: true, data: item });
  });

  app.put('/api/gig/user_skills/:id', requireAuth, async (req, res) => {
    const item = await storage.updateEntity('user_skills', Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.delete('/api/gig/user_skills/:id', requireAuth, async (req, res) => {
    const deleted = await storage.deleteEntity('user_skills', Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  });

  // ============================================================
  // CONTRACTS ROUTES
  // ============================================================

  app.get('/api/gig/contracts', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const userId = (req.user as any).id;
    const result = await storage.listEntities('contracts', { userId }, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.get('/api/gig/contracts/:id', requireAuth, async (req, res) => {
    const item = await storage.getEntity('contracts', Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.post('/api/gig/contracts', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('contracts', { ...req.body, userId });
    await omnivexNcHook('contracts.created', String(item.id), 'contracts', item);
    res.status(201).json({ success: true, data: item });
  });

  app.put('/api/gig/contracts/:id', requireAuth, async (req, res) => {
    const item = await storage.updateEntity('contracts', Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.delete('/api/gig/contracts/:id', requireAuth, async (req, res) => {
    const deleted = await storage.deleteEntity('contracts', Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  });

  // ============================================================
  // PAYMENTS ROUTES
  // ============================================================

  app.get('/api/gig/payments', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const result = await storage.listEntities('payments', undefined, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.post('/api/gig/payments', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('payments', { ...req.body, userId });
    await omnivexNcHook('payments.created', String(item.id), 'payments', item);
    res.status(201).json({ success: true, data: item });
  });

  app.put('/api/gig/payments/:id', requireAuth, async (req, res) => {
    const item = await storage.updateEntity('payments', Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  // ============================================================
  // REVIEWS ROUTES
  // ============================================================

  app.get('/api/gig/reviews', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const result = await storage.listEntities('reviews', undefined, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.post('/api/gig/reviews', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('reviews', { ...req.body, userId });
    await omnivexNcHook('reviews.created', String(item.id), 'reviews', item);
    res.status(201).json({ success: true, data: item });
  });

  app.put('/api/gig/reviews/:id', requireAuth, async (req, res) => {
    const item = await storage.updateEntity('reviews', Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.delete('/api/gig/reviews/:id', requireAuth, async (req, res) => {
    const deleted = await storage.deleteEntity('reviews', Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  });

  // ============================================================
  // PORTFOLIOS ROUTES
  // ============================================================

  app.get('/api/gig/portfolios', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const result = await storage.listEntities('portfolios', undefined, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.post('/api/gig/portfolios', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('portfolios', { ...req.body, userId });
    await omnivexNcHook('portfolios.created', String(item.id), 'portfolios', item);
    res.status(201).json({ success: true, data: item });
  });

  app.put('/api/gig/portfolios/:id', requireAuth, async (req, res) => {
    const item = await storage.updateEntity('portfolios', Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  });

  // ============================================================
  // AVAILABILITY_SLOTS ROUTES
  // ============================================================

  app.get('/api/gig/availability_slots', requireAuth, async (req, res) => {
    const search = searchSchema.parse(req.query);
    const result = await storage.listEntities('availability_slots', undefined, search.page, search.limit);
    res.json({ success: true, data: result.items, pagination: paginate(search.page, search.limit, result.total) });
  });

  app.post('/api/gig/availability_slots', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const item = await storage.createEntity('availability_slots', { ...req.body, userId });
    res.status(201).json({ success: true, data: item });
  });

  // ============================================================
  // ANALYTICS & DASHBOARD ROUTES
  // ============================================================

  app.get('/api/gig/dashboard/stats', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const [gig_listingsResult, skillsResult, user_skillsResult] = await Promise.all([
      storage.listEntities('gig_listings', { userId }, 1, 5),
      storage.listEntities('skills', undefined, 1, 5),
      storage.listEntities('user_skills', undefined, 1, 5),
    ]);
    res.json({
      success: true,
      data: {
        gig_listingsCount: gig_listingsResult.total,
        skillsCount: skillsResult.total,
        user_skillsCount: user_skillsResult.total,
        omnivexNcStatus: 'active',
        service: 'FluxWork',
      },
    });
  });

  app.get('/api/gig/search', requireAuth, async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query as any;
    const [gig_listingsResult, skillsResult] = await Promise.all([
      storage.listEntities('gig_listings', undefined, Number(page), Number(limit)),
      storage.listEntities('skills', undefined, Number(page), Number(limit)),
    ]);
    const all = [...gig_listingsResult.items, ...skillsResult.items];
    const filtered = q ? all.filter(i => JSON.stringify(i).toLowerCase().includes(String(q).toLowerCase())) : all;
    res.json({ success: true, data: filtered, total: filtered.length });
  });

  // ============================================================
  // OMNIVEX NC ENGINE ROUTES
  // ============================================================

  app.post('/api/gig/nc/hook', requireAuth, async (req, res) => {
    const result = omnivexNcHookSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ success: false, error: result.error.message });
    await omnivexNcHook(result.data.eventType, result.data.entityId, result.data.entityType, result.data.payload);
    res.json({ success: true, message: 'NC hook processed', ncEngineStatus: 'active' });
  });

  app.get('/api/gig/nc/status', requireAuth, (_req, res) => {
    res.json({
      success: true,
      data: {
        service: 'FluxWork',
        ncEngineEndpoint: process.env.OMNIVEX_NC_ENDPOINT || null,
        ncEngineConfigured: !!process.env.OMNIVEX_NC_API_KEY,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.post('/api/gig/nc/analyze', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const { entityType, entityId, context } = req.body;
    await omnivexNcHook('nc.analyze.requested', String(entityId), entityType, { userId, context });
    res.json({
      success: true,
      data: {
        analysisId: `nc-${Date.now()}`,
        status: 'queued',
        estimatedMs: 1500,
        omnivexNcEngine: true,
      },
    });
  });
}

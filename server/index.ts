// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { registerRoutes } from './routes.js';
import { storage } from './storage.js';
import type { User } from '../shared/types.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security & middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'omnivex-fluxwork-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await storage.getUserByUsername(username);
    if (!user) return done(null, false, { message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return done(null, false, { message: 'Invalid credentials' });
    const { passwordHash: _, ...safeUser } = user;
    return done(null, safeUser);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    if (!user) return done(null, false);
    const { passwordHash: _, ...safeUser } = user;
    done(null, safeUser);
  } catch (err) {
    done(err);
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FluxWork', version: '1.0.0', omnivex: 'nc-engine-ready' });
});

// Register all routes
registerRoutes(app);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[FluxWork] Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[FluxWork] Server running on port ${PORT}`);
  console.log(`[FluxWork] Omnivex NC Engine: ${process.env.OMNIVEX_NC_ENDPOINT || 'not configured'}`);
});

export default app;

// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import { createServer as createViteServer } from 'vite';
import type { Express } from 'express';

export async function setupVite(app: Express) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: 'client',
  });
  app.use(vite.middlewares);
  return vite;
}

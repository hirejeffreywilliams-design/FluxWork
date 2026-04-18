import type { Request, Response } from 'express';

/**
 * Minimal health endpoint for FluxWork.
 *
 * Wire this into your express app as: app.get('/health', healthRoute)
 */
export function healthRoute(_req: Request, res: Response) {
  res.json({ ok: true, service: 'FluxWork', ts: new Date().toISOString() });
}

import { handleSync, type Env } from '../../server/core';

// Cloudflare Pages Functions: /api/sync
export const onRequest: PagesFunction<Env> = ({ request, env }) => handleSync(request, env);

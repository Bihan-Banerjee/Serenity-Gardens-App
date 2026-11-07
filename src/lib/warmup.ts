import { App as CapApp } from '@capacitor/app';
import api, { healthAPI } from './api';
import { writeCache } from './cache';
import { isNative } from './native';

// Render's free tier sleeps after ~15 minutes idle and takes up to a minute to wake.
// Waking it as soon as the app opens (and keeping it awake while the app is in use)
// means most screens find it already running.
const KEEP_ALIVE_MS = 4 * 60 * 1000;

let inFlight = false;

// Startup: /items wakes the server and pre-fills the shop cache.
function warmAndPrefill() {
  if (inFlight) return;
  inFlight = true;
  api
    .get('/items', { timeout: 90000 })
    .then((res) => { if (Array.isArray(res.data)) writeCache('items', res.data); })
    .catch(() => { /* server unreachable: screens handle their own errors */ })
    .finally(() => { inFlight = false; });
}

// Afterwards: /health keeps the server awake without touching the database.
function ping() {
  if (inFlight) return;
  inFlight = true;
  healthAPI.ping()
    .catch(() => { /* ignore */ })
    .finally(() => { inFlight = false; });
}

export function startBackendWarmup() {
  warmAndPrefill();
  setInterval(() => { if (!document.hidden) ping(); }, KEEP_ALIVE_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) ping(); });
  if (isNative) CapApp.addListener('resume', ping);
}

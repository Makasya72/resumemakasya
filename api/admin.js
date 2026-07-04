const { createHmac, randomUUID, timingSafeEqual } = require('crypto');
const { get, put } = require('@vercel/blob');

const MAX_VISITS = 1000;
const SESSION_TTL = 12 * 60 * 60 * 1000;
const VISITS_BLOB_PATH = 'analytics/visits.json';
const WRITE_RETRIES = 3;

const state = globalThis.__portfolioAdminState || {
  visits: []
};

globalThis.__portfolioAdminState = state;

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getHeader(req, name) {
  return req.headers[name.toLowerCase()] || req.headers[name] || '';
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  const raw = Buffer.concat(chunks).toString('utf8');

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getQuery(req) {
  const host = getHeader(req, 'host') || 'localhost';
  return new URL(req.url || '/', `https://${host}`).searchParams;
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !password || !secret) {
    return null;
  }

  return { username, password, secret };
}

function signToken(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url');

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token, secret) {
  if (!token || !token.includes('.')) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = createHmac('sha256', secret).update(encodedPayload).digest('base64url');

  if (!safeCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return payload.exp && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function getClientIp(req) {
  const forwardedFor = getHeader(req, 'x-forwarded-for') || getHeader(req, 'x-real-ip');
  const vercelForwardedFor = getHeader(req, 'x-vercel-forwarded-for');
  const rawIp = forwardedFor || vercelForwardedFor || req.socket?.remoteAddress || null;

  return rawIp ? String(rawIp).split(',')[0].trim() : null;
}

function decodeHeaderValue(value) {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function buildVisit(req, body = {}) {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ip: getClientIp(req),
    country: getHeader(req, 'x-vercel-ip-country') || null,
    region: getHeader(req, 'x-vercel-ip-country-region') || null,
    city: decodeHeaderValue(getHeader(req, 'x-vercel-ip-city')),
    timezone: getHeader(req, 'x-vercel-ip-timezone') || body.timezone || null,
    path: body.path || '/',
    pageTitle: body.pageTitle || null,
    siteLanguage: body.language || null,
    visitorId: body.visitorId || null,
    referrer: body.referrer || getHeader(req, 'referer') || null,
    userAgent: getHeader(req, 'user-agent') || null,
    acceptLanguage: getHeader(req, 'accept-language') || null,
    viewport: body.viewport || null
  };
}

function appendVisit(visit) {
  state.visits.unshift(visit);
  state.visits = state.visits.slice(0, MAX_VISITS);
  console.info('portfolio_visit', JSON.stringify(visit));
}

async function streamToText(stream) {
  if (!stream) {
    return '';
  }

  return new Response(stream).text();
}

function normalizeVisits(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((visit) => visit && typeof visit === 'object')
    .slice(0, MAX_VISITS);
}

async function readVisitsFromBlob() {
  try {
    const result = await get(VISITS_BLOB_PATH, { access: 'private' });

    if (!result) {
      return { configured: true, visits: [], etag: null };
    }

    const raw = await streamToText(result.stream);
    const parsed = raw ? JSON.parse(raw) : [];

    return {
      configured: true,
      visits: normalizeVisits(parsed),
      etag: result.blob.etag
    };
  } catch (error) {
    if (error?.message?.includes('BLOB_READ_WRITE_TOKEN') || error?.message?.includes('No token')) {
      return { configured: false, visits: state.visits, etag: null };
    }

    if (error?.status === 404 || error?.message?.includes('not found')) {
      return { configured: true, visits: [], etag: null };
    }

    console.error('Failed to read visits from Blob', error);
    return { configured: false, visits: state.visits, etag: null };
  }
}

async function writeVisitsToBlob(visits, etag = null) {
  const options = {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  };

  if (etag) {
    options.ifMatch = etag;
  }

  await put(VISITS_BLOB_PATH, JSON.stringify(visits), options);
}

function isPreconditionFailed(error) {
  return error?.name === 'BlobPreconditionFailedError' || error?.message?.includes('precondition');
}

async function appendVisitPersistently(visit) {
  for (let attempt = 0; attempt < WRITE_RETRIES; attempt += 1) {
    const current = await readVisitsFromBlob();
    const visits = [visit, ...current.visits].slice(0, MAX_VISITS);

    if (!current.configured) {
      appendVisit(visit);
      return { stored: false, persistent: false };
    }

    try {
      await writeVisitsToBlob(visits, current.etag);
      state.visits = visits;
      console.info('portfolio_visit', JSON.stringify(visit));
      return { stored: true, persistent: true };
    } catch (error) {
      if (isPreconditionFailed(error) && attempt < WRITE_RETRIES - 1) {
        continue;
      }

      console.error('Failed to persist visit to Blob', error);
      appendVisit(visit);
      return { stored: false, persistent: false };
    }
  }

  appendVisit(visit);
  return { stored: false, persistent: false };
}

function countBy(items, getValue) {
  return items.reduce((acc, item) => {
    const value = getValue(item) || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(counter, limit = 6) {
  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function summarizeVisits(visits) {
  const uniqueVisitors = new Set(visits.map((visit) => visit.visitorId || visit.ip).filter(Boolean));

  return {
    total: visits.length,
    unique: uniqueVisitors.size,
    countries: topEntries(countBy(visits, (visit) => [visit.country, visit.city].filter(Boolean).join(', '))),
    pages: topEntries(countBy(visits, (visit) => visit.path)),
    referrers: topEntries(countBy(visits, (visit) => visit.referrer || 'Direct'))
  };
}

function requireAdmin(req) {
  const config = getAdminConfig();

  if (!config) {
    return { ok: false, status: 503, message: 'Admin credentials are not configured' };
  }

  const auth = getHeader(req, 'authorization');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!verifyToken(token, config.secret)) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  return { ok: true, config };
}

async function handleVisit(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);
  const visit = buildVisit(req, body);
  const result = await appendVisitPersistently(visit);
  json(res, 200, { ok: true, stored: result.stored, persistent: result.persistent });
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const config = getAdminConfig();

  if (!config) {
    json(res, 503, { ok: false, error: 'Admin credentials are not configured' });
    return;
  }

  const body = await readBody(req);
  const validLogin = safeCompare(body.username, config.username) && safeCompare(body.password, config.password);

  if (!validLogin) {
    json(res, 401, { ok: false, error: 'Неверный логин или пароль' });
    return;
  }

  const token = signToken({
    sub: config.username,
    exp: Date.now() + SESSION_TTL
  }, config.secret);

  json(res, 200, { ok: true, token, expiresIn: SESSION_TTL });
}

async function handleVisits(req, res) {
  const auth = requireAdmin(req);

  if (!auth.ok) {
    json(res, auth.status, { ok: false, error: auth.message });
    return;
  }

  const query = getQuery(req);
  const limit = Math.max(1, Math.min(Number.parseInt(query.get('limit') || '300', 10) || 300, MAX_VISITS));
  const source = await readVisitsFromBlob();
  const visits = source.visits.slice(0, limit);

  json(res, 200, {
    ok: true,
    visits,
    summary: summarizeVisits(visits),
    persistentStorage: source.configured,
    volatileStorage: !source.configured
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const action = getQuery(req).get('action') || '';

    if (action === 'visit') {
      await handleVisit(req, res);
      return;
    }

    if (action === 'login') {
      await handleLogin(req, res);
      return;
    }

    if (action === 'visits') {
      await handleVisits(req, res);
      return;
    }

    json(res, 404, { ok: false, error: 'Unknown action' });
  } catch (error) {
    console.error('Admin API error', error);
    json(res, 500, { ok: false, error: 'Internal server error' });
  }
};

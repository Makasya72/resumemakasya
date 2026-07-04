const { randomUUID } = require('crypto');

const VISITS_KEY = process.env.ANALYTICS_REDIS_KEY || 'portfolio:visits';
const MAX_ENTRIES = Number.parseInt(process.env.ANALYTICS_MAX_ENTRIES || '3000', 10);

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ''),
    token
  };
}

async function redisPipeline(commands) {
  const config = getRedisConfig();

  if (!config) {
    return { configured: false, data: null };
  }

  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Redis request failed: ${response.status} ${message}`);
  }

  return { configured: true, data };
}

async function appendVisit(visit) {
  return redisPipeline([
    ['LPUSH', VISITS_KEY, JSON.stringify(visit)],
    ['LTRIM', VISITS_KEY, 0, Math.max(MAX_ENTRIES - 1, 0)]
  ]);
}

async function getVisits(limit = 500) {
  const safeLimit = Math.max(1, Math.min(Number.parseInt(limit, 10) || 500, MAX_ENTRIES));
  const result = await redisPipeline([['LRANGE', VISITS_KEY, 0, safeLimit - 1]]);

  if (!result.configured) {
    return { configured: false, visits: [] };
  }

  const rawItems = Array.isArray(result.data) && result.data[0] ? result.data[0].result || [] : [];
  const visits = rawItems
    .map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return { configured: true, visits };
}

function getHeader(req, name) {
  return req.headers[name.toLowerCase()] || req.headers[name] || '';
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

function getClientIp(req) {
  const forwardedFor = getHeader(req, 'x-forwarded-for') || getHeader(req, 'x-real-ip');
  const vercelForwardedFor = getHeader(req, 'x-vercel-forwarded-for');
  const rawIp = forwardedFor || vercelForwardedFor || req.socket?.remoteAddress || null;

  return rawIp ? String(rawIp).split(',')[0].trim() : null;
}

function buildVisit(req, body = {}) {
  const country = getHeader(req, 'x-vercel-ip-country') || null;
  const region = getHeader(req, 'x-vercel-ip-country-region') || null;
  const city = decodeHeaderValue(getHeader(req, 'x-vercel-ip-city'));
  const latitude = getHeader(req, 'x-vercel-ip-latitude') || null;
  const longitude = getHeader(req, 'x-vercel-ip-longitude') || null;
  const timezone = getHeader(req, 'x-vercel-ip-timezone') || body.timezone || null;

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ip: getClientIp(req),
    country,
    region,
    city,
    latitude,
    longitude,
    timezone,
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

function getQuery(req) {
  const host = getHeader(req, 'host') || 'localhost';
  return new URL(req.url || '/', `https://${host}`).searchParams;
}

function verifySecret(req, query, envKey = 'ANALYTICS_SECRET') {
  const secret = process.env[envKey];

  if (!secret) {
    return { ok: false, status: 503, message: `${envKey} is not configured` };
  }

  const provided = query.get('key') || getHeader(req, 'x-analytics-secret') || '';

  if (provided !== secret) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  return { ok: true };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
    .slice(0, limit);
}

function summarizeVisits(visits) {
  const uniqueVisitors = new Set(visits.map((visit) => visit.visitorId || visit.ip).filter(Boolean));

  return {
    total: visits.length,
    unique: uniqueVisitors.size,
    countries: topEntries(countBy(visits, (visit) => visit.country || visit.city)),
    pages: topEntries(countBy(visits, (visit) => visit.path)),
    referrers: topEntries(countBy(visits, (visit) => visit.referrer || 'Direct'))
  };
}

function renderVisitsHtml(visits) {
  const summary = summarizeVisits(visits);
  const rows = visits.map((visit) => `
    <tr>
      <td>${escapeHtml(new Date(visit.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' }))}</td>
      <td>${escapeHtml(visit.ip)}</td>
      <td>${escapeHtml([visit.country, visit.region, visit.city].filter(Boolean).join(', '))}</td>
      <td>${escapeHtml(visit.path)}</td>
      <td>${escapeHtml(visit.referrer || 'Direct')}</td>
      <td>${escapeHtml(visit.siteLanguage)}</td>
      <td>${escapeHtml(visit.userAgent)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Посещения сайта</title>
  <style>
    body { margin: 0; font-family: Inter, Arial, sans-serif; color: #f4f7fb; background: #0b1020; }
    main { width: min(calc(100% - 32px), 1180px); margin: 0 auto; padding: 32px 0; }
    h1 { margin: 0 0 18px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 22px; }
    .card { padding: 16px; border: 1px solid rgba(255,255,255,.09); border-radius: 16px; background: rgba(255,255,255,.06); }
    .value { display: block; margin-top: 8px; font-size: 24px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 16px; background: rgba(255,255,255,.04); }
    th, td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,.08); text-align: left; vertical-align: top; }
    th { color: #98b0ff; font-size: 13px; text-transform: uppercase; }
    td { color: #d9e2f2; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <h1>Посещения сайта</h1>
    <section class="stats">
      <div class="card">Всего визитов<span class="value">${summary.total}</span></div>
      <div class="card">Уникальные посетители<span class="value">${summary.unique}</span></div>
      <div class="card">Страны<span class="value">${escapeHtml(summary.countries.map(([name, count]) => `${name}: ${count}`).join(', ') || 'Нет данных')}</span></div>
      <div class="card">Популярные страницы<span class="value">${escapeHtml(summary.pages.map(([name, count]) => `${name}: ${count}`).join(', ') || 'Нет данных')}</span></div>
    </section>
    <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>IP</th>
          <th>Гео</th>
          <th>Страница</th>
          <th>Источник</th>
          <th>Язык</th>
          <th>User Agent</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="7">Пока нет записей.</td></tr>'}</tbody>
    </table>
  </main>
</body>
</html>`;
}

function renderVisitsCsv(visits) {
  const headers = ['createdAt', 'ip', 'country', 'region', 'city', 'path', 'referrer', 'siteLanguage', 'userAgent'];
  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = visits.map((visit) => headers.map((header) => escapeCsv(visit[header])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

module.exports = {
  appendVisit,
  buildVisit,
  escapeHtml,
  getQuery,
  getVisits,
  renderVisitsCsv,
  renderVisitsHtml,
  summarizeVisits,
  verifySecret
};

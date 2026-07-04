const { appendVisit, buildVisit } = require('./_analyticsStore');

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

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readBody(req);
    const visit = buildVisit(req, body);
    const result = await appendVisit(visit);

    if (!result.configured) {
      console.info('portfolio_visit', JSON.stringify(visit));
    }

    res.statusCode = result.configured ? 200 : 202;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, stored: result.configured }));
  } catch (error) {
    console.error('Failed to store visit', error);
    res.statusCode = 202;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, stored: false }));
  }
};

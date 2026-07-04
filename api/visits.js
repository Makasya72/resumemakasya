const {
  getQuery,
  getVisits,
  renderVisitsCsv,
  renderVisitsHtml,
  verifySecret
} = require('./_analyticsStore');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    return;
  }

  const query = getQuery(req);
  const auth = verifySecret(req, query);

  if (!auth.ok) {
    res.statusCode = auth.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: auth.message }));
    return;
  }

  try {
    const limit = query.get('limit') || '500';
    const format = query.get('format') || (req.headers.accept || '').includes('text/html') ? (query.get('format') || 'html') : 'json';
    const result = await getVisits(limit);

    if (!result.configured) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Upstash Redis is not configured' }));
      return;
    }

    if (format === 'csv') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="visits.csv"');
      res.end(renderVisitsCsv(result.visits));
      return;
    }

    if (format === 'html') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(renderVisitsHtml(result.visits));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, visits: result.visits }));
  } catch (error) {
    console.error('Failed to read visits', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Failed to read visits' }));
  }
};

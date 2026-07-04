const { escapeHtml, getVisits, summarizeVisits } = require('./_analyticsStore');

function isCronAuthorized(req) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  return req.headers.authorization === `Bearer ${secret}`;
}

function formatTop(entries) {
  return entries.length ? entries.map(([name, count]) => `${name}: ${count}`).join(', ') : 'Нет данных';
}

function buildReport(visits) {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const recentVisits = visits.filter((visit) => new Date(visit.createdAt).getTime() >= since);
  const summary = summarizeVisits(recentVisits);
  const latest = recentVisits.slice(0, 20);

  const htmlRows = latest.map((visit) => `
    <tr>
      <td>${escapeHtml(visit.createdAt)}</td>
      <td>${escapeHtml(visit.ip || '')}</td>
      <td>${escapeHtml([visit.country, visit.region, visit.city].filter(Boolean).join(', '))}</td>
      <td>${escapeHtml(visit.path || '')}</td>
      <td>${escapeHtml(visit.referrer || 'Direct')}</td>
    </tr>
  `).join('');

  return {
    summary,
    subject: `Отчет по сайту: ${summary.total} визитов за 24 часа`,
    text: [
      `Визиты за 24 часа: ${summary.total}`,
      `Уникальные посетители: ${summary.unique}`,
      `Страны: ${formatTop(summary.countries)}`,
      `Страницы: ${formatTop(summary.pages)}`,
      `Источники: ${formatTop(summary.referrers)}`
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
        <h1>Отчет по сайту за 24 часа</h1>
        <p><strong>Визиты:</strong> ${summary.total}</p>
        <p><strong>Уникальные посетители:</strong> ${summary.unique}</p>
        <p><strong>Страны:</strong> ${formatTop(summary.countries)}</p>
        <p><strong>Страницы:</strong> ${formatTop(summary.pages)}</p>
        <p><strong>Источники:</strong> ${formatTop(summary.referrers)}</p>
        <h2>Последние визиты</h2>
        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
          <thead>
            <tr>
              <th>Дата</th>
              <th>IP</th>
              <th>Гео</th>
              <th>Страница</th>
              <th>Источник</th>
            </tr>
          </thead>
          <tbody>${htmlRows || '<tr><td colspan="5">Пока нет записей.</td></tr>'}</tbody>
        </table>
      </div>
    `
  };
}

async function sendEmail(report) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_TO_EMAIL || 'makasya72@mail.ru';
  const from = process.env.REPORT_FROM_EMAIL || 'Portfolio Analytics <onboarding@resend.dev>';

  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY is not configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: report.subject,
      html: report.html,
      text: report.text
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return { sent: false, reason: data || response.statusText };
  }

  return { sent: true, data };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    return;
  }

  if (!isCronAuthorized(req)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Unauthorized' }));
    return;
  }

  try {
    const result = await getVisits(3000);

    if (!result.configured) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Upstash Redis is not configured' }));
      return;
    }

    const report = buildReport(result.visits);
    const email = await sendEmail(report);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, email, summary: report.summary }));
  } catch (error) {
    console.error('Failed to send daily report', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Failed to send daily report' }));
  }
};

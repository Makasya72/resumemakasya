const tokenKey = 'portfolioAdminToken';
const loginSection = document.querySelector('[data-admin-login]');
const dashboardSection = document.querySelector('[data-admin-dashboard]');
const form = document.querySelector('[data-admin-form]');
const message = document.querySelector('[data-admin-message]');
const rows = document.querySelector('[data-admin-rows]');
const stats = document.querySelector('[data-admin-stats]');
const note = document.querySelector('[data-admin-note]');
const refreshButton = document.querySelector('[data-admin-refresh]');
const logoutButton = document.querySelector('[data-admin-logout]');

function getToken() {
  return sessionStorage.getItem(tokenKey);
}

function setToken(token) {
  sessionStorage.setItem(tokenKey, token);
}

function clearToken() {
  sessionStorage.removeItem(tokenKey);
}

function setMessage(text, type = 'error') {
  if (!message) {
    return;
  }

  message.textContent = text;
  message.dataset.type = type;
}

function showDashboard() {
  loginSection.hidden = true;
  dashboardSection.hidden = false;
}

function showLogin() {
  loginSection.hidden = false;
  dashboardSection.hidden = true;
}

function formatDate(value) {
  return new Date(value).toLocaleString('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function shortUserAgent(value) {
  if (!value) {
    return 'Не определено';
  }

  if (value.includes('Firefox')) {
    return 'Firefox';
  }

  if (value.includes('Edg/')) {
    return 'Edge';
  }

  if (value.includes('Chrome')) {
    return 'Chrome';
  }

  if (value.includes('Safari')) {
    return 'Safari';
  }

  return value.slice(0, 80);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderStats(summary) {
  const topCountry = summary.countries?.[0];
  const topPage = summary.pages?.[0];

  stats.innerHTML = `
    <article class="admin-stat card">
      <span>Всего визитов</span>
      <strong>${escapeHtml(summary.total || 0)}</strong>
    </article>
    <article class="admin-stat card">
      <span>Уникальные посетители</span>
      <strong>${escapeHtml(summary.unique || 0)}</strong>
    </article>
    <article class="admin-stat card">
      <span>Топ гео</span>
      <strong>${escapeHtml(topCountry ? `${topCountry.name} · ${topCountry.count}` : 'Нет данных')}</strong>
    </article>
    <article class="admin-stat card">
      <span>Топ страница</span>
      <strong>${escapeHtml(topPage ? `${topPage.name} · ${topPage.count}` : 'Нет данных')}</strong>
    </article>
  `;
}

function renderRows(visits) {
  if (!visits.length) {
    rows.innerHTML = '<tr><td colspan="7">Данных пока нет.</td></tr>';
    return;
  }

  rows.innerHTML = visits.map((visit) => `
    <tr>
      <td>${escapeHtml(formatDate(visit.createdAt))}</td>
      <td>${escapeHtml(visit.ip || 'Не определено')}</td>
      <td>${escapeHtml([visit.country, visit.region, visit.city].filter(Boolean).join(', ') || 'Не определено')}</td>
      <td>${escapeHtml(visit.path || '/')}</td>
      <td>${escapeHtml(visit.referrer || 'Прямой заход')}</td>
      <td>${escapeHtml(visit.siteLanguage || 'Не определено')}</td>
      <td>${escapeHtml(shortUserAgent(visit.userAgent))}</td>
    </tr>
  `).join('');
}

async function loadVisits() {
  const token = getToken();

  if (!token) {
    showLogin();
    return;
  }

  const response = await fetch('/api/admin?action=visits&limit=500', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    clearToken();
    showLogin();
    setMessage(data.error || 'Сессия истекла. Войдите еще раз.');
    return;
  }

  showDashboard();
  if (note) {
    note.textContent = data.persistentStorage
      ? 'Данные сохраняются в постоянное private-хранилище Vercel Blob и остаются доступны после перезапуска функций.'
      : 'Хранилище временно недоступно, поэтому данные показываются из runtime-буфера.';
  }
  renderStats(data.summary);
  renderRows(data.visits);
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('');

  const formData = new FormData(form);
  const payload = {
    username: formData.get('username'),
    password: formData.get('password')
  };

  const response = await fetch('/api/admin?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    setMessage(data.error || 'Не удалось войти.');
    return;
  }

  setToken(data.token);
  form.reset();
  await loadVisits();
});

refreshButton?.addEventListener('click', loadVisits);

logoutButton?.addEventListener('click', () => {
  clearToken();
  showLogin();
});

loadVisits().catch(() => {
  showLogin();
  setMessage('Не удалось загрузить данные.');
});

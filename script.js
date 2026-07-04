const burgerButton = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu__link');

if (burgerButton && mobileMenu) {
  burgerButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('mobile-menu--open');
    burgerButton.setAttribute('aria-expanded', String(isOpen));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-menu--open');
      burgerButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const TEXT_TRANSLATIONS = {
  'Максим Фишер — Fullstack-разработчик': 'Maksim Fisher - Full-stack Developer',
  'Обо мне': 'About',
  'Навыки': 'Skills',
  'Опыт': 'Experience',
  'Проекты': 'Projects',
  'Все работы': 'All Work',
  'Контакты': 'Contacts',
  'Fullstack-разработчик · Тюмень': 'Full-stack Developer · Tyumen',
  'Максим Фишер': 'Maksim Fisher',
  'Fullstack-разработчик, который умеет не только сверстать страницу, но и подключить backend-логику, формы, CMS, базу данных и довести сайт до рабочего состояния.': 'A full-stack developer who can not only build a page, but also connect backend logic, forms, CMS, a database, and bring the website to a working state.',
  'Беру задачи от понятного UI до доработки существующего проекта: быстро разбираюсь в коде, исправляю баги, подключаю функционал и проверяю результат на реальных устройствах.': 'I handle tasks from clear UI to improving existing projects: I quickly understand code, fix bugs, connect functionality, and verify the result on real devices.',
  'Hire me / Связаться': 'Hire me / Contact',
  'Смотреть проекты': 'View Projects',
  'Открыть PDF-резюме': 'Open PDF Resume',
  'Формат работы': 'Work Format',
  'Удалённо / гибрид': 'Remote / Hybrid',
  'Стек': 'Stack',
  'HTML · CSS · JavaScript · PHP · MySQL · React · Laravel · WordPress · 1C-Битрикс': 'HTML · CSS · JavaScript · PHP · MySQL · React · Laravel · WordPress · 1C-Bitrix',
  'Ожидания': 'Looking For',
  'Fullstack-разработка, поддержка и развитие веб-проектов в продуктовой или студийной команде': 'Full-stack development, support, and growth of web projects in a product or studio team',
  'Fullstack-разработчик': 'Full-stack Developer',
  '20 лет': '20 years old',
  'Тюмень': 'Tyumen',
  'Полная занятость / проектная работа': 'Full-time / Project work',
  'Быстро включаюсь в задачи и аккуратно работаю как с интерфейсами, так и с серверной частью': 'I quickly get into tasks and work carefully with both interfaces and server-side logic',
  'Связаться': 'Contact Me',
  'Fullstack-разработчик с опытом работы над интерфейсами, backend-логикой и CMS': 'Full-stack developer experienced in interfaces, backend logic, and CMS platforms',
  'Занимаюсь fullstack-разработкой: умею собирать адаптивные интерфейсы, переносить макеты в код, дорабатывать frontend-часть, подключать серверную логику, работать с базами данных и поддерживать действующие проекты. В работе уделяю внимание структуре проекта, читаемости кода, стабильности функционала и корректной работе сайта на разных устройствах.': 'I work in full-stack development: I build responsive interfaces, turn layouts into code, improve frontend parts, connect server-side logic, work with databases, and support active projects. I pay attention to project structure, readable code, stable functionality, and correct website behavior across devices.',
  'Есть опыт работы в студии веб-разработки и коммерческих проектах: создание и поддержка сайтов, исправление багов, тестирование, интеграция функционала, работа с WordPress, Laravel и 1C-Битрикс.': 'I have experience in a web development studio and commercial projects: website creation and support, bug fixing, testing, feature integration, and work with WordPress, Laravel, and 1C-Bitrix.',
  'Адаптивная вёрстка, UI, семантика, БЭМ, формы, интерактивные блоки и клиентская логика.': 'Responsive layout, UI, semantic markup, BEM, forms, interactive blocks, and client-side logic.',
  'PHP, MySQL, обработка данных, серверная логика, интеграция функционала и доработка сайтов.': 'PHP, MySQL, data processing, server-side logic, feature integration, and website improvements.',
  'CMS / Frameworks': 'CMS / Frameworks',
  'WordPress, Laravel, 1C-Битрикс, поддержка существующих решений и разработка нового функционала.': 'WordPress, Laravel, 1C-Bitrix, support for existing solutions, and development of new functionality.',
  'Польза для команды': 'Team Value',
  'Что я могу закрыть для компании': 'What I Can Cover for a Company',
  'Адаптивная вёрстка и UI': 'Responsive Layout and UI',
  'Собираю страницы по макету, аккуратно работаю с сетками, состояниями, мобильной версией и интерактивными блоками.': 'I build pages from layouts and carefully handle grids, states, mobile versions, and interactive blocks.',
  'CMS и готовые сайты': 'CMS and Existing Websites',
  'Дорабатываю WordPress, Laravel и 1C-Битрикс: формы, шаблоны, карточки, каталоги, контентные разделы и мелкие правки без поломки текущей логики.': 'I improve WordPress, Laravel, and 1C-Bitrix: forms, templates, cards, catalogs, content sections, and small fixes without breaking current logic.',
  'Backend и данные': 'Backend and Data',
  'Подключаю обработку форм, CRUD-сценарии, работу с MySQL, API-интеграции и серверную логику для пользовательских действий.': 'I connect form processing, CRUD scenarios, MySQL work, API integrations, and server-side logic for user actions.',
  'Поддержка и исправления': 'Support and Fixes',
  'Разбираюсь в чужом коде, нахожу причины ошибок, проверяю результат и довожу задачу до состояния, которое можно показывать клиенту.': 'I understand existing code, find root causes of issues, verify the result, and bring tasks to a state that can be shown to a client.',
  'Рабочий подход': 'Work Approach',
  'Почему со мной удобно работать': 'Why It Is Easy to Work with Me',
  'Быстро вхожу в проект': 'I Quickly Get into Projects',
  'Сначала смотрю структуру, активные файлы и текущую логику, чтобы не ломать уже работающие части сайта.': 'I first inspect the structure, active files, and current logic so I do not break working parts of the website.',
  'Думаю о результате': 'I Focus on the Result',
  'Не останавливаюсь на “код написан”: проверяю страницу, форму, мобильную версию и реальные пользовательские сценарии.': 'I do not stop at “the code is written”: I check the page, form, mobile version, and real user scenarios.',
  'Аккуратно работаю с правками': 'I Keep Changes Careful',
  'Держу изменения точечными, не переписываю лишнее и учитываю существующий стиль проекта.': 'I keep changes focused, avoid rewriting unnecessary parts, and follow the existing project style.',
  'Технологии и инструменты': 'Technologies and Tools',
  'Уровень владения': 'Skill Level',
  'Ключевые технологии, с которыми работаю в проектах чаще всего.': 'Key technologies I use most often in projects.',
  '1C-Битрикс': '1C-Bitrix',
  'Основной стек': 'Main Stack',
  'Адаптивная вёрстка': 'Responsive Layout',
  'БЭМ': 'BEM',
  'CMS и фреймворки': 'CMS and Frameworks',
  'Что делаю в проектах': 'What I Do in Projects',
  'Верстаю страницы и интерфейсы по макету': 'Build pages and interfaces from layouts',
  'Подключаю формы, кнопки, меню, модальные окна, табы и интерактивные элементы': 'Connect forms, buttons, menus, modals, tabs, and interactive elements',
  'Реализую серверную логику и обработку данных': 'Implement server-side logic and data processing',
  'Работаю с базами данных, CMS и backend-частью проектов': 'Work with databases, CMS platforms, and project backend parts',
  'Дорабатываю существующие сайты и исправляю баги': 'Improve existing websites and fix bugs',
  'Слежу за корректной работой на мобильных устройствах и стабильностью функционала': 'Keep mobile behavior correct and functionality stable',
  'Практический опыт и образование': 'Practical Experience and Education',
  'март 2023 — август 2024': 'March 2023 - August 2024',
  'Digital Studio WW · Программист-разработчик': 'Digital Studio WW · Developer',
  'Занимался созданием и поддержкой веб-страниц, работал с HTML, CSS, JavaScript и базовой backend-логикой, помогал в реализации клиентских проектов, исправлял ошибки, тестировал интерфейсы и участвовал в переносе макетов в код. Работал над доработкой сайтов и поддержкой существующих решений.': 'Created and supported web pages, worked with HTML, CSS, JavaScript, and basic backend logic, helped implement client projects, fixed bugs, tested interfaces, and helped turn layouts into code. Worked on improving websites and supporting existing solutions.',
  'сентябрь 2024 — апрель 2026': 'September 2024 - April 2026',
  'Чипмедиа.ру · Fullstack-разработчик': 'Chipmedia.ru · Full-stack Developer',
  'Работал в компании fullstack-разработчиком, занимался созданием и доработкой веб-проектов. Участвовал в разработке клиентской части сайтов, работал с HTML, CSS, JavaScript, а также с серверной логикой, базами данных и интеграцией функционала. Решал задачи по вёрстке, адаптации интерфейсов, подключению форм, обработке данных, поддержке проектов и работе с WordPress, Laravel и 1C-Битрикс.': 'Worked as a full-stack developer, building and improving web projects. Participated in frontend development, worked with HTML, CSS, JavaScript, server-side logic, databases, and feature integration. Solved tasks related to layout, interface adaptation, form integration, data processing, project support, and work with WordPress, Laravel, and 1C-Bitrix.',
  'ТТСИиГХ · Информационные системы и программирование': 'TTSIiGH · Information Systems and Programming',
  'Среднее специальное образование с уклоном в веб-дизайн и разработку. Во время обучения закреплял навыки frontend и backend-разработки, работы с базами данных и структуры веб-проектов.': 'Secondary vocational education focused on web design and development. During my studies, I strengthened frontend and backend development skills, database work, and web project structure.',
  'Портфолио': 'Portfolio',
  'Реальные проекты': 'Real Projects',
  'Смотреть все работы': 'View All Work',
  'Корпоративный сайт': 'Corporate Website',
  'Сайт для сервиса дистанционных медицинских осмотров: презентация продукта, преимущества, кейсы, формы заявок и контентные блоки для B2B-аудитории. Работа включала доработку интерфейсов, поддержку страниц и развитие функционала.': 'Website for a remote medical examination service: product presentation, benefits, cases, request forms, and content blocks for a B2B audience. The work included interface improvements, page support, and feature development.',
  'Формы и CTA': 'Forms and CTAs',
  'Перейти на сайт': 'Open Website',
  'Сервисный сайт': 'Service Website',
  'Сайт службы автопомощи с акцентом на быстрый вызов, список услуг, контактные сценарии, мессенджеры и понятную подачу преимуществ сервиса 24/7. В проекте выполнял доработку интерфейсов, форм и общей логики работы сайта.': 'Website for a roadside assistance service focused on quick requests, service lists, contact scenarios, messengers, and clear 24/7 service benefits. I improved interfaces, forms, and the overall website logic.',
  'UI для услуг': 'Service UI',
  'Интерактивные формы': 'Interactive Forms',
  'Поддержка проекта': 'Project Support',
  'Каталог / сервис недвижимости': 'Real Estate Catalog / Service',
  'Недвижимость и цены': 'Real Estate and Prices',
  'Многостраничный сайт по недвижимости с каталогом объектов, разделами ипотеки, услуг, фильтрами, карточками предложений и сложной контентной структурой. Разработан на базе CMS 1C-Битрикс с использованием базы данных.': 'Multi-page real estate website with a property catalog, mortgage and service sections, filters, offer cards, and a complex content structure. Built on the 1C-Bitrix CMS with database usage.',
  'Каталог': 'Catalog',
  'Фильтры и разделы': 'Filters and Sections',
  'Сложная структура': 'Complex Structure',
  'Готов обсудить работу над проектом или постоянную позицию': 'Ready to discuss project work or a permanent position',
  'Открыт к предложениям по fullstack-разработке, доработке сайтов, backend/frontend задачам и работе в команде. Удобнее всего связаться по телефону или электронной почте.': 'Open to offers in full-stack development, website improvements, backend/frontend tasks, and teamwork. The easiest way to contact me is by phone or email.',
  'Телефон': 'Phone',
  'Город': 'City',
  'Режим работы': 'Work Mode',
  'Удалённо / гибрид / проектная занятость': 'Remote / Hybrid / Project work',
  '© 2026 Максим Фишер — Fullstack-разработчик': '© 2026 Maksim Fisher - Full-stack Developer',
  'Наверх': 'Back to Top',
  'Все работы — Максим Фишер': 'All Work - Maksim Fisher',
  'Портфолио · Все проекты': 'Portfolio · All Projects',
  'Подборка сайтов, над которыми я работал: корпоративные проекты, каталоги, сервисные сайты, лендинги и многостраничные решения с формами, контентными разделами и адаптивными интерфейсами.': 'A selection of websites I worked on: corporate projects, catalogs, service websites, landing pages, and multi-page solutions with forms, content sections, and responsive interfaces.',
  'Обсудить проект': 'Discuss a Project',
  'Вернуться на главную': 'Back to Home',
  'Работы': 'Work',
  'Сайты и веб-проекты': 'Websites and Web Projects',
  'Сайт сервиса дистанционных медицинских осмотров для B2B-аудитории: презентация продукта, преимущества, кейсы, формы заявок и контентные блоки. Работа включала доработку интерфейсов, поддержку страниц и развитие функционала.': 'Website for a remote medical examination service for a B2B audience: product presentation, benefits, cases, request forms, and content blocks. The work included interface improvements, page support, and feature development.',
  'Сайт службы автопомощи с акцентом на быстрый вызов, список услуг, контактные сценарии, мессенджеры и понятную подачу преимуществ сервиса 24/7. Выполнял доработку интерфейсов, форм и общей логики работы сайта.': 'Website for a roadside assistance service focused on quick requests, service lists, contact scenarios, messengers, and clear 24/7 service benefits. I improved interfaces, forms, and the overall website logic.',
  'Многостраничный сайт по недвижимости с каталогом объектов, разделами ипотеки и услуг, фильтрами, карточками предложений и сложной контентной структурой. Проект реализован на базе CMS 1C-Битрикс с использованием базы данных.': 'Multi-page real estate website with a property catalog, mortgage and service sections, filters, offer cards, and a complex content structure. The project was built on the 1C-Bitrix CMS with database usage.',
  'Сайт фитнес-клуба': 'Fitness Club Website',
  'Сайт фитнес-клуба с бассейном, расписанием, услугами, разделами о клубе, команде, картах и контактных формах. В проекте важны удобная структура услуг, адаптивность, навигация и быстрые сценарии записи для посетителей.': 'Fitness club website with a pool, schedule, services, sections about the club, team, cards, and contact forms. The project focuses on a clear service structure, responsiveness, navigation, and quick booking scenarios for visitors.',
  'Услуги и расписание': 'Services and Schedule',
  'Формы заявок': 'Request Forms',
  'Медицинский сайт': 'Medical Website',
  'Аветтура': 'Avettura',
  'Сайт ветеринарной клиники в Москве с презентацией услуг, врачей, отзывов, прайса, полезных материалов и записью на приём. Основной фокус — доверительная подача информации, понятная навигация и удобный путь пользователя к обращению.': 'Website for a veterinary clinic in Moscow with services, doctors, reviews, prices, useful materials, and appointment booking. The main focus is trustworthy information, clear navigation, and an easy path to contact.',
  'Услуги и врачи': 'Services and Doctors',
  'Запись на приём': 'Appointment Booking',
  'Контентные разделы': 'Content Sections',
  'Образовательный сайт': 'Educational Website',
  'Сайт компании по поступлению в зарубежные университеты: направления по странам, подбор программ, описание этапов работы, услуг, преимуществ и заявок. В проекте важны многоязычность, структура каталога и удобная подача большого объёма информации.': 'Website for a company helping students apply to foreign universities: country directions, program selection, workflow stages, services, benefits, and request forms. Multilingual support, catalog structure, and clear presentation of large information volumes are important in this project.',
  'Каталог программ': 'Program Catalog',
  'Многоязычность': 'Multilingual Support',
  'Корпоративный каталог': 'Corporate Catalog',
  'ПРОТЕХСТРОЙ': 'PROTEHSTROI',
  'Сайт завода железобетонных изделий и конструкций с каталогом продукции, разделами по направлениям, карточками товаров, контактами, заявками и коммерческой структурой для B2B-заказчиков.': 'Website for a reinforced concrete products and structures factory with a product catalog, category sections, product cards, contacts, requests, and a commercial structure for B2B customers.',
  'Каталог продукции': 'Product Catalog',
  'Карточки товаров': 'Product Cards',
  'Каталог / лендинг': 'Catalog / Landing Page',
  'Сайт поставщика пищевой закиси азота с каталогом баллонов, условиями доставки, блоком документов, FAQ, быстрыми CTA и переходом в Telegram. В проекте сделан акцент на понятную структуру, карточки товаров и конверсионные сценарии.': 'Website for a food-grade nitrous oxide supplier with a cylinder catalog, delivery terms, document block, FAQ, quick CTAs, and Telegram transition. The project focuses on clear structure, product cards, and conversion scenarios.',
  'Каталог товаров': 'Product Catalog',
  'Доставка': 'Delivery',
  'CTA и Telegram': 'CTA and Telegram',
  'На главную': 'Home'
};

const ATTRIBUTE_TRANSLATIONS = {
  'Открыть меню': 'Open menu',
  'Основная навигация': 'Primary navigation',
  'Переключить язык': 'Switch language',
  'Социальные сети': 'Social networks',
  'Telegram Makasya_tmn': 'Telegram Makasya_tmn',
  'Написать на mail.ru': 'Write to mail.ru',
  'GitHub Makasya72': 'GitHub Makasya72',
  'Контакты в соцсетях': 'Social contacts'
};

const META_TRANSLATIONS = {
  'Максим Фишер — fullstack-разработчик. Портфолио, стек, опыт и контакты.': 'Maksim Fisher - full-stack developer. Portfolio, stack, experience, and contacts.',
  'Все работы Максима Фишера — сайты, каталоги, лендинги и корпоративные проекты.': 'All work by Maksim Fisher - websites, catalogs, landing pages, and corporate projects.'
};

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function withOriginalWhitespace(original, translated) {
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

function getStoredLanguage() {
  try {
    return localStorage.getItem('siteLanguage') === 'en' ? 'en' : 'ru';
  } catch {
    return 'ru';
  }
}

function setStoredLanguage(language) {
  try {
    localStorage.setItem('siteLanguage', language);
  } catch {
    return;
  }
}

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'SVG'].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return normalizeText(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }

  return nodes;
}

function applyLanguage(language) {
  const isEnglish = language === 'en';

  document.documentElement.lang = isEnglish ? 'en' : 'ru';
  document.body.dataset.lang = language;

  collectTextNodes(document.body).forEach((node) => {
    if (!node.__ruText) {
      node.__ruText = node.textContent;
    }

    if (!isEnglish) {
      node.textContent = node.__ruText;
      return;
    }

    const key = normalizeText(node.__ruText);
    const translated = TEXT_TRANSLATIONS[key];
    if (translated) {
      node.textContent = withOriginalWhitespace(node.__ruText, translated);
    }
  });

  document.querySelectorAll('[aria-label]').forEach((element) => {
    if (!element.__ruAriaLabel) {
      element.__ruAriaLabel = element.getAttribute('aria-label');
    }

    const original = element.__ruAriaLabel;
    const translated = ATTRIBUTE_TRANSLATIONS[original];
    element.setAttribute('aria-label', isEnglish && translated ? translated : original);
  });

  const titleKey = document.__ruTitle || document.title;
  document.__ruTitle = titleKey;
  document.title = isEnglish && TEXT_TRANSLATIONS[titleKey] ? TEXT_TRANSLATIONS[titleKey] : titleKey;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    const original = metaDescription.__ruContent || metaDescription.getAttribute('content');
    metaDescription.__ruContent = original;
    const translated = META_TRANSLATIONS[original];
    metaDescription.setAttribute('content', isEnglish && translated ? translated : original);
  }

  document.querySelectorAll('[data-lang-toggle]').forEach((toggle) => {
    toggle.dataset.currentLang = language;
    toggle.setAttribute('aria-pressed', String(isEnglish));
  });
}

function initLanguageSwitcher() {
  const toggles = document.querySelectorAll('[data-lang-toggle]');
  if (!toggles.length) {
    return;
  }

  applyLanguage(getStoredLanguage());

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const nextLanguage = document.body.dataset.lang === 'en' ? 'ru' : 'en';
      setStoredLanguage(nextLanguage);
      applyLanguage(nextLanguage);
    });
  });
}

function getVisitorId() {
  const storageKey = 'portfolioVisitorId';

  try {
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(storageKey, id);
    return id;
  } catch {
    return null;
  }
}

function trackVisit() {
  const payload = {
    path: `${location.pathname}${location.search}${location.hash}`,
    pageTitle: document.title,
    language: document.documentElement.lang,
    visitorId: getVisitorId(),
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon('/api/admin?action=visit', new Blob([body], { type: 'application/json' }));
    if (sent) {
      return;
    }
  }

  fetch('/api/admin?action=visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {});
}

initLanguageSwitcher();
trackVisit();

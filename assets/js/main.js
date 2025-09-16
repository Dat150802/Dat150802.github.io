const body = document.body;
const themeSwitch = document.querySelector('.theme-switch');
const themeLabel = document.querySelector('.theme-switch__label');
const subnavToggle = document.querySelector('.subnav__toggle');
const subnavLinks = document.querySelector('.subnav__links');
const form = document.querySelector('.contact__form');

const THEME_KEY = 'intranet-theme';

function setTheme(theme) {
  body.setAttribute('data-theme', theme);
  themeLabel.textContent = theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối';
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    setTheme(stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }
}

initTheme();

themeSwitch?.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
});

subnavToggle?.addEventListener('click', () => {
  const expanded = subnavToggle.getAttribute('aria-expanded') === 'true';
  subnavToggle.setAttribute('aria-expanded', String(!expanded));
  subnavLinks.setAttribute('aria-hidden', expanded ? 'true' : 'false');
});

subnavLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 720) {
      subnavToggle.setAttribute('aria-expanded', 'false');
      subnavLinks.setAttribute('aria-hidden', 'true');
    }
  });
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get('name');
  const department = formData.get('department');
  const message = formData.get('message');

  const summary = `Cảm ơn ${name}!\n\n` +
    `Phòng ban: ${department}\n` +
    `Nội dung: ${message}`;

  alert(summary);
  form.reset();
});

// ── Dark mode toggle ──
const toggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check if user previously chose dark mode
if (localStorage.getItem('theme') === 'dark') {
  html.setAttribute('data-theme', 'dark');
  toggle.textContent = 'Light mode';
}

toggle.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  toggle.textContent = isDark ? 'Dark mode' : 'Light mode';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

// ── Smooth scroll for nav links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Contact form ──
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  const name = document.getElementById('nameInput').value;

  // In a real project you'd send this to a backend or EmailJS
  // For now, we simulate a successful send
  status.textContent = `Thanks ${name}! I'll get back to you soon.`;

  // Clear the form
  e.target.reset();

  // Clear the message after 4 seconds
  setTimeout(() => { status.textContent = ''; }, 4000);
});

// ── Fade-in sections on scroll ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(24px)';
  section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(section);
});
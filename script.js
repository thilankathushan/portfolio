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
// ── EmailJS setup ──
const EMAILJS_PUBLIC_KEY  = 'h2plFolS2A2_VLAQp'; 
const EMAILJS_SERVICE_ID  = 'portfolio_service'; 
const EMAILJS_TEMPLATE_ID = 'template_8tzg5sp';

emailjs.init(EMAILJS_PUBLIC_KEY);

// ── Contact form submission ──
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const submitBtn  = document.getElementById('submitBtn');
  const status     = document.getElementById('formStatus');

  // Disable the button while sending so user can't double-submit
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  status.textContent = '';
  status.style.color = 'var(--accent)';

  // emailjs.sendForm reads the name="" attributes from your form fields
  // and matches them to {{variables}} in your template automatically
  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
    .then(() => {
      // Success
      status.textContent = 'Message sent! I\'ll get back to you soon.';
      status.style.color = 'var(--low)'; // green
      this.reset();
    })
    .catch((error) => {
      // Something went wrong
      console.error('EmailJS error:', error);
      status.textContent = 'Something went wrong. Try emailing me directly.';
      status.style.color = 'var(--high)'; // red
    })
    .finally(() => {
      // Re-enable the button either way
      submitBtn.textContent = 'Send message';
      submitBtn.disabled = false;
    });
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
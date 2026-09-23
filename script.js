// ══════════════════════════════════════════
//  Portfolio interactions
// ══════════════════════════════════════════
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

// ── Theme toggle ──
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Restore saved theme (default is dark, set in HTML)
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ── Mobile nav ──
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
const toggleMenu = (force) => {
  const open = force !== undefined ? force : !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', open);
  burger.classList.toggle('open', open);
};
burger.addEventListener('click', () => toggleMenu());

// ── Smooth scroll + close menu ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      toggleMenu(false);
    }
  });
});

// ── Navbar scrolled state + scroll progress + back-to-top ──
const navbar = document.getElementById('navbar');
const progress = document.getElementById('scrollProgress');
const toTop = document.getElementById('toTop');

const onScroll = () => {
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  navbar.classList.toggle('scrolled', y > 20);
  toTop.classList.toggle('show', y > 600);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

// ── Scrollspy (active nav link) ──
const sections = document.querySelectorAll('section[id], header[id]');
const navMap = {};
document.querySelectorAll('.nav-link').forEach(l => { navMap[l.getAttribute('href').slice(1)] = l; });

const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const link = navMap[entry.target.id];
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

// ── Scroll reveal ──
// Modern browsers use CSS scroll-driven animations (smooth, in + out).
// Older browsers fall back to this one-way IntersectionObserver reveal.
const supportsScrollTimeline = CSS.supports && CSS.supports('animation-timeline: view()');

if (!supportsScrollTimeline) {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const sibs = Array.from(el.parentElement.querySelectorAll(':scope > [data-reveal]'));
    el.style.transitionDelay = (sibs.indexOf(el) * 0.08) + 's';
    revealObserver.observe(el);
  });
}

// ── Animated count-up stats ──
const animateCount = (el) => {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const statObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat-num').forEach(s => statObserver.observe(s));

// ── Typed role text ──
const roleEl = document.getElementById('roleTyped');
const phrases = ['AI-powered tools.', 'full-stack apps.', 'embedded hardware.', 'for real clients.', 'with machine learning.'];
if (roleEl && !prefersReduced) {
  let pi = 0, ci = 0, deleting = false;
  const type = () => {
    const word = phrases[pi];
    roleEl.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(type, 70); }
    else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1600); }
    else if (deleting && ci > 0) { ci--; setTimeout(type, 35); }
    else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 350); }
  };
  type();
} else if (roleEl) {
  roleEl.textContent = phrases[0];
}

// ── Project filters ──
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('#miniGrid .project-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(card => {
      const cat = card.dataset.category;
      const show = f === 'all'
        || cat === f
        || (f === 'React' && (cat === 'React' || cat === 'JavaScript' || cat === 'API'));
      card.classList.toggle('hide', !show);
    });
  });
});

// ── Photo sliders ──
document.querySelectorAll('[data-slider]').forEach(slider => {
  const slides = slider.querySelectorAll('img');
  const dotsWrap = slider.querySelector('.slide-dots');
  let current = 0;
  let timer;

  const dots = Array.from(slides, (_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show photo ${i + 1}`);
    dot.addEventListener('click', () => { show(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('active', j === current));
    dots.forEach((d, j) => d.classList.toggle('active', j === current));
  }
  function restart() {
    clearInterval(timer);
    if (!prefersReduced) timer = setInterval(() => show(current + 1), 4500);
  }

  slider.querySelector('.prev').addEventListener('click', () => { show(current - 1); restart(); });
  slider.querySelector('.next').addEventListener('click', () => { show(current + 1); restart(); });
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', restart);

  let startX = null;
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });

  show(0);
  restart();
});

// ── 3D tilt + cursor sheen on project cards ──
if (!isTouch && !prefersReduced) {
  document.querySelectorAll('.project-card.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -8;
      const ry = (px - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ── Photo tilt ──
const photoStage = document.getElementById('photoStage');
if (photoStage && !isTouch && !prefersReduced) {
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    photoStage.style.transform = `rotateY(${px * 10}deg) rotateX(${py * -10}deg)`;
  });
  hero.addEventListener('mouseleave', () => { photoStage.style.transform = ''; });
}

// ── Magnetic buttons ──
if (!isTouch && !prefersReduced) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ── Cursor glow ──
const cursorGlow = document.getElementById('cursorGlow');
if (!isTouch && !prefersReduced && cursorGlow) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursorGlow.style.opacity = '1'; });
  window.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
  const render = () => {
    cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
    cursorGlow.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(render);
  };
  render();
}

// ── Year in footer ──
document.getElementById('year').textContent = new Date().getFullYear();

// ══════════════════════════════════════════
//  EmailJS contact form  (unchanged config)
// ══════════════════════════════════════════
const EMAILJS_PUBLIC_KEY  = 'h2plFolS2A2_VLAQp';
const EMAILJS_SERVICE_ID  = 'portfolio_service';
const EMAILJS_TEMPLATE_ID = 'template_8tzg5sp';

emailjs.init(EMAILJS_PUBLIC_KEY);

document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');

  submitBtn.querySelector('span').textContent = 'Sending...';
  submitBtn.disabled = true;
  status.textContent = '';
  status.style.color = 'var(--accent)';

  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
    .then(() => {
      status.textContent = "Message sent! I'll get back to you soon.";
      status.style.color = 'var(--low)';
      this.reset();
    })
    .catch((error) => {
      console.error('EmailJS error:', error);
      status.textContent = 'Something went wrong. Try emailing me directly.';
      status.style.color = 'var(--high)';
    })
    .finally(() => {
      submitBtn.querySelector('span').textContent = 'Send message';
      submitBtn.disabled = false;
    });
});

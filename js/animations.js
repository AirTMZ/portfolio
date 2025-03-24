document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    if (section.id !== 'contact') { // Exclude the "Get In Touch" section
      const effects = ['fade-up', 'fade-in', 'slide-in', 'zoom-in', 'flip-in'];
      const effect = effects[index % effects.length];

      section.classList.add('reveal');
      section.dataset.revealEffect = effect;
      section.dataset.revealDelay = (index * 0.1) + 's';

      const headings = section.querySelectorAll('h2, h3');
      const paragraphs = section.querySelectorAll('p:not(.about-text)');

      headings.forEach(heading => {
        heading.classList.add('reveal-child');
        heading.dataset.revealEffect = 'fade-up';
      });

      paragraphs.forEach(para => {
        para.classList.add('reveal-child');
        para.dataset.revealEffect = 'fade-in';
      });
    }
  });

  const projectCards = document.querySelectorAll('.project-card');
  addStaggeredAnimation(projectCards, 'slide-up');

  const skills = document.querySelectorAll('.skill');
  addStaggeredAnimation(skills, 'zoom-in');

  const timelineItems = document.querySelectorAll('.timeline-item');
  addStaggeredAnimation(timelineItems, 'slide-in');

  checkVisibility();
  window.addEventListener('scroll', throttle(checkVisibility, 100));

  window.addEventListener('mousemove', throttle(moveShapes, 10));
});

function addStaggeredAnimation(elements, effect = 'fade-up') {
  elements.forEach((el, index) => {
    el.classList.add('stagger-animation');
    el.dataset.revealEffect = effect;
    el.style.animationDelay = `${index * 0.1}s`;
  });
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function checkVisibility() {
  requestAnimationFrame(() => {
    const reveals = document.querySelectorAll('.reveal:not(.active), .stagger-animation:not(.active), .reveal-child:not(.active)');
    const windowHeight = window.innerHeight;

    reveals.forEach(reveal => {
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 100;

      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add('active');

        const effect = reveal.dataset.revealEffect || 'fade-up';
        const delay = reveal.dataset.revealDelay || '0s';

        reveal.style.transitionDelay = delay;
        reveal.classList.add(effect);

        if (reveal.classList.contains('reveal')) {
          const children = reveal.querySelectorAll('.reveal-child:not(.active)');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('active');
              const childEffect = child.dataset.revealEffect || 'fade-up';
              child.classList.add(childEffect);
            }, 150 + (index * 70));
          });
        }
      }
    });
  });
}

function moveShapes(e) {
  requestAnimationFrame(() => {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 0.01;
      const x = (mouseX - window.innerWidth/2) * speed;
      const y = (mouseY - window.innerHeight/2) * speed;

      shape.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  createParticleBackground();
});

function createParticleBackground() {
  const container = document.querySelector('body');

  if (!container) return;

  const particleContainer = document.createElement('div');
  particleContainer.classList.add('particle-background');
  particleContainer.style.position = 'fixed';
  particleContainer.style.top = '0';
  particleContainer.style.left = '0';
  particleContainer.style.width = '100%';
  particleContainer.style.height = '100%';
  particleContainer.style.pointerEvents = 'none';
  particleContainer.style.zIndex = '-1';

  container.prepend(particleContainer);

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    particle.style.position = 'absolute';
    particle.style.width = `${Math.random() * 3 + 1}px`;
    particle.style.height = particle.style.width;
    particle.style.background = 'var(--primary)';
    particle.style.opacity = `${Math.random() * 0.3 + 0.1}`;
    particle.style.borderRadius = '50%';

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    particle.style.top = `${y}%`;
    particle.style.left = `${x}%`;

    const duration = Math.random() * 30 + 20;
    particle.style.animation = `floatParticle ${duration}s infinite ease-in-out`;
    particle.style.animationDelay = `${Math.random() * 10}s`;

    particleContainer.appendChild(particle);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatParticle {
      0%, 100% {
        transform: translate(0, 0);
      }
      25% {
        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px);
      }
      50% {
        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px);
      }
      75% {
        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px);
      }
    }
  `;
  document.head.appendChild(style);
}
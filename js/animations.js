document.addEventListener('DOMContentLoaded', function() {
  // Add reveal class to sections for animation with different effects
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    // Apply different reveal effects to each section
    const effects = ['fade-up', 'fade-in', 'slide-in', 'zoom-in', 'flip-in'];
    const effect = effects[index % effects.length]; // Cycle through effects

    section.classList.add('reveal');
    section.dataset.revealEffect = effect;
    section.dataset.revealDelay = (index * 0.1) + 's';

    // Add staggered reveal to section headings and paragraphs
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
  });

  // Add staggered animation to project cards, skills, and timeline items
  const projectCards = document.querySelectorAll('.project-card');
  addStaggeredAnimation(projectCards, 'slide-up');

  const skills = document.querySelectorAll('.skill');
  addStaggeredAnimation(skills, 'zoom-in');

  const timelineItems = document.querySelectorAll('.timeline-item');
  addStaggeredAnimation(timelineItems, 'slide-in');

  // Check if elements are in viewport on load and scroll
  checkVisibility();
  window.addEventListener('scroll', throttle(checkVisibility, 100));

  // Add parallax effect to shapes
  window.addEventListener('mousemove', throttle(moveShapes, 10));
});

// Add class for staggered animations with effects
function addStaggeredAnimation(elements, effect = 'fade-up') {
  elements.forEach((el, index) => {
    el.classList.add('stagger-animation');
    el.dataset.revealEffect = effect;
    el.style.animationDelay = `${index * 0.1}s`;
  });
}

// Throttle function to improve performance
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

// Improved check if elements are visible in viewport with intersection observer
function checkVisibility() {
  // Use requestAnimationFrame for smoother animations
  requestAnimationFrame(() => {
    const reveals = document.querySelectorAll('.reveal:not(.active), .stagger-animation:not(.active), .reveal-child:not(.active)');
    const windowHeight = window.innerHeight;

    reveals.forEach(reveal => {
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 100; // Trigger earlier for a smoother effect

      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add('active');

        // Get custom effect and delay from data attributes
        const effect = reveal.dataset.revealEffect || 'fade-up';
        const delay = reveal.dataset.revealDelay || '0s';

        // Apply custom effect and delay
        reveal.style.transitionDelay = delay;
        reveal.classList.add(effect);

        // Reveal children with sequence
        if (reveal.classList.contains('reveal')) {
          const children = reveal.querySelectorAll('.reveal-child:not(.active)');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('active');
              const childEffect = child.dataset.revealEffect || 'fade-up';
              child.classList.add(childEffect);
            }, 150 + (index * 70)); // Reduced from 200 + (index * 100)
          });
        }
      }
    });
  });
}

// Parallax effect for shapes with improved performance
function moveShapes(e) {
  requestAnimationFrame(() => {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 0.01;
      const x = (mouseX - window.innerWidth/2) * speed;
      const y = (mouseY - window.innerHeight/2) * speed;

      // Use transform3d for hardware acceleration
      shape.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });
}

// Add subtle background animation
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

    // Random particle styling
    particle.style.position = 'absolute';
    particle.style.width = `${Math.random() * 3 + 1}px`;
    particle.style.height = particle.style.width;
    particle.style.background = 'var(--primary)';
    particle.style.opacity = `${Math.random() * 0.3 + 0.1}`;
    particle.style.borderRadius = '50%';

    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    particle.style.top = `${y}%`;
    particle.style.left = `${x}%`;

    // Random animation
    const duration = Math.random() * 30 + 20;
    particle.style.animation = `floatParticle ${duration}s infinite ease-in-out`;
    particle.style.animationDelay = `${Math.random() * 10}s`;

    particleContainer.appendChild(particle);
  }

  // Add keyframe animation to stylesheet
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
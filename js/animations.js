document.addEventListener('DOMContentLoaded', function() {
  // Add reveal class to sections for animation
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.classList.add('reveal');
  });

  // Add staggered animation to project cards, skills, and timeline items
  const projectCards = document.querySelectorAll('.project-card');
  addStaggeredAnimation(projectCards);

  const skills = document.querySelectorAll('.skill');
  addStaggeredAnimation(skills);

  const timelineItems = document.querySelectorAll('.timeline-item');
  addStaggeredAnimation(timelineItems);

  // Check if elements are in viewport on load and scroll
  checkVisibility();
  window.addEventListener('scroll', checkVisibility);

  // Logo typing animation
  const logo = document.querySelector('.logo');
  if (logo) {
    animateLogo(logo);
  }

  // Add parallax effect to shapes
  window.addEventListener('mousemove', moveShapes);
});

// Add class for staggered animations
function addStaggeredAnimation(elements) {
  elements.forEach((el, index) => {
    el.classList.add('stagger-animation');
    el.style.animationDelay = `${index * 0.1}s`;
  });
}

// Check if elements are visible in viewport
function checkVisibility() {
  // Check reveal elements
  const reveals = document.querySelectorAll('.reveal, .stagger-animation');
  const windowHeight = window.innerHeight;

  reveals.forEach(reveal => {
    const revealTop = reveal.getBoundingClientRect().top;
    const revealPoint = 150;

    if (revealTop < windowHeight - revealPoint) {
      reveal.classList.add('active');
    }
  });
}

// Logo animation
function animateLogo(element) {
  const text = element.textContent;
  element.textContent = '';

  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
    }
  }, 100);
}

// Parallax effect for shapes
function moveShapes(e) {
  const shapes = document.querySelectorAll('.shape');
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.01;
    const x = (mouseX - window.innerWidth/2) * speed;
    const y = (mouseY - window.innerHeight/2) * speed;

    shape.style.transform = `translate(${x}px, ${y}px)`;
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
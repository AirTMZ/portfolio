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
  createBorderSparks(); // Add the border sparks
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

// Create border sparks effect
function createBorderSparks() {
  const sparksContainer = document.createElement('div');
  sparksContainer.id = 'border-sparks';
  sparksContainer.style.position = 'fixed';
  sparksContainer.style.top = '0';
  sparksContainer.style.left = '0';
  sparksContainer.style.width = '100%';
  sparksContainer.style.height = '100%';
  sparksContainer.style.pointerEvents = 'none';
  sparksContainer.style.zIndex = '9990';
  document.body.appendChild(sparksContainer);

  // Create the sparks CSS
  const style = document.createElement('style');
  style.textContent = `
    .spark {
      position: absolute;
      width: 3px;
      height: 3px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      z-index: 9991;
      pointer-events: none;
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
    }

    @keyframes sparkFade {
      0% {
        opacity: 1;
        transform: translate(0, 0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(var(--x), var(--y)) scale(0.1);
      }
    }
  `;
  document.head.appendChild(style);

  // Generate sparks at intervals (reduced from 300ms to 150ms for more frequency)
  setInterval(createSpark, 150);

  function createSpark() {
    // Randomly decide if this should be a top or bottom spark
    const isTop = Math.random() > 0.5;

    // Create spark element
    const spark = document.createElement('div');
    spark.className = 'spark';

    // Position at random point along the border
    const xPos = Math.random() * 100;
    const yPos = isTop ? 0 : 100;

    spark.style.left = `${xPos}%`;
    spark.style.top = `${yPos}%`;

    // Randomize direction for movement
    const xDirection = Math.random() * 40 - 20; // -20px to 20px (increased range)
    const yDirection = isTop ? Math.random() * 40 + 5 : -(Math.random() * 40 + 5); // Away from border (increased range)

    spark.style.setProperty('--x', `${xDirection}px`);
    spark.style.setProperty('--y', `${yDirection}px`);

    // Occasionally create a larger, brighter spark
    if (Math.random() < 0.3) { // 30% chance of a "special" spark
      spark.style.width = '4px';
      spark.style.height = '4px';
      spark.style.boxShadow = '0 0 10px rgba(255, 255, 255, 1)';
    }

    // Animation (slightly longer duration)
    spark.style.animation = `sparkFade ${Math.random() * 0.6 + 0.7}s ease-out forwards`;

    // Add to container
    sparksContainer.appendChild(spark);

    // Remove after animation
    setTimeout(() => {
      spark.remove();
    }, 2000); // Increased from 1500ms to 2000ms
  }
}
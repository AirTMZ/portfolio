document.addEventListener('DOMContentLoaded', async function() {
  try {
    const metadataResponse = await fetch('data/metadata.json');
    const metadata = await metadataResponse.json();
    applyMetadata(metadata);
  } catch (error) {
    console.error('Error loading metadata:', error);
  }

  try {
    const personalResponse = await fetch('data/personal.json');
    const personalData = await personalResponse.json();
    renderPersonalData(personalData);
  } catch (error) {
    console.error('Error loading personal data:', error);
  }

  try {
    const projectsResponse = await fetch('data/projects.json');
    const projects = await projectsResponse.json();
    renderProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
  }

  try {
    const experienceResponse = await fetch('data/experience.json');
    const experience = await experienceResponse.json();
    renderExperience(experience);
  } catch (error) {
    console.error('Error loading experience data:', error);
  }

  try {
    const educationResponse = await fetch('data/education.json');
    const education = await educationResponse.json();
    renderEducation(education);
  } catch (error) {
    console.error('Error loading education data:', error);
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const header = document.querySelector('header');
  const body = document.body;
  let headerIsCollapsed = false;

  const updateHeaderState = () => {
    if (!header) {
      return;
    }

    const scrollPosition = window.scrollY;

    if (!headerIsCollapsed && scrollPosition > 36) {
      headerIsCollapsed = true;
      header.classList.add('scrolled');
      return;
    }

    if (headerIsCollapsed && scrollPosition < 20) {
      headerIsCollapsed = false;
      header.classList.remove('scrolled');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      body.classList.toggle('menu-open');

      if (body.classList.contains('menu-open')) {
        body.style.overflow = 'hidden';
      } else {
        body.style.overflow = '';
      }
    });
  }

  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      body.classList.remove('menu-open');
      body.style.overflow = '';
    });
  });

  const faviconElement = document.getElementById('dynamic-favicon');
  const faviconPaths = [
    'images/favicons/cowboy.ico',
    'images/favicons/oni.ico',
    'images/favicons/sleep.ico',
    'images/favicons/smile.ico',
    'images/favicons/monkey.ico',
    'images/favicons/grin.ico',
    'images/favicons/robot.ico',
    'images/favicons/nerd.ico',
    'images/favicons/alien.ico',
    'images/favicons/wink.ico'
  ];
  let faviconIndex = Math.floor(Math.random() * faviconPaths.length);

  const applyFavicon = () => {
    if (!faviconElement) {
      return;
    }

    faviconElement.type = 'image/x-icon';
    faviconElement.href = faviconPaths[faviconIndex];
    faviconIndex = (faviconIndex + 1) % faviconPaths.length;
  };

  applyFavicon();
  setInterval(applyFavicon, 4000);
});

function applyMetadata(metadata) {
  // Set basic meta tags
  document.title = metadata.title;

  // Update meta tags dynamically
  const metaTags = {
    'description': metadata.description,
    'keywords': metadata.keywords,
    'author': metadata.author,
    'theme-color': metadata.themeColor,

    // Open Graph meta tags
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:type': 'website',
    'og:url': metadata.siteUrl,
    'og:image': `${metadata.siteUrl}/images/personal/pfp.jpg`,

    // Twitter Card meta tags
    'twitter:card': 'summary_large_image',
    'twitter:site': metadata.social.twitter,
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': `${metadata.siteUrl}/images/personal/pfp.jpg`
  };

  // Apply meta tags
  for (const [name, content] of Object.entries(metaTags)) {
    // Check if meta tag exists
    let metaTag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        metaTag.setAttribute('property', name);
      } else {
        metaTag.setAttribute('name', name);
      }
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  }

  // Add canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', metadata.siteUrl);

  // Add JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': 'Timothy Mitchell',
    'url': metadata.siteUrl,
    'image': `${metadata.siteUrl}/images/personal/pfp.jpg`,
    'jobTitle': 'Security Engineer',
    'sameAs': [
      `https://www.linkedin.com/in/${metadata.social.linkedinUsername}/`,
      `https://github.com/AirTMZ/`,
      `https://twitter.com/${metadata.social.twitter.replace('@', '')}`
    ]
  };

  let scriptTag = document.querySelector('script[type="application/ld+json"]');
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(structuredData);
}

function renderPersonalData(data) {
  if (data.hero) {
    const heroTitle = document.querySelector('.hero-content h1');
    const heroDescription = document.querySelector('.hero-content p');

    if (heroTitle) heroTitle.textContent = data.hero.title;
    if (heroDescription) heroDescription.textContent = data.hero.description;
  }

  if (data.about) {
    const ageYearsElement = document.getElementById('age-years');
    if (ageYearsElement) {
      ageYearsElement.textContent = String(calculateAgeYears('2004-04-11'));
    }

    const whoAmITitle = document.querySelector('.about-content .skill-title');

    let existingParagraphs = document.querySelectorAll('.about-content .about-text');
    existingParagraphs.forEach(p => p.remove());

    let currentElement = whoAmITitle;
    data.about.intro.forEach(text => {
      const p = document.createElement('p');
      p.className = 'about-text';
      p.textContent = text;
      currentElement.insertAdjacentElement('afterend', p);
      currentElement = p;
    });

    const certContainer = document.getElementById('certifications-container');
    if (certContainer) {
      certContainer.innerHTML = '';
      data.about.certifications.forEach(cert => {
        const span = document.createElement('span');
        span.className = 'skill';
        span.textContent = cert;
        certContainer.appendChild(span);
      });
    }

    const cvLink = document.getElementById('cv-link');
    if (cvLink && data.about.cvUrl) {
      cvLink.href = data.about.cvUrl;
    }
  }
}

function calculateAgeYears(birthDateString) {
  const birthDate = new Date(`${birthDateString}T00:00:00`);
  const today = new Date();

  let ageYears = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    ageYears -= 1;
  }

  return ageYears;
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');

  if (!container) {
    console.error('Projects container not found');
    return;
  }

  container.innerHTML = '';

  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';

    let linksHTML = '';
    project.links.forEach(link => {
      linksHTML += `<a href="${link.url}" class="btn btn-sm btn-${link.type} btn-pill" ${link.url.startsWith('http') ? 'target="_blank"' : ''}>
        <i class="${link.icon}"></i> ${link.text}
      </a>`;
    });

    projectCard.innerHTML = `
      <div class="project-image">
        <img src="${project.image}" alt="${project.title} Thumbnail">
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <div class="project-status ${project.status}">
          <i class="fa-solid ${project.statusIcon}"></i> ${project.status === 'complete' ? 'Complete' : 'In Development'}
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-buttons">
          ${linksHTML}
        </div>
      </div>
    `;

    container.appendChild(projectCard);
  });
}

function renderExperience(experience) {
  const container = document.getElementById('experience-container');

  if (!container) {
    console.error('Experience container not found');
    return;
  }

  container.innerHTML = '';

  experience.forEach(item => {
    const experienceCard = document.createElement('div');
    experienceCard.className = 'experience-card';

    let highlightsHTML = '';
    item.highlights.forEach(highlight => {
      highlightsHTML += `<li>${highlight}</li>`;
    });

    experienceCard.innerHTML = `
      <div class="experience-topline">
        <div class="experience-company">${item.company}</div>
        <div class="experience-date">${item.date}</div>
      </div>
      <p class="experience-summary">${item.summary}</p>
      <ul class="experience-highlights">
        ${highlightsHTML}
      </ul>
    `;

    container.appendChild(experienceCard);
  });
}

function renderEducation(education) {
  const container = document.getElementById('timeline-container');

  if (!container) {
    console.error('Timeline container not found');
    return;
  }

  container.innerHTML = '';

  education.forEach((item, index) => {
    const timelineItem = document.createElement('div');
    const position = item.position || (index % 2 === 0 ? 'left' : 'right');
    timelineItem.className = `timeline-item ${position}`;

    timelineItem.innerHTML = `
      <div class="timeline-content">
        <div class="timeline-date">${item.date}</div>
        <h3 class="timeline-title">${item.title}</h3>
        <p class="timeline-text">${item.description}</p>
      </div>
    `;

    container.appendChild(timelineItem);
  });
}
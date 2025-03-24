document.addEventListener('DOMContentLoaded', async function() {
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
  const body = document.body;

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
});

function renderPersonalData(data) {
  if (data.hero) {
    const heroTitle = document.querySelector('.hero-content h1');
    const heroDescription = document.querySelector('.hero-content p');

    if (heroTitle) heroTitle.textContent = data.hero.title;
    if (heroDescription) heroDescription.textContent = data.hero.description;
  }

  if (data.about) {
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

    const skillsContainer = document.getElementById('skills-container');
    if (skillsContainer) {
      skillsContainer.innerHTML = '';
      data.about.skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill';
        span.textContent = skill;
        skillsContainer.appendChild(span);
      });
    }

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

    let tagsHTML = '';
    project.tags.forEach(tag => {
      tagsHTML += `<span class="tag">${tag}</span>`;
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
        <div class="project-tags">
          ${tagsHTML}
        </div>
        <div class="project-buttons">
          ${linksHTML}
        </div>
      </div>
    `;

    container.appendChild(projectCard);
  });
}

function renderEducation(education) {
  const container = document.getElementById('timeline-container');

  if (!container) {
    console.error('Timeline container not found');
    return;
  }

  container.innerHTML = '';

  education.forEach(item => {
    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item ${item.position}`;

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
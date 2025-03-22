document.addEventListener('DOMContentLoaded', async function() {
  // Load personal data
  try {
    const personalResponse = await fetch('data/personal.json');
    const personalData = await personalResponse.json();
    renderPersonalData(personalData);
  } catch (error) {
    console.error('Error loading personal data:', error);
  }

  // Load project data
  try {
    const projectsResponse = await fetch('data/projects.json');
    const projects = await projectsResponse.json();
    renderProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
  }

  // Load education data
  try {
    const educationResponse = await fetch('data/education.json');
    const education = await educationResponse.json();
    renderEducation(education);
  } catch (error) {
    console.error('Error loading education data:', error);
  }

  // Original code for smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Close menu when clicking a link
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
});

// Function to render personal data
function renderPersonalData(data) {
  // Update hero section
  if (data.hero) {
    const heroTitle = document.querySelector('.hero-content h1');
    const heroDescription = document.querySelector('.hero-content p');

    if (heroTitle) heroTitle.textContent = data.hero.title;
    if (heroDescription) heroDescription.textContent = data.hero.description;
  }

  // Update about section
  if (data.about) {
    // Update "Who am I?" paragraphs
    const aboutTextElements = document.querySelectorAll('.about-content .about-text');
    const aboutContent = document.querySelector('.about-content');

    // Clear existing paragraphs
    aboutTextElements.forEach(el => el.remove());

    // Find the first skill title (Who am I?)
    const whoAmITitle = aboutContent.querySelector('.skill-title');

    // Insert paragraphs after the title
    let currentElement = whoAmITitle;
    data.about.intro.forEach(text => {
      const p = document.createElement('p');
      p.className = 'about-text';
      p.textContent = text;
      currentElement.after(p);
      currentElement = p; // Update reference for next insertion
    });

    // Update technical skills
    const skillTitles = aboutContent.querySelectorAll('.skill-title');
    if (skillTitles.length >= 2) {
      const techSkillsTitle = skillTitles[1];
      const skillsContainer = techSkillsTitle.nextElementSibling;

      if (skillsContainer && skillsContainer.classList.contains('skills')) {
        skillsContainer.innerHTML = '';
        data.about.skills.forEach(skill => {
          const span = document.createElement('span');
          span.className = 'skill';
          span.textContent = skill;
          skillsContainer.appendChild(span);
        });
      }
    }

    // Update certifications
    if (skillTitles.length >= 3) {
      const certTitle = skillTitles[2];
      const certContainer = certTitle.nextElementSibling;

      if (certContainer && certContainer.classList.contains('skills')) {
        certContainer.innerHTML = '';
        data.about.certifications.forEach(cert => {
          const span = document.createElement('span');
          span.className = 'skill';
          span.textContent = cert;
          certContainer.appendChild(span);
        });
      }
    }

    // Update CV link
    const cvLink = aboutContent.querySelector('.hero-links a:first-child');
    if (cvLink && data.about.cvUrl) {
      cvLink.href = data.about.cvUrl;
    }
  }
}

// Function to render project cards
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

// Function to render education timeline
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
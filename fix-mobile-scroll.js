const fs = require('fs');

const filePath = 'components/glass-hero.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// We want to replace the `projectsTimeline` and `servicesTimeline` with individual scroll triggers.

const projectsRegex = /\/\/ SECTION 4: EDITORIAL PROJECTS SHOWCASE \(stagger reveal on scroll\)[\s\S]*?projectsTimeline\.from\('\.project-group-3-card'[^)]+\);/m;

const newProjectsCode = `// SECTION 4: EDITORIAL PROJECTS SHOWCASE (individual reveals for mobile reliability)
      gsap.fromTo('#sec-showcase-title', 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '#sec-showcase-title', start: 'top 85%', toggleActions: 'play none none reverse' } }
      );

      gsap.utils.toArray('.project-card-item').forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });`;

content = content.replace(projectsRegex, newProjectsCode);


const servicesRegex = /\/\/ SECTION 5: SERVICES \(stagger reveal on scroll\)[\s\S]*?ease: 'power2\.out',\n\s*\}\);/m;

const newServicesCode = `// SECTION 5: SERVICES (individual reveals for mobile reliability)
      gsap.utils.toArray('.service-card-item').forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });`;

content = content.replace(servicesRegex, newServicesCode);

// Also let's make sure MagneticButton isn't crashing by guarding it
// Wait, MagneticButton is in a separate file, and we verified it's safe.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored ScrollTriggers to be mobile-safe');

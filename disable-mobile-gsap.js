const fs = require('fs');

const filePath = 'components/glass-hero.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// We will wrap the fromTo blocks with an if statement checking window.innerWidth
// This completely bypasses the GSAP opacity:0 initial states on mobile.

const oldProjectsCode = `      gsap.fromTo('#sec-showcase-title', 
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

const newProjectsCode = `      if (window.innerWidth >= 768) {
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
        });
      }`;

content = content.replace(oldProjectsCode, newProjectsCode);


const oldServicesCode = `      gsap.utils.toArray('.service-card-item').forEach((card) => {
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

const newServicesCode = `      if (window.innerWidth >= 768) {
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
        });
      }`;

content = content.replace(oldServicesCode, newServicesCode);


// Write changes
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully disabled GSAP reveals on mobile to fix invisibility bug.');

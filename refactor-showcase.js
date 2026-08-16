const fs = require('fs');

const filePath = 'components/glass-hero.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add MagneticButton import
if (!content.includes("import { MagneticButton }")) {
  content = content.replace("import dynamic from 'next/dynamic';", "import dynamic from 'next/dynamic';\nimport { MagneticButton } from '@/components/ui/magnetic-button';");
}

// 2. Remove handleCardMouseMove and handleCardMouseLeave
content = content.replace(/\/\/ 3D Tilt & Parallax Physics for Project Cards[\s\S]*?const handleCardMouseLeave = \(e: React\.MouseEvent<HTMLDivElement>\) => \{[\s\S]*?\};\n/, '');

// 3. Update GSAP timeline for projects
const oldTimelineRegex = /\/\/ SECTION 4: EDITORIAL PROJECTS SHOWCASE \(stagger reveal on scroll\)[\s\S]*?ease: 'power2\.out',\s*\}\);/m;

const newTimeline = `// SECTION 4: EDITORIAL PROJECTS SHOWCASE (stagger reveal on scroll)
      const projectsTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-showcase',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        }
      });
      projectsTimeline.from('#sec-showcase-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out' }, 0);
      projectsTimeline.from('.project-featured', { opacity: 0, y: 40, scale: 0.98, duration: 0.8, ease: 'power2.out' }, 0.2);
      projectsTimeline.from('.project-group-2-card1', { opacity: 0, y: 30, duration: 0.7, ease: 'power2.out' }, 0.4);
      projectsTimeline.from('.project-group-2-card2', { opacity: 0, y: 30, duration: 0.7, ease: 'power2.out' }, 0.55);
      projectsTimeline.from('.project-group-3-card', { opacity: 0, y: 30, scale: 0.98, duration: 0.7, ease: 'power2.out', stagger: 0.12 }, 0.7);

      // Parallax images
      gsap.utils.toArray('.project-image-parallax').forEach((img) => {
        gsap.to(img, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.project-card-item'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      });`;

content = content.replace(oldTimelineRegex, newTimeline);

// 4. Refactor the project cards HTML to apply new classes, remove old mouse handlers, add image overlay, and wrap buttons
// Removing mouse events
content = content.replace(/onMouseMove=\{handleCardMouseMove\}\n\s*onMouseLeave=\{handleCardMouseLeave\}/g, '');

// Card classes refactor
content = content.replace('className="project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"', 
  'className="project-card-item project-featured group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.1)] hover:-translate-y-[6px] transition-all duration-500 will-change-transform relative"');

content = content.replace('className="lg:col-span-7 project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"',
  'className="lg:col-span-7 project-card-item project-group-2-card1 group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.1)] hover:-translate-y-[6px] transition-all duration-500 will-change-transform relative"');

content = content.replace('className="lg:col-span-5 project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"',
  'className="lg:col-span-5 project-card-item project-group-2-card2 group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.1)] hover:-translate-y-[6px] transition-all duration-500 will-change-transform relative"');

content = content.replace('className="project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"',
  'className="project-card-item project-group-3-card group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.1)] hover:-translate-y-[6px] transition-all duration-500 will-change-transform relative"');


// Images refactor
const hoverOverlayHtml = `<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="font-mono text-xs font-semibold tracking-wider text-white bg-black/40 px-4 py-2 rounded-full border border-white/20 transform scale-90 group-hover:scale-100 transition-transform duration-500">VIEW PROJECT &rarr;</span>
                </div>`;

content = content.replace('<img src="/images/projects/nomoredms.png" alt="NoMoreDMS" className="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />',
  `${hoverOverlayHtml}\n              <img src="/images/projects/nomoredms.png" alt="NoMoreDMS" className="project-image-parallax w-full h-[120%] object-cover rounded-xl shadow-2xl group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />`);

content = content.replace('<img src="/images/projects/educalc.png" alt="EduCalc" className="w-full h-full object-cover rounded-xl shadow-lg group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />',
  `${hoverOverlayHtml}\n                <img src="/images/projects/educalc.png" alt="EduCalc" className="project-image-parallax w-full h-[120%] object-cover rounded-xl shadow-lg group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />`);

content = content.replace('<img src="/images/projects/personalportfolio.jpg" alt="Personal Portfolio" className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />',
  `${hoverOverlayHtml}\n                <img src="/images/projects/personalportfolio.jpg" alt="Personal Portfolio" className="project-image-parallax w-full h-[120%] object-cover rounded-lg shadow-md group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />`);

content = content.replace('<img src={p.thumb} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />',
  `${hoverOverlayHtml.replace('VIEW PROJECT', 'VIEW PROJECT')}\n                  <img src={p.thumb} alt={p.title} className="project-image-parallax w-full h-[120%] object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />`);


// Wrap links in MagneticButton
const aTagRegex = /<a href="([^"]+)" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100\/90 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-full border border-zinc-200\/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">([\s\S]*?)<\/a>/g;
content = content.replace(aTagRegex, (match, url, inner) => {
  return `<MagneticButton><a href="${url}" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100/90 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-full border border-zinc-200/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">${inner}</a></MagneticButton>`;
});

const aTagRegexSmall = /<a href=\{p.url\} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100\/90 group-hover:bg-blue-600 group-hover:text-white px-3\.5 py-1\.5 rounded-full border border-zinc-200\/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">([\s\S]*?)<\/a>/g;
content = content.replace(aTagRegexSmall, (match, inner) => {
  return `<MagneticButton><a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100/90 group-hover:bg-blue-600 group-hover:text-white px-3.5 py-1.5 rounded-full border border-zinc-200/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">${inner}</a></MagneticButton>`;
});


fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored glass-hero.tsx');

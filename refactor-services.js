const fs = require('fs');

const filePath = 'components/glass-hero.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update servicesTimeline in GSAP block
const oldServicesTimelineRegex = /\/\/ SECTION 5: SERVICES \(stagger reveal on scroll\)[\s\S]*?ease: 'power2\.out',\n\s*\}\);/m;

const newServicesTimeline = `// SECTION 5: SERVICES (stagger reveal on scroll)
      const servicesTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-services',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        }
      });
      servicesTimeline.from('.service-card-item', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });`;

content = content.replace(oldServicesTimelineRegex, newServicesTimeline);


// 2. Refactor Card Hover CSS
content = content.replace('className="service-card-item group bg-white border border-zinc-200/80 rounded-3xl p-8 md:p-10 flex flex-col justify-between gap-8 shadow-sm hover:shadow-2xl transition-all duration-500 will-change-transform relative overflow-hidden"',
  'className="service-card-item group bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-3xl p-8 md:p-10 flex flex-col justify-between gap-8 shadow-sm hover:shadow-lg hover:-translate-y-[6px] transition-all duration-500 will-change-transform relative overflow-hidden"');


// 3. Deliverables checklist micro-slide
const oldDeliverablesHtml = `{srv.deliverables.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-light text-zinc-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{item}</span>
                        </div>
                      ))}`;

const newDeliverablesHtml = `{srv.deliverables.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-light text-zinc-700 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: \`\${i * 50}ms\` }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{item}</span>
                        </div>
                      ))}`;

content = content.replace(oldDeliverablesHtml, newDeliverablesHtml);


// 4. Tech stack badges hover
const oldTechStackHtml = `{srv.tech.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                        {t}
                      </span>
                    ))}`;

const newTechStackHtml = `{srv.tech.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80 hover:bg-zinc-200/80 hover:border-zinc-300 hover:-translate-y-[1px] transition-all duration-200 cursor-default">
                        {t}
                      </span>
                    ))}`;

content = content.replace(oldTechStackHtml, newTechStackHtml);


// 5. Inquire CTA hover + MagneticButton
const oldCtaHtml = `<a href="#sec-cta-footer" className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-900 group-hover:text-blue-600 transition-colors pt-2">
                    <span>Inquire for this service</span>
                    <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                  </a>`;

const newCtaHtml = `<MagneticButton className="w-auto">
                    <a href="#sec-cta-footer" className="group/btn inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-900 hover:text-blue-600 transition-colors pt-2">
                      <span>Inquire for this service &rarr;</span>
                      <span className="group-hover/btn:translate-x-[5px] transition-transform duration-300 opacity-0">&rarr;</span> {/* Invisible placeholder to match structure or just animate an arrow */}
                    </a>
                  </MagneticButton>`;

// Let's make the CTA cleaner for the MagneticButton
const cleanerCtaHtml = `<MagneticButton className="w-fit">
                    <a href="#sec-cta-footer" className="group/btn inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-900 hover:text-blue-600 transition-colors pt-2">
                      <span>Inquire for this service</span>
                      <span className="group-hover/btn:translate-x-[4px] transition-transform duration-300 ease-out">&rarr;</span>
                    </a>
                  </MagneticButton>`;

content = content.replace(oldCtaHtml, cleanerCtaHtml);


// 6. Service title interactive (SaaS Applications & Dashboards -> )
// The user suggested adding an arrow that appears or moves. "SaaS Applications & Dashboards ->". 
const oldTitleHtml = `<h3 className="text-2xl md:text-3xl font-light text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                      {srv.title}
                    </h3>`;

const newTitleHtml = `<h3 className="text-2xl md:text-3xl font-light text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300 flex items-center gap-2">
                      {srv.title}
                      <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-600 text-2xl md:text-3xl">&rarr;</span>
                    </h3>`;

content = content.replace(oldTitleHtml, newTitleHtml);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored Services section in glass-hero.tsx');

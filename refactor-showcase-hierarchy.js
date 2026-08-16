const fs = require('fs');

const filePath = 'components/glass-hero.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject CursorFollower import
if (!content.includes("import { CursorFollower }")) {
  content = content.replace(
    "import { MagneticButton } from '@/components/ui/magnetic-button';",
    "import { MagneticButton } from '@/components/ui/magnetic-button';\nimport { CursorFollower } from '@/components/ui/cursor-follower';"
  );
}

// 2. Inject states
if (!content.includes("const [activeCategory, setActiveCategory]")) {
  content = content.replace(
    "const [mobileMenuOpen, setMobileMenuOpen] = useState(false);",
    "const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [activeCategory, setActiveCategory] = useState('All');\n  const [hoveredProjectImage, setHoveredProjectImage] = useState<string | null>(null);"
  );
}

// 3. Define projects data inside or outside the component? Outside is cleaner but we need it. Let's put it right before the showcase section.
const projectsData = `
const CATEGORIES = ['All', 'Web Apps', 'AI', 'Websites', 'Branding', 'Automation'];

const PROJECTS_DATA = [
  {
    id: '01',
    title: 'NoMoreDMS',
    desc: 'AI-powered job application & creator platform to eliminate unnecessary DMs and connect opportunities in one smart hub.',
    tags: ['Product Design', 'AI', 'Full Stack'],
    category: 'AI',
    url: 'https://nomoredms.vercel.app/',
    thumb: '/images/projects/nomoredms.png',
    featured: true
  },
  {
    id: '02',
    title: 'EduCalc',
    desc: 'Smart educational platform that makes math, logic & calculations easier for students and professionals.',
    tags: ['Product Design', 'Automation', 'Math Engine'],
    category: 'Automation',
    url: 'https://educalc-expert0509.vercel.app/',
    thumb: '/images/projects/educalc.png',
    featured: false
  },
  {
    id: '03',
    title: 'Personal Portfolio',
    desc: 'A personal portfolio that blends clean design, motion and interaction to create a unique digital presence.',
    tags: ['UX / UI Design', 'Development', 'Motion'],
    category: 'Websites',
    url: 'https://devendhargopagoni.netlify.app/',
    thumb: '/images/projects/personalportfolio.jpg',
    featured: false
  },
  {
    id: '04',
    title: 'PostLearn',
    desc: 'Modern learning platform delivering educational content intuitively.',
    tags: ['Next.js', 'React', 'Tailwind CSS', 'Supabase'],
    category: 'Web Apps',
    url: 'https://postlearn-lake.vercel.app/',
    thumb: '/images/projects/postlearn.png',
    featured: false
  },
  {
    id: '05',
    title: 'Cozy Cafe',
    desc: 'Bespoke cafe website featuring online menus and reservation flows.',
    tags: ['Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    category: 'Websites',
    url: 'https://cozy-cafa1.netlify.app/',
    thumb: '/images/projects/cozy-cafe.png',
    featured: false
  },
  {
    id: '06',
    title: 'Akshith Portfolio',
    desc: 'Personal portfolio built for a client to establish digital presence.',
    tags: ['React', 'GSAP', 'Tailwind CSS'],
    category: 'Branding',
    url: 'https://maatoori-akshith.netlify.app/',
    thumb: '/images/projects/maatoori-akshith.jpg',
    featured: false
  }
];
`;

// Extract sec-showcase from the content
const showcaseStart = content.indexOf('<section id="sec-showcase"');
const showcaseEnd = content.indexOf('</section>', showcaseStart) + 10;
const originalShowcase = content.substring(showcaseStart, showcaseEnd);

const newShowcaseHTML = `
      {/* 02 / SELECTED WORK — HIERARCHICAL EDITORIAL LAYOUT */}
      <section id="sec-showcase" className="story-sec bg-[#f8f9fa] text-zinc-900 py-24 px-[max(5.6vw,2rem)] relative z-20 border-t border-zinc-200/60">
        <CursorFollower imageSrc={hoveredProjectImage} isActive={hoveredProjectImage !== null} />
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full border-b border-zinc-200 pb-6 gap-6">
            <div className="flex flex-col gap-6">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/80 px-3.5 py-1.5 rounded-full border border-blue-200/50 shadow-2xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                SELECTED WORK
              </span>
              <h2 id="sec-showcase-title" className="text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight text-zinc-900 leading-[1.05]">
                Things I've designed,<br/>built & shipped.
              </h2>
              <p className="text-zinc-500 font-light max-w-md mt-2 leading-relaxed">
                A selection of projects where design, code and strategy come together to create impactful digital experiences.
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-6">
              <a href="https://github.com/devendharoff" target="_blank" rel="noreferrer" className="font-semibold text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group">
                View all projects <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
              
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Web Apps', 'AI', 'Websites', 'Branding', 'Automation'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={\`font-mono text-[11px] font-semibold tracking-wider px-4 py-2 rounded-full transition-all duration-300 \${
                      activeCategory === cat 
                        ? 'bg-zinc-900 text-white shadow-md' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                    }\`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12 lg:gap-16">
            {PROJECTS_DATA.filter(p => activeCategory === 'All' || p.category === activeCategory).map((p, index) => {
              
              // 1. FEATURED PROJECT (HERO LAYOUT)
              if (index === 0) {
                return (
                  <div key={p.id} className="project-card-item w-full flex flex-col gap-6 lg:gap-8 bg-white p-4 lg:p-6 rounded-[2rem] border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="w-full relative bg-zinc-950 rounded-[1.5rem] overflow-hidden aspect-[16/10] md:aspect-[21/9] flex items-center justify-center group">
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />
                      <img src={p.thumb} alt={p.title} className="w-[110%] h-[110%] object-cover group-hover:scale-[1.03] group-hover:-rotate-1 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2 lg:px-6 pb-2 lg:pb-4">
                      <div className="flex flex-col gap-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-zinc-900 px-3 py-1 bg-zinc-100 rounded-full">{p.id}</span>
                          <span className="font-mono text-[10px] font-bold tracking-widest text-blue-600 uppercase">FEATURED PROJECT</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-900">{p.title}</h3>
                        <p className="text-zinc-500 font-light leading-relaxed md:text-lg">{p.desc}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {p.tags.map((t, i) => (
                            <span key={i} className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-zinc-50 text-zinc-600 border border-zinc-200/80">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <MagneticButton>
                        <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-white bg-zinc-900 hover:bg-black px-6 py-4 rounded-full transition-all duration-300 shrink-0 group">
                          <span>View case study</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                        </a>
                      </MagneticButton>
                    </div>
                  </div>
                );
              }

              // 2. SECONDARY PROJECTS (ASYMMETRICAL 50/50 LAYOUT)
              if (index === 1 || index === 2) {
                const isImageLeft = index === 1;
                
                return (
                  <div key={p.id} className={\`project-card-item grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 bg-white p-4 lg:p-6 rounded-[2rem] border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]\`}>
                    
                    {/* Render Image First if isImageLeft, OR if on Mobile (flex-col-reverse handles it natively but grid doesn't, so we order it) */}
                    <div className={\`w-full bg-zinc-100 rounded-[1.5rem] overflow-hidden relative aspect-[4/3] group \${!isImageLeft ? 'lg:order-last' : ''}\`}>
                      <img src={p.thumb} alt={p.title} className="w-[110%] h-[110%] absolute -top-[5%] -left-[5%] object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    </div>

                    <div className="flex flex-col justify-between py-6 lg:py-12 px-2 lg:px-8">
                      <div className="flex flex-col gap-4">
                        <span className="font-mono text-xs font-semibold text-zinc-900 px-3 py-1 bg-zinc-100 rounded-full w-fit">{p.id}</span>
                        <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">{p.title}</h3>
                        <p className="text-zinc-500 font-light leading-relaxed">{p.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {p.tags.map((t, i) => (
                            <span key={i} className="text-[10px] font-mono font-medium px-3 py-1.5 rounded-full bg-zinc-50 text-zinc-600 border border-zinc-200/80">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-10">
                        <MagneticButton>
                          <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-blue-600 hover:text-blue-700 transition-all duration-300 group">
                            <span>View project</span>
                            <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                          </a>
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. ARCHIVE ROW ITEMS (CURSOR REVEAL)
              // Only render the wrapper once if it's the first archive item
              if (index === 3) {
                return (
                  <div key="archive-wrapper" className="flex flex-col mt-4 bg-white rounded-[2rem] border border-zinc-200/80 p-6 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    {PROJECTS_DATA.filter(p => activeCategory === 'All' || p.category === activeCategory).slice(3).map((archiveItem) => (
                      <a 
                        key={archiveItem.id}
                        href={archiveItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="project-card-item group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-zinc-200/60 last:border-0 hover:bg-zinc-50 transition-colors -mx-6 lg:-mx-10 px-6 lg:px-10"
                        onMouseEnter={() => setHoveredProjectImage(archiveItem.thumb)}
                        onMouseLeave={() => setHoveredProjectImage(null)}
                      >
                        <div className="flex items-start md:items-center gap-6 md:gap-12 w-full md:w-auto">
                          <span className="font-mono text-sm font-semibold text-blue-600">{archiveItem.id}</span>
                          <div className="flex flex-col gap-1 md:gap-0 md:flex-row md:items-center w-full">
                            <h4 className="text-xl md:text-2xl font-semibold text-zinc-900 md:w-72 lg:w-96 group-hover:translate-x-2 transition-transform duration-300">{archiveItem.title}</h4>
                            <p className="text-zinc-500 font-light text-sm md:text-base hidden sm:block w-96">{archiveItem.desc}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between w-full md:w-auto mt-6 md:mt-0">
                          <div className="flex gap-2 mr-8">
                            {archiveItem.tags.slice(0,4).map((t, i) => (
                              <span key={i} className="text-[10px] md:text-xs font-mono font-medium px-2 md:px-3 py-1 bg-zinc-100 rounded-full text-zinc-500 whitespace-nowrap">
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 shrink-0">
                            <svg className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                );
              }
              return null; // Skip rendering 4+ individually, they are rendered inside index 3
            })}
          </div>
          
          {/* Bottom Call to Action */}
          <div className="flex justify-center mt-8">
            <MagneticButton>
              <a href="#sec-about" className="inline-flex items-center gap-3 bg-zinc-50 text-zinc-900 font-mono text-sm font-semibold px-8 py-4 rounded-full border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all group">
                Have a project in mind? Let's build it together <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
            </MagneticButton>
          </div>
        </div>
      </section>`;

let finalContent = content.replace(originalShowcase, newShowcaseHTML);

// Inject PROJECTS_DATA right before the GlassHero function
if (!finalContent.includes("const PROJECTS_DATA = [")) {
  finalContent = finalContent.replace("export default function GlassHero() {", projectsData + "\nexport default function GlassHero() {");
}

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Successfully refactored showcase to hierarchical layout');

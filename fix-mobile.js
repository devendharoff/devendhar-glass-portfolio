const fs = require('fs');

const filePath = 'components/glass-hero.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Showcase Header Mobile Wrapping
content = content.replace(
  '<div className="flex items-center justify-between w-full border-b border-zinc-200 pb-6">',
  '<div className="flex flex-col sm:flex-row sm:items-center justify-between w-full border-b border-zinc-200 pb-6 gap-4">'
);
content = content.replace(
  '<div className="flex items-center justify-between border-b border-zinc-200 pb-6">',
  '<div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-6 gap-4">'
);


// 2. Fix the 120% height exploding issue for Project Cards

// Project 1
content = content.replace(
  /<div className="lg:col-span-7 bg-zinc-950 min-h-\[320px\] md:min-h-\[420px\] relative overflow-hidden flex items-center justify-center p-6 md:p-8">\s*<div className="absolute inset-0 bg-black\/20[^>]+>[\s\S]*?<\/div>\s*<img src="\/images\/projects\/nomoredms\.png"[^>]+project-image-parallax w-full h-\[120%\] object-cover rounded-xl shadow-2xl[^>]+>\s*<\/div>/,
  `<div className="lg:col-span-7 bg-zinc-950 min-h-[320px] md:min-h-[420px] relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="font-mono text-xs font-semibold tracking-wider text-white bg-black/40 px-4 py-2 rounded-full border border-white/20 transform scale-90 group-hover:scale-100 transition-transform duration-500">VIEW PROJECT &rarr;</span>
              </div>
              <div className="absolute inset-6 md:inset-8 overflow-hidden rounded-xl shadow-2xl z-10">
                <img src="/images/projects/nomoredms.png" alt="NoMoreDMS" className="project-image-parallax w-full h-[130%] -mt-[15%] object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
            </div>`
);

// Project 2
content = content.replace(
  /<div className="bg-zinc-100 min-h-\[280px\] relative overflow-hidden p-6">\s*<div className="absolute inset-0 bg-black\/20[^>]+>[\s\S]*?<\/div>\s*<img src="\/images\/projects\/educalc\.png"[^>]+project-image-parallax w-full h-\[120%\] object-cover rounded-xl shadow-lg[^>]+>\s*<\/div>/,
  `<div className="bg-zinc-100 min-h-[280px] sm:min-h-[340px] relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="font-mono text-xs font-semibold tracking-wider text-white bg-black/40 px-4 py-2 rounded-full border border-white/20 transform scale-90 group-hover:scale-100 transition-transform duration-500">VIEW PROJECT &rarr;</span>
                </div>
                <div className="absolute inset-6 overflow-hidden rounded-xl shadow-lg z-10">
                  <img src="/images/projects/educalc.png" alt="EduCalc" className="project-image-parallax w-full h-[130%] -mt-[15%] object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </div>
              </div>`
);

// Project 3
content = content.replace(
  /<div className="bg-zinc-900 min-h-\[220px\] relative overflow-hidden p-4">\s*<div className="absolute inset-0 bg-black\/20[^>]+>[\s\S]*?<\/div>\s*<img src="\/images\/projects\/personalportfolio\.jpg"[^>]+project-image-parallax w-full h-\[120%\] object-cover rounded-lg shadow-md[^>]+>\s*<\/div>/,
  `<div className="bg-zinc-900 min-h-[260px] sm:min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="font-mono text-xs font-semibold tracking-wider text-white bg-black/40 px-4 py-2 rounded-full border border-white/20 transform scale-90 group-hover:scale-100 transition-transform duration-500">VIEW PROJECT &rarr;</span>
                </div>
                <div className="absolute inset-4 overflow-hidden rounded-lg shadow-md z-10">
                  <img src="/images/projects/personalportfolio.jpg" alt="Personal Portfolio" className="project-image-parallax w-full h-[130%] -mt-[15%] object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </div>
              </div>`
);


// Projects 4, 5, 6
content = content.replace(
  /<div className="h-48 bg-zinc-100 overflow-hidden relative">\s*<div className="absolute inset-0 bg-black\/20[^>]+>[\s\S]*?<\/div>\s*<img src=\{p\.thumb\}[^>]+project-image-parallax w-full h-\[120%\] object-cover[^>]+>\s*<\/div>/g,
  `<div className="h-56 sm:h-64 md:h-48 lg:h-56 bg-zinc-100 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="font-mono text-xs font-semibold tracking-wider text-white bg-black/40 px-4 py-2 rounded-full border border-white/20 transform scale-90 group-hover:scale-100 transition-transform duration-500">VIEW PROJECT &rarr;</span>
                  </div>
                  <img src={p.thumb} alt={p.title} className="project-image-parallax absolute w-full h-[130%] -top-[15%] left-0 object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10" />
                </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored mobile issues in glass-hero.tsx');

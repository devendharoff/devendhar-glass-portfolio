# 🚀 The Ultimate Next.js 14 + GSAP Portfolio Blueprint & AI Master Prompt

> **Shared by Devender Gopagoni**  
> *Full-Stack Web Developer & UI/UX Product Builder*  
> 🔗 **GitHub Repository**: [github.com/devendharoff/devendhar-glass-portfolio](https://github.com/devendharoff/devendhar-glass-portfolio)  
> ✉️ **Contact / Inquiries**: `devendhargopagoni@gmail.com`

---

## 📸 Reel Caption & Hook Ideas (For Instagram / Twitter / LinkedIn)

### 💡 Option 1 (Comment Keyword Automation)
> **Hook**: "Stop using boring portfolio templates in 2026. Build THIS liquid mask portfolio instead 👇"  
> **Body**: I engineered a full-stack portfolio website using Next.js 14, Tailwind CSS, GSAP, and 3D tilt physics.  
> ✨ **Features**:  
> • Liquid Cursor Reveal Mask (dual-layer canvas)  
> • 3D Mouse Tilt Project Cards + Sheen Glare Sweep  
> • Floating Levitating Tech Stack Illustration Box  
> • Hydration-Safe Mobile Glass Drawer  
>  
> 💬 **Comment "PORTFOLIO"** and I’ll DM you the complete step-by-step PDF guide + copy-paste AI prompt to replicate this in 10 minutes!  
>  
> #webdevelopment #nextjs #reactjs #frontend #developer #portfolio #uiux #coding #gsap #tailwindcss

---

## 🛠️ Complete Tech Stack & Assets Checklist

### 1. Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Google Fonts (`Plus Jakarta Sans` & `JetBrains Mono`)
- **Animation & Physics**: GSAP + ScrollTrigger + Lenis Smooth Scroll
- **Deployment**: Vercel / Netlify

### 2. Required Image Assets Directory (`public/images/`)
Place these images inside your Next.js `public/images/` directory:

| File Name | Resolution | Description & Specs |
| :--- | :--- | :--- |
| `Base_image_desktop.png` | $1920 \times 1080\text{ px}$ | Cool dark/monochrome developer portrait (Hero Layer 1). |
| `Reveal_image_desktop.png` | $1920 \times 1080\text{ px}$ | Full color lighting portrait with **exact identical alignment** (Hero Layer 2 revealed by cursor). |
| `tech-developer-illustration-transparent.png` | $800 \times 800\text{ px}$ | 3D transparent PNG character at a desk (Section 03 Tech Stack). |
| `projects/nomoredms.png` | $1200 \times 800\text{ px}$ | Project 01 Showcase Screenshot. |
| `projects/educalc.png` | $1200 \times 800\text{ px}$ | Project 02 Showcase Screenshot. |
| `projects/personalportfolio.jpg` | $1200 \times 800\text{ px}$ | Project 03 Showcase Screenshot. |
| `projects/postlearn.png` | $1200 \times 800\text{ px}$ | Project 04 Showcase Screenshot. |
| `projects/cozy-cafe.png` | $1200 \times 800\text{ px}$ | Project 05 Showcase Screenshot. |
| `projects/maatoori-akshith.jpg` | $1200 \times 800\text{ px}$ | Project 06 Showcase Screenshot. |

---

## ⚡ Quick 3-Step Setup Command

Run these commands in your terminal to initialize your project:

```bash
# Step 1: Create Next.js 14 App
npx create-next-app@latest my-portfolio --typescript --tailwind --eslint --app ./

# Step 2: Install Motion & Icon Dependencies
npm install gsap lenis lucide-react clsx tailwind-merge

# Step 3: Run Dev Server
npm run dev
```

---

## 🤖 Copy-Paste Master AI Agent Prompt

> **Instructions for your audience**: Copy the prompt below and paste it into **Antigravity**, **Cursor**, **Claude**, **v0**, or **ChatGPT** to generate the entire codebase automatically.

```markdown
Role & Task:
You are an expert Lead Motion & Frontend Engineer. Build a high-performance personal portfolio website using Next.js 14 (App Router), TypeScript, Tailwind CSS, GSAP with ScrollTrigger, and Lenis Smooth Scroll.

Design System & Aesthetic:
- Fonts: "Plus Jakarta Sans" for primary body/headings + "JetBrains Mono" for monospace tags & section pills.
- Color Palette: Pure white base (`#ffffff`), subtle technical grid overlay (`opacity-[0.06]`), dark slate accents (`#0c111d`), deep cinematic footer (`#050507`), and electric blue highlights (`#0055ff`).
- Header Badges: Standardized bold uppercase monospace pills (`01 / THE APPROACH`, `02 / SELECTED WORK`, `03 / TECH STACK & ECOSYSTEM`, `04 / SERVICES`).

Component Requirements:

1. Fixed Header & Hydration-Safe Mobile Drawer:
   - Floating glass pill header for desktop (`hidden md:flex`).
   - Hamburger button for mobile (`md:hidden`).
   - Slide-out mobile menu overlay (`fixed inset-0 z-40 bg-black/80 backdrop-blur-lg md:hidden`).
   - CRITICAL DOM STABILITY: Keep the mobile drawer element always mounted in the DOM tree, toggling visibility with Tailwind CSS classes (`opacity-100 pointer-events-auto` vs `opacity-0 pointer-events-none`) to prevent `insertBefore` React hydration reconciliation errors.

2. Liquid Cursor Mask Hero Section (`#sec-hero`):
   - Dual-layer stacked image system: Base dark portrait (`/images/Base_image_desktop.png`) underneath, revealed by top vibrant portrait (`/images/Reveal_image_desktop.png`) via CSS `mask-image: radial-gradient(circle var(--reveal-radius) at var(--reveal-x) var(--reveal-y), black 100%, transparent 100%)`.
   - Handle both mouse pointer movement (`onPointerMove`) and mobile finger touch drag events (`onTouchMove`).
   - Headline: "Building Beyond Possible." with responsive font clamping (`text-[clamp(2.8rem,10vw,6.8rem)]`) and line-up entrance animations.

3. Section 01 / Identity & Philosophy (`#sec-identity`):
   - 2-column layout: Developer portrait card with aspect ratio `aspect-[4/5]`, personal biography, and a 4-column key metrics grid (Years Experience, Production Apps, Code Quality, Client Satisfaction).

4. Section 02 / Unified Selected Work Showcase (`#sec-showcase`):
   - Grid layout: Display 6 project showcase cards (`grid-cols-1 md:grid-cols-3` and `grid-cols-1 lg:grid-cols-12`).
   - Interactive Motion: 3D perspective mouse tilt (`rotateX`, `rotateY`, `translateY(-8px)`), interactive light sheen glare sweep, and "View project →" pill buttons linking to live external URLs.

5. Section 03 / Tech Stack & Ecosystem (`#sec-skills`):
   - Left Column: Interactive illustration box (`min-h-[380px] sm:min-h-[480px]`) with slate grid lines, center transparent developer character illustration (`/images/tech-developer-illustration-transparent.png`), and 6 levitating floating tech badges (**Node.js**, **HTML5**, **Google Cloud**, **React**, **Supabase**, **TypeScript**) using infinite CSS float keyframe loops.
   - Right Column: Categorized technology checklists (Frontend, Backend, CMS & Platforms, AI & Automation, Other Capabilities).

6. Section 04 / Services Offered (`#sec-services`):
   - 4 service cards (SaaS Platforms, Full-Stack Applications, Business Portals, Landing Pages) with deliverables bullet points and technology stack tags.

7. Cinematic Footer & Social Logos (`#sec-cta-footer`):
   - Dark background (`#050507`).
   - Headline: "Have an idea? Let's turn it into something real."
   - Action Buttons: Primary "Get In Touch" email button (`mailto:devendhargopagoni@gmail.com`) + Official SVG Brand Pills for GitHub, LinkedIn, and Instagram.
   - Footer Grid: 4-column layout for Bio, Navigation, Social Links, and Copyright.

Build Configuration:
- Ensure 0 unused variables or imports.
- Update `next.config.mjs` with `outputFileTracing: false`, `eslint: { ignoreDuringBuilds: true }`, and `typescript: { ignoreBuildErrors: true }` for clean Vercel deployments.
```

---
© 2026 Devender Gopagoni. All rights reserved.

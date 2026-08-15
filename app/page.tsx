import type { Metadata } from 'next';
import GlassHero from '@/components/glass-hero';

export const metadata: Metadata = {
  title: 'Devender — Personal Portfolio',
  description: 'Hi, I\'m Devender, a Full-Stack Web Developer and UI/UX-focused Product Builder. Personally designed interactive editorial portfolio showcasing engineering and creative product work.',
};

export default function Home() {
  return <GlassHero />;
}

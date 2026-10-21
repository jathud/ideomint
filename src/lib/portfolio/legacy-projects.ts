import type { PortfolioService } from './categories';

export interface ProjectPhoto {
  src: string;
  alt: string;
  theme: string;
}

export interface Project {
  revision?: string;
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  location: string;
  label: string;
  services: PortfolioService[];
  themes: string[];
  photos: ProjectPhoto[];
}

export const legacyProjects: Project[] = [
  {
    id: 'ideofest',
    index: '01',
    title: 'IdeoFest',
    subtitle: 'Sing-Along Jaffna',
    description:
      'A live music and cultural experience built from the ground up — concept, visual identity, ticketing platform, and event production, all under one roof.',
    role: 'Concept / Branding / Event Production / Platform',
    location: 'Jaffna, Sri Lanka',
    label: 'An IdeoMint Initiative',
    services: ['Marketing', 'Content & Creative'],
    themes: ['The Energy', 'The Experience', 'The Details'],
    photos: [
      { src: '/portfolio/ideofest/IMG_0889.WEBP', alt: 'IdeoFest organizing crew collaborating in official event gear', theme: 'The Energy' },
      { src: '/portfolio/ideofest/IMG_0887.WEBP', alt: 'Full amphitheater crowd gathered at IdeoFest with stage illumination', theme: 'The Energy' },
      { src: '/portfolio/ideofest/IMG_0885.WEBP', alt: 'Audience members cheering and clapping during live performances', theme: 'The Experience' },
      { src: '/portfolio/ideofest/IMG_0888.WEBP', alt: 'Attendees engaged in the live atmosphere and showcase sessions', theme: 'The Experience' },
      { src: '/portfolio/ideofest/IMG_0886.WEBP', alt: 'Host presenting on stage with the IdeoFest backdrop visual', theme: 'The Details' },
      { src: '/portfolio/ideofest/IMG_0884.WEBP', alt: 'Keynote speaker addressing the audience during the event', theme: 'The Details' },
    ],
  },
  {
    id: 'choice-to-lead',
    index: '02',
    title: 'Choice to Lead',
    subtitle: 'WUSC / GRIT',
    description:
      'Visual storytelling, media production, and experiential engagement for youth and women entrepreneurship initiatives across Sri Lanka.',
    role: 'Media Production / Visual Storytelling / Event Coverage',
    location: 'Sri Lanka',
    label: 'In partnership with WUSC & GRIT',
    services: ['Content & Creative'],
    themes: ['The Voices', 'The Commitments', 'The Interaction'],
    photos: [
      { src: '/portfolio/choice-to-lead/JK_D9461.JPG', alt: 'Young women entrepreneurs holding Choice to Lead future founder frame', theme: 'The Voices' },
      { src: '/portfolio/choice-to-lead/JK_D9587.JPG', alt: 'Production team capturing participant stories with professional camera rig', theme: 'The Voices' },
      { src: '/portfolio/choice-to-lead/JK_D9694.JPG', alt: 'Participant writing personal pledge on the Choice to Lead commitment board', theme: 'The Commitments' },
      { src: '/portfolio/choice-to-lead/JK_D9497.JPG', alt: 'Women founders celebrating entrepreneurship milestones with project frame', theme: 'The Commitments' },
      { src: '/portfolio/choice-to-lead/JK_D9420.JPG', alt: 'Event coordinators networking and discussing youth empowerment at the exhibition', theme: 'The Interaction' },
      { src: '/portfolio/choice-to-lead/JK_D9568.JPG', alt: 'Media crew and field directors coordinating video interviews and coverage', theme: 'The Interaction' },
      { src: '/portfolio/choice-to-lead/JK_D9582.JPG', alt: 'On-ground video production setup and interviews with aspiring founders', theme: 'The Interaction' },
    ],
  },
];

/* ─── Reduced-motion hook (useSyncExternalStore) ───────────────── */

// Types and sample data for Official SEBI Learning Guides
// Preference: use `type` instead of `interface`.

export type GuideLanguage = 'en' | 'hi';
export type GuideSourceType = 'pdf' | 'video' | 'audio';

export type GuideContentVariant = {
  language: GuideLanguage;
  title?: string;
  summary?: string;
  tags?: string[];
  mindmap_url?: string;
  audio_url?: string; // podcast/audio overview (supports GDrive preview URLs)
  video_url?: string; // video overview (supports YouTube watch/short URLs)
  study_guide_url?: string; // optional external PDF/URL
  study_markdown?: string; // raw markdown text rendered inline when provided
};

export type Guide = {
  id: string;
  title?: string;
  source_type: GuideSourceType;
  source_url: string;
  summary?: string;
  duration_minutes?: number; // optional total overview minutes
  tags?: string[];
  published?: boolean; // only at root level
  variants: GuideContentVariant[]; // per-language assets
};

// Temporary sample data. Replace with DB-backed fetch later.
export const officialGuides: Guide[] = [
  {
    id: 'investor-charter-basics',
    title: 'Investor Charter: Rights & Responsibilities',
    source_type: 'pdf',
    source_url: 'https://www.sebi.gov.in/official-docs/investor-charter.pdf',
    summary:
      'Understand your rights and obligations as an investor. A concise walkthrough of the official SEBI investor charter.',
    tags: ['SEBI', 'Investor Protection', 'Regulations'],
    variants: [
      {
        language: 'en',
        title: 'Investor Charter: Rights & Responsibilities',
        summary:
          'Understand your rights and obligations as an investor. A concise walkthrough of the official SEBI investor charter.',
        tags: ['SEBI', 'Investor Protection', 'Regulations'],
        mindmap_url: '/guides/mindmaps/investor-charter-en.png',
        audio_url: '/guides/audio/investor-charter-en.mp3',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        study_guide_url: '/guides/study/investor-charter-en.pdf',
      },
      {
        language: 'hi',
        title: 'Investor Charter: Rights & Responsibilities',
        summary:
          'Understand your rights and obligations as an investor. A concise walkthrough of the official SEBI investor charter.',
        tags: ['SEBI', 'Investor Protection', 'Regulations'],
        mindmap_url: '/guides/mindmaps/investor-charter-hi.png',
        audio_url: '/guides/audio/investor-charter-hi.mp3',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        study_guide_url: '/guides/study/investor-charter-hi.pdf',
      },
    ],
  },
  {
    id: 'ipo-essentials',
    title: 'IPO Essentials for Retail Investors',
    source_type: 'video',
    source_url: 'https://www.youtube.com/watch?v=example-ipo',
    summary:
      'A practical introduction to Initial Public Offerings, including application process, allotments and key risks.',
    tags: ['IPO', 'Primary Market'],
    variants: [
      {
        language: 'en',
        title: 'IPO Essentials for Retail Investors',
        summary:
          'A practical introduction to Initial Public Offerings, including application process, allotments and key risks.',
        tags: ['IPO', 'Primary Market'],
        mindmap_url: '/guides/mindmaps/ipo-essentials-en.png',
        audio_url: '/guides/audio/ipo-essentials-en.mp3',
        video_url: 'https://www.youtube.com/watch?v=example-ipo',
        study_guide_url: '/guides/study/ipo-essentials-en.pdf',
      },
      {
        language: 'hi',
        title: 'IPO Essentials for Retail Investors',
        summary:
          'A practical introduction to Initial Public Offerings, including application process, allotments and key risks.',
        tags: ['IPO', 'Primary Market'],
        mindmap_url: '/guides/mindmaps/ipo-essentials-hi.png',
        audio_url: '/guides/audio/ipo-essentials-hi.mp3',
        video_url: 'https://www.youtube.com/watch?v=example-ipo-hi',
        study_guide_url: '/guides/study/ipo-essentials-hi.pdf',
      },
    ],
  },
  {
    id: 'mutual-fund-beginners',
    title: 'Mutual Funds: A Beginner Guide',
    source_type: 'audio',
    source_url: '/guides/audio/mutual-funds-overview-en.mp3',
    summary:
      'Key concepts of mutual funds, NAV, expense ratios, SIPs and risk profiling — tailored for first-time investors.',
    tags: ['Mutual Funds', 'SIP'],
    variants: [
      {
        language: 'en',
        title: 'Mutual Funds: A Beginner Guide',
        summary:
          'Key concepts of mutual funds, NAV, expense ratios, SIPs and risk profiling — tailored for first-time investors.',
        tags: ['Mutual Funds', 'SIP'],
        mindmap_url: '/guides/mindmaps/mf-beginner-en.png',
        audio_url: '/guides/audio/mutual-funds-overview-en.mp3',
        video_url: 'https://www.youtube.com/watch?v=example-mf',
        study_guide_url: '/guides/study/mf-beginner-en.pdf',
      },
      {
        language: 'hi',
        title: 'Mutual Funds: A Beginner Guide',
        summary:
          'Key concepts of mutual funds, NAV, expense ratios, SIPs and risk profiling — tailored for first-time investors.',
        tags: ['Mutual Funds', 'SIP'],
        mindmap_url: '/guides/mindmaps/mf-beginner-hi.png',
        audio_url: '/guides/audio/mutual-funds-overview-hi.mp3',
        video_url: 'https://www.youtube.com/watch?v=example-mf-hi',
        study_guide_url: '/guides/study/mf-beginner-hi.pdf',
      },
    ],
  },
];

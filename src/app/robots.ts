import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ideomint.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/portfolio/media/'],
        disallow: [
          '/ideofest/admin',
          '/ideofest/dashboard',
          '/admin',
          '/api/',
        ],
      },
      {
        // Allow AI Crawlers for AEO (ChatGPT, Perplexity, Claude)
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-Web',
          'Google-Extended',
        ],
        allow: ['/', '/api/portfolio/media/'],
        disallow: [
          '/ideofest/admin',
          '/ideofest/dashboard',
          '/admin',
          '/api/',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/ideofest/sitemap.xml`,
    ],
  };
}

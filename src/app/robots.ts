import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ideomint.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/ideofest/admin/',
          '/ideofest/dashboard/',
          '/api/',
        ],
      },
      {
        // Allow AI Crawlers for AEO (ChatGPT, Perplexity, Claude)
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-Web',
          'Google-Extended',
        ],
        allow: '/',
        disallow: [
          '/ideofest/admin/',
          '/ideofest/dashboard/',
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

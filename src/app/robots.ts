import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'DeepSeekBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'Bytespider',
          'Diffbot',
          'FacebookBot',
          'Meta-ExternalAgent',
          'Amazonbot',
          'cohere-ai',
        ],
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://www.munchotella.md/sitemap.xml',
  };
}

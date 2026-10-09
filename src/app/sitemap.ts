import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.munchotella.md';
  const locales = ['ro', 'ru', 'en'];

  // Public indexable routes (checkout and private/admin routes strictly excluded)
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/menu', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/livrare', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/legal', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      // Romanian is the default locale served directly without /ro prefix (localePrefix: 'as-needed')
      // This prevents 308 redirects from /ro/* to /*, ensuring 100% 200 OK responses for Googlebot
      const pageUrl =
        locale === 'ro'
          ? route.path ? `${baseUrl}${route.path}` : baseUrl
          : `${baseUrl}/${locale}${route.path}`;

      sitemapEntries.push({
        url: pageUrl,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        // Google Search Central multilingual hreflang clustering
        alternates: {
          languages: {
            ro: route.path ? `${baseUrl}${route.path}` : baseUrl,
            ru: `${baseUrl}/ru${route.path}`,
            en: `${baseUrl}/en${route.path}`,
            'x-default': route.path ? `${baseUrl}${route.path}` : baseUrl,
          },
        },
      });
    });
  });

  return sitemapEntries;
}

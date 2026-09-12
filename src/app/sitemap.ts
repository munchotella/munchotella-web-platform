import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.munchotella.md';
  const locales = ['ro', 'en', 'ru'];
  const routes = ['', '/menu', '/livrare', '/about', '/contact', '/checkout', '/faq', '/legal'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : (route === '/menu' || route === '/livrare') ? 0.9 : 0.8,
      });
    });
  });

  return sitemapEntries;
}

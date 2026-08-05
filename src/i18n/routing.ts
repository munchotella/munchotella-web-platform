import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ro', 'ru', 'en'],
  defaultLocale: 'ro',
  // Configure to always require a locale prefix (e.g. /ro/about)
  localePrefix: 'always'
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);

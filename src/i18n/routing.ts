import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ro', 'ru', 'en'],
  defaultLocale: 'ro',
  // Serve default locale (ro) directly at root / without 307 redirect
  localePrefix: 'as-needed'
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);

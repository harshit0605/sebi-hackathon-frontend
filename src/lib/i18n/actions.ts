'use server';

import { cookies } from 'next/headers';
import { locales } from './config';

export type AppLocale = typeof locales[number];

export async function setLocaleCookie(locale: AppLocale) {
  const normalized = locales.includes(locale) ? locale : 'en';
  const oneYear = 60 * 60 * 24 * 365;
  const store = await cookies();
  store.set('NEXT_LOCALE', normalized, { path: '/', maxAge: oneYear });
  // Also set a custom cookie for potential future use
  store.set('tm_locale', normalized, { path: '/', maxAge: oneYear });
  return normalized;
}

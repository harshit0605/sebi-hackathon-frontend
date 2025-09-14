import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, type Locale } from '../lib/i18n/config';

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get('NEXT_LOCALE')?.value as Locale | undefined;
  const locale: Locale = (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) ? cookieLocale : 'en';

  return {
    locale,
    messages: (await import(`../lib/i18n/messages/${locale}.json`)).default,
    timeZone: 'Asia/Kolkata',
    now: new Date(),
    formats: {
      currency: {
        INR: {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
      number: {
        decimal: {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
        percentage: {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
        medium: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        },
      },
    },
  };
});

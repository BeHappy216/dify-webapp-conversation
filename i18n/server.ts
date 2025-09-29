import 'server-only'

import { cookies, headers } from 'next/headers'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'
import type { Locale } from '.'
import { i18n } from '.'

export const getLocaleOnServer = async (): Promise<Locale> => {
  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales

  let languages: string[] | undefined
  // get locale from cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')
  languages = localeCookie?.value ? [localeCookie.value] : []

  if (!languages.length) {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {}
    try {
      const headersList = await headers()
      headersList.forEach((value, key) => (negotiatorHeaders[key] = value))
      // Use negotiator and intl-localematcher to get best locale
      languages = new Negotiator({ headers: negotiatorHeaders }).languages()
    }
    catch (error) {
      console.error('Error in negotiator languages:', error)
      languages = [i18n.defaultLocale]
    }
  }

  // Sanitize and validate languages to ensure they are valid BCP 47 language tags
  // This prevents Intl.getCanonicalLocales from throwing errors
  const sanitizedLanguages = []
  if (Array.isArray(languages)) {
    for (const lang of languages) {
      if (typeof lang === 'string') {
        // Only accept valid BCP 47 language tags
        if (/^[a-zA-Z0-9-]+$/.test(lang))
          sanitizedLanguages.push(lang)
      }
    }
  }

  // If no valid languages found, use default
  if (sanitizedLanguages.length === 0)
    sanitizedLanguages.push(i18n.defaultLocale)

  // match locale
  try {
    // Verify that all locales are valid before matching
    const validLocales = locales.filter(locale =>
      typeof locale === 'string' && /^[a-zA-Z0-9-]+$/.test(locale),
    )

    if (validLocales.length === 0)
      return i18n.defaultLocale as Locale

    const matchedLocale = match(sanitizedLanguages, validLocales, i18n.defaultLocale) as Locale
    return matchedLocale
  }
  catch (error) {
    console.error('Error in locale matching:', error)
    return i18n.defaultLocale as Locale
  }
}

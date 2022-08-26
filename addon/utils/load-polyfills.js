export async function loadPolyfills() {
  await intlLocale();
  await intlPluralRules();
  await intlRelativeTimeFormat();
}

async function intlLocale() {
  if ('Intl' in window && 'locale' in Intl) {
    return;
  }

  await import('@formatjs/intl-locale/polyfill');
}

async function intlPluralRules() {
  if ('Intl' in window && 'PluralRules' in Intl) {
    return;
  }

  await import('@formatjs/intl-pluralrules/polyfill');
  await Promise.all([
    import('@formatjs/intl-pluralrules/locale-data/en'),
    import('@formatjs/intl-pluralrules/locale-data/es'),
    import('@formatjs/intl-pluralrules/locale-data/fr'),
  ]);
}

async function intlRelativeTimeFormat() {
  if ('Intl' in window && 'RelativeTimeFormat' in Intl) {
    return;
  }

  await import('@formatjs/intl-relativetimeformat/polyfill');
  await Promise.all([
    import('@formatjs/intl-relativetimeformat/locale-data/en'),
    import('@formatjs/intl-relativetimeformat/locale-data/es'),
    import('@formatjs/intl-relativetimeformat/locale-data/fr'),
  ]);
}

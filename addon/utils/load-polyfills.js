export async function loadPolyfills() {
  await intlPluralRules();
  await intlRelativeTimeFormat();
}

async function intlPluralRules() {
  if ('Intl' in window && 'PluralRules' in Intl) {
    return;
  }

  await import('@formatjs/intl-pluralrules/polyfill');
  await import('@formatjs/intl-pluralrules/dist/locale-data/en');
  await import('@formatjs/intl-pluralrules/dist/locale-data/es');
  await import('@formatjs/intl-pluralrules/dist/locale-data/fr');
}

async function intlRelativeTimeFormat() {
  if ('Intl' in window && 'RelativeTimeFormat' in Intl) {
    return;
  }
  import('@formatjs/intl-relativetimeformat/polyfill');
  import('@formatjs/intl-relativetimeformat/dist/locale-data/en');
  import('@formatjs/intl-relativetimeformat/dist/locale-data/es');
  import('@formatjs/intl-relativetimeformat/dist/locale-data/fr');
}

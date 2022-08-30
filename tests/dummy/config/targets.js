'use strict';

const browsers = ['last 1 Chrome versions', 'last 1 Firefox versions', 'last 1 Safari versions'];

const isCI = Boolean(process.env.CI);
const isProduction = process.env.EMBER_ENV === 'production';

if (isCI || isProduction) {
  browsers.push('last 1 edge versions');
  browsers.push('firefox esr'); //sometimes points to the last 2 ESR releases when they overlap
  browsers.push('last 2 iOS major versions');
  browsers.push('last 3 safari major versions');
}

module.exports = {
  browsers,
};

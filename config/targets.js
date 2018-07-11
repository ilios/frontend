'use strict';

const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions'
];

const isCI = !!process.env.CI;
const isProductionLikeBuild = ['production', 'preview'].includes(process.env.EMBER_ENV);

if (isCI || isProductionLikeBuild) {
  browsers.push('last 1 edge versions');
  browsers.push('firefox esr'); //sometimes points to the last 2 ESR releases when they overlap
  browsers.push('last 1 ios versions');
  browsers.push('> 1%'); // any browser with more than 1% global market share
}

module.exports = {
  browsers
};

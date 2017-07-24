/* eslint-env node */

// Which browsers are returned can be found at http://browserl.ist/
module.exports = {
  browsers: [
    'last 1 edge versions',
    'last 1 chrome versions',
    'firefox esr', //actually points to the last 2 ESR releases as they overlap
    'last 1 safari versions',
    'last 1 ios versions',
    'last 1 android versions',
  ]
};

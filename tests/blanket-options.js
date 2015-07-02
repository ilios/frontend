/* globals blanket, module */

var options = {
  modulePrefix: 'ilios',
  filter: '//.*ilios/.*/',
  antifilter: '//.*(tests|template|mirage).*/',
  loaderExclusions: [],
  enableCoverage: true,
  cliOptions: {
    lcovOptions: {
      outputFile: 'lcov.dat',
      renamer: function(moduleName){
        moduleName = moduleName.replace(/^ilios/, 'app') + '.js';
        moduleName = moduleName.replace(/^app\/config/, 'config');

        return moduleName;
      }
    },
    reporters: ['lcov'],
    autostart: true
  }
};
if (typeof exports === 'undefined') {
  blanket.options(options);
} else {
  module.exports = options;
}

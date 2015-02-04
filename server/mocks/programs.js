module.exports = function(app) {
  var fixtures = require ('../fixtures/programs.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('program', fixtures);
  app.use('/api/programs', router);
};

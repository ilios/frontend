module.exports = function(app) {
  var fixtures = require ('../fixtures/disciplines.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('discipline', fixtures);
  app.use('/api/disciplines', router);
};

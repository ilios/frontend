module.exports = function(app) {
  var fixtures = require ('../fixtures/programYears.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('programYear', fixtures);
  app.use('/api/programYears', router);
};

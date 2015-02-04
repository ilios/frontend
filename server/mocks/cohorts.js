module.exports = function(app) {
  var fixtures = require ('../fixtures/cohorts.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('cohort', fixtures);
  app.use('/api/cohorts', router);
};

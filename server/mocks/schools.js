module.exports = function(app) {
  var fixtures = require ('../fixtures/schools.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('school', fixtures);
  app.use('/api/schools', router);
};

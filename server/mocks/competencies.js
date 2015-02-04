module.exports = function(app) {
  var fixtures = require ('../fixtures/competencies.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('competency', fixtures);
  app.use('/api/competencies', router);
};

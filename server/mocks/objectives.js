module.exports = function(app) {
  var fixtures = require ('../fixtures/objectives.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('objective', fixtures);
  app.use('/api/objectives', router);
};

module.exports = function(app) {
  var fixtures = require ('../fixtures/sessions.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('session', fixtures);
  app.use('/api/sessions', router);
};

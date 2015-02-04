module.exports = function(app) {
  var fixtures = require ('../fixtures/offerings.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('offering', fixtures);
  app.use('/api/offerings', router);
};

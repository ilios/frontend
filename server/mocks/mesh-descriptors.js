module.exports = function(app) {
  var fixtures = require ('../fixtures/meshDescriptors.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('meshDescriptor', fixtures);
  app.use('/api/meshDescriptors', router);
};

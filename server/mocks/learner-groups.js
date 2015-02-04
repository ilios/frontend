module.exports = function(app) {
  var fixtures = require ('../fixtures/learnerGroups.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('learnerGroup', fixtures);
  app.use('/api/learnergroups', router);
};

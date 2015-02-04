module.exports = function(app) {
  var fixtures = require ('../fixtures/courses.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('course', fixtures);
  app.use('/api/courses', router);
};

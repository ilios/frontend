module.exports = function(app) {
  var fixtures = [
      {
        id: 0,
        title: 'First Test Course',
        sessions: [0]
      },
      {
        id: 1,
        title: 'Second Test Course',
        sessions: [1]
      },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('course', fixtures);
  app.use('/api/courses', router);
};

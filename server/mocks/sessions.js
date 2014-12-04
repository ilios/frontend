module.exports = function(app) {
  var fixtures = [
      {
        id: 0,
        title: 'First Test Session',
        course: 0,
        offerings: [0,1,2,4]
      },
      {
        id: 1,
        title: 'Second Test Session',
        course: 1,
        offerings: [3]
      },
      {
        id: 2,
        title: 'Third Test Session',
        course: 0,
        offerings: []
      },
      {
        id: 3,
        title: 'Fourth Test Session',
        course: 0,
        offerings: []
      },
  ];

  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('session', fixtures);
  app.use('/api/sessions', router);
};

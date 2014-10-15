module.exports = function(app) {
  var fixtures = [
      {
        id: 0,
        title: 'First Test Session',
        course: 0,
        offerings: [0,1,2,3,4]
      },
  ];

  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('session', fixtures);
  app.use('/api/sessions', router);
};

module.exports = function(app) {
  var fixtures = [
    {
      id: 0,
      title: 'First Objective',
      competency: 0
    },
    {
      id: 1,
      title: 'Second Objective',
      competency: 0
    },
    {
      id: 2,
      title: 'Third Objective',
      competency: 0
    },
    {
      id: 3,
      title: 'Fourth Objective',
      competency: 0
    },

  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('objective', fixtures);
  app.use('/api/objectives', router);
};

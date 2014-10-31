module.exports = function(app) {
  var fixtures = [
      {
        id: 0,
        title: '',
        programYear: 1,
        learnerGroups: [0,1,2,3]
      },
      {
        id: 1,
        title: '',
        programYear: 0
      },
      {
        id: 2,
        title: 'Overridden Title',
        programYear: 2
      },
      {
        id: 3,
        title: null,
        programYear: 3
      },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('cohort', fixtures);
  app.use('/api/cohorts', router);
};

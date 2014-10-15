module.exports = function(app) {
  var fixtures = [
    {
      id: 0,
      title: 'First Discipline',
      owningSchool: 0,
      programYears: [0,1,2]
    },
    {
      id: 1,
      title: 'Second Discipline',
      owningSchool: 0,
      programYears: []
    },
    {
      id: 2,
      title: 'Third Discipline',
      owningSchool: 0,
      programYears: [0,1,2]
    },
    {
      id: 3,
      title: 'Fourth Discipline',
      owningSchool: 0,
      programYears: []
    },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('discipline', fixtures);
  app.use('/api/disciplines', router);
};

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
    {
      id: 4,
      title: 'Anamatronics',
      owningSchool: 0,
      programYears: []
    },
    {
      id: 5,
      title: 'A really long name that takes up more space than you expect',
      owningSchool: 0,
      programYears: []
    },
    {
      id: 6,
      title: 'Being Green',
      owningSchool: 0,
      programYears: []
    },
    {
      id: 7,
      title: 'Counting Eggs (pre-hatch)',
      owningSchool: 0,
      programYears: []
    },
    {
      id: 8,
      title: 'Counting Eggs (post-hatch)',
      owningSchool: 0,
      programYears: []
    },
    {
      id: 9,
      title: 'Surviving as a DeadHead',
      owningSchool: 0,
      programYears: []
    },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('discipline', fixtures);
  app.use('/api/disciplines', router);
};

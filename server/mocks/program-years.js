module.exports = function(app) {
  var moment = require('moment');
  var baseDate = moment('2014-06-01');
  var fixtures = [
    {
      id: 0,
      startYear: baseDate.format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 0,
      directors: [0],
      competencies: [4,2],
      objectives: [0,1],
      topics: [0,2],
      stewardingSchools: [1],
      cohort: 1
    },
    {
      id: 1,
      startYear: baseDate.subtract(1, 'year').format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 0,
      directors: [0],
      competencies: [0,2,4],
      objectives: [2,3],
      topics: [0,2],
      stewardingSchools: [1,2],
      cohort: 0
    },
    {
      id: 2,
      startYear: baseDate.format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 1,
      directors: [0],
      competencies: [0,2],
      objectives: [],
      topics: [0,2],
      cohort: 2
    },
    {
      id: 3,
      startYear: baseDate.subtract(1, 'year').format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 1,
      directors: [0],
      competencies: [0,2],
      objectives: [],
      cohort: 3
    },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('programYear', fixtures);
  app.use('/api/programYears', router);
};

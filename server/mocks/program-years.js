module.exports = function(app) {
  var moment = require('moment');
  var fixtures = [
    {
      id: 0,
      startYear: moment().format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 0,
      directors: [0],
      competencies: [4,2],
      objectives: [0,1],
      topics: [0,2],
      stewardingSchools: [1]
    },
    {
      id: 1,
      startYear: moment().subtract(1, 'year').format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 0,
      directors: [0],
      competencies: [0,2,4],
      objectives: [2,3],
      topics: [0,2],
      stewardingSchools: [1,2]
    },
    {
      id: 2,
      startYear: moment().format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 1,
      directors: [0],
      competencies: [0,2],
      objectives: [],
      topics: [0,2]
    },
    {
      id: 3,
      startYear: moment().subtract(1, 'year').format('YYYY'),
      deleted: false,
      locked: false,
      archived: false,
      publishedAsTbd: false,
      program: 1,
      directors: [0],
      competencies: [0,2],
      objectives: []
    },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('programYear', fixtures);
  app.use('/api/programYears', router);
};

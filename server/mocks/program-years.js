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
      competencies: [0,2],
      objectives: [0,1,2,3],
      topics: [0,2]
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
      competencies: [0,2],
      objectives: [0,1,2,3],
      topics: [0,2]
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
      objectives: [0,1,2,3],
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
      objectives: [0,1,2,3]
    },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('programYear', fixtures);
  router.put('/:id', function(req, res) {
    if(req.params.id in fixtures){
        var programYear = req.body.programYear;
        fixtures[req.params.id].startYear = programYear.startYear;
        fixtures[req.params.id].deleted = programYear.deleted;
        fixtures[req.params.id].locked = programYear.locked;
        fixtures[req.params.id].archived = programYear.archived;
        fixtures[req.params.id].publishedAsTbd = programYear.publishedAsTbd;
        fixtures[req.params.id].program = programYear.program;
        fixtures[req.params.id].directors = programYear.directors;
        fixtures[req.params.id].competencies = programYear.competencies;
        fixtures[req.params.id].objectives = programYear.objectives;
        fixtures[req.params.id].topics = programYear.topics;

        res.send({'programYear': fixtures[req.params.id]});
    } else {
        res.status(404).end();
    }

  });
  app.use('/api/programYears', router);
};

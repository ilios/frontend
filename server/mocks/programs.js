module.exports = function(app) {
  var fixtures = [
    {
      id: 0,
      title: 'First Test Program',
      shortTitle: 'ftp',
      duration: 4,
      isDeleted: false,
      publishedAsTbd: false,
      owningSchool: 0,
      programYears: [0,1]
    },
    {
      id: 1,
      title: 'Second Test Program',
      shortTitle: 'stp',
      duration: 3,
      isDeleted: false,
      publishedAsTbd: false,
      owningSchool: 0,
      programYears: [2,3]

    },
  ];

  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('program', fixtures);
  router.put('/:id', function(req, res) {
    if(req.params.id in fixtures){
        var program = req.body.program;
        fixtures[req.params.id].title = program.title;
        fixtures[req.params.id].shortTitle = program.shortTitle;
        fixtures[req.params.id].duration = program.duration;
        fixtures[req.params.id].publishedAsTbd = program.publishedAsTbd;

        res.send({'program': fixtures[req.params.id]});
    } else {
        res.status(404).end();
    }

  });
  app.use('/api/programs', router);
};

module.exports = function(app) {
  var express = require('express');
  var programsRouter = express.Router();
  var fixtures = [
    {
      id: 0,
      title: 'First Test Program',
      shortTitle: 'ftp',
      duration: 4,
      isDeleted: false,
      publishedAsTbd: false,
      owningSchool: 0
    },
    {
      id: 1,
      title: 'Second Test Program',
      shortTitle: 'stp',
      duration: 3,
      isDeleted: false,
      publishedAsTbd: false,
      owningSchool: 0
    },
  ];
  programsRouter.get('/:id', function(req, res) {
      if(req.params.id in fixtures){
          res.send({"programs": fixtures[req.params.id]});
      } else {
          res.status(404).end();
      }
  });
  programsRouter.get('/', function(req, res) {
    var response = [];
    if(req.query.ids !== undefined){
        for(var i = 0; i< req.query.ids.length; i++){
            if(req.query.ids[i] in fixtures){
                response.push(fixtures[req.query.ids[i]]);
            }
        }
    } else {
        response = fixtures;
    }
    res.send({'programs': response});
  });
  programsRouter.post('/', function(req, res) {
    var program = req.body.program;
    program.id = fixtures.length;
    fixtures.push(program);

    res.send({'program': program});
  });
  programsRouter.put('/:id', function(req, res) {
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
  app.use('/api/programs', programsRouter);
};

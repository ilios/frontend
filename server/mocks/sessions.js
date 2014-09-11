module.exports = function(app) {
  var express = require('express');
  var sessionsRouter = express.Router();
  var fixtures = [
      {
        id: 0,
        title: 'First Test Session',
        course: 0,
        offerings: [0,1,2,3,4]
      },
  ];

  sessionsRouter.get('/:id', function(req, res) {
      if(req.params.id in fixtures){
          res.send({sessions: fixtures[req.params.id]});
      } else {
          res.status(404).end();
      }
  });
  sessionsRouter.get('/', function(req, res) {
    res.send({sessions: fixtures});
  });
  app.use('/api/sessions', sessionsRouter);
};

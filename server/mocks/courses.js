module.exports = function(app) {
  var express = require('express');
  var coursesRouter = express.Router();
  var fixtures = [
      {
        id: 0,
        title: 'First Test Course',
        sessions: [0]
      },
  ];

  coursesRouter.get('/:id', function(req, res) {
      if(req.params.id in fixtures){
          res.send({"courses": fixtures[req.params.id]});
      } else {
          res.status(404).end();
      }
  });
  coursesRouter.get('/', function(req, res) {
    res.send({"courses": fixtures});
  });
  app.use('/api/courses', coursesRouter);
};

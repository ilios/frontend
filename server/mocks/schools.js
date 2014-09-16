module.exports = function(app) {
  var express = require('express');
  var schoolsRouter = express.Router();
  var fixtures = [
    {
      id: 0,
      title: 'First Test School',
      iliosAdministratorEmail: 'test@example.com',
      isDeleted: false,
      programs: [0,1]
    },
    {
      id: 1,
      title: 'Second Test School',
      iliosAdministratorEmail: 'test@example.com',
      isDeleted: false
    }
  ];
  schoolsRouter.get('/:id', function(req, res) {
      if(req.params.id in fixtures){
          res.send({'schools': fixtures[req.params.id]});
      } else {
          res.status(404).end();
      }
  });
  schoolsRouter.get('/', function(req, res) {
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
    res.send({'schools': response});
  });
  app.use('/api/schools', schoolsRouter);
};

module.exports = function(app) {
  var express = require('express');
  var usersRouter = express.Router();
  var fixture = [
      {
        id: 0,
        firstName: 'Test',
        lastName: 'User',
        middleName: 'First',
        email: 'test.user@example.com',
        enabled: true,
        ucUid: '123456789',
        offerings: [0,1,2,3,4]
      },
      {
        id: 1,
        firstName: 'Test',
        lastName: 'Person',
        middleName: 'Second',
        email: 'test.person@example.com',
        enabled: true,
        ucUid: '123456798'
      },
  ];

  usersRouter.get('/:id', function(req, res) {
      if(req.params.id in fixture){
          res.send({users: fixture[req.params.id]});
      } else {
          res.status(404).end();
      }
  });

  usersRouter.get('/', function(req, res) {
    res.send({users: fixture});
  });
  app.use('/api/users', usersRouter);
};

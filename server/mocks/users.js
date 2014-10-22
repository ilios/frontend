module.exports = function(app) {
  var express = require('express');
  var fixtures = [
      {
        id: 0,
        firstName: 'Test',
        lastName: 'User',
        middleName: 'First',
        email: 'test.user@example.com',
        enabled: true,
        ucUid: '123456789',
        offerings: [0,1,2,3,4],
        schools: [0,1],
        primarySchool: 0
      },
      {
        id: 1,
        firstName: 'Test',
        lastName: 'Person',
        middleName: 'Second',
        email: 'test.person@example.com',
        enabled: true,
        ucUid: '123456798',
        schools: [1],
        primarySchool: 1
      },
      {
        id: 2,
        firstName: 'Cool',
        lastName: 'Guy',
        middleName: 'est',
        email: 'coolguy@example.com',
        enabled: true,
        ucUid: '123456777',
        schools: []
      },
  ];

  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('user', fixtures);
  app.use('/api/users', router);
};

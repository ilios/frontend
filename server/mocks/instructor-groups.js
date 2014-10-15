module.exports = function(app) {
  var express = require('express');
  var fixtures = [
    {
      id: 0,
      title: 'First Instructor Group',
      school: 0,
      users: [2]
    },
    {
      id: 1,
      title: 'Second Instructor Group',
      school: 0,
      users: [0,1]
    },
    {
      id: 2,
      title: 'Third Instructor Group',
      school: 0,
      users: [0,1],
      offerings: [0,3]
    }
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('instructorGroup', fixtures);
  app.use('/api/instructorGroups', router);
};

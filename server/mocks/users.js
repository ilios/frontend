module.exports = function(app) {
  var express = require('express');
  var fixtures = require ('../fixtures/users.js');
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('user', fixtures);

  app.use('/api/users', router);
};

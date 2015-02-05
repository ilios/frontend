module.exports = function(app) {
  var express = require('express');
  var currentsessionRouter = express.Router();
  currentsessionRouter.get('/', function(req, res) {
    res.send({currentsession:{userId: 16}});
  });
  app.use('/api/currentsession', currentsessionRouter);
};

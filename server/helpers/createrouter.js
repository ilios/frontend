module.exports = function(name, fixtures) {
  var express = require('express');
  var router = express.Router();
  var nextId = fixtures.length;
  var responseObj = {};
  router.get('/:id', function(req, res) {
      if(req.params.id in fixtures){
          responseObj[name] = fixtures[req.params.id];
          res.send(responseObj);
      } else {
          res.status(404).end();
      }
  });
  router.get('/', function(req, res) {
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
    responseObj[name] = response;
    res.send(responseObj);
  });
  router.post('/', function(req, res) {
    var obj = req.body[name];
    obj.id = nextId++;
    responseObj[name] = obj;
    res.send(responseObj);
  });
  router.put('/:id', function(req, res) {
    if(req.params.id in fixtures){
        responseObj[name] = req.body[name];
        responseObj[name].id = req.params.id;
        res.send(responseObj);
    } else {
        res.status(404).end();
    }

  });

  return router;
};

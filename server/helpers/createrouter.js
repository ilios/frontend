var defaultGetSingle = function(name, req, res, fixtures){
  var responseObj = {};
  if(req.params.id in fixtures){
    responseObj[name] = fixtures[req.params.id];
    res.send(responseObj);
  } else {
    res.status(404).end();
  }
};

var defaultGetGroup = function(name, req, res, fixtures){
  var responseObj = {};
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
};

var defaultPost = function(name, req, res, fixtures){
  var responseObj = {};
  if(req.body === undefined){
    console.log('You need to install the body-parser node library.');
    return;
  }
  var obj = req.body[name];
  obj.id = fixtures.length;
  responseObj[name] = obj;
  res.send(responseObj);
};

var defaultPut = function(name, req, res, fixtures){
  var responseObj = {};
  if(req.params.id in fixtures){
    responseObj[name] = req.body[name];
    responseObj[name].id = req.params.id;
    res.send(responseObj);
  } else {
    res.status(404).end();
  }
};


module.exports = function(name, fixtures, getSingle,  getGroup,  post,  put) {
  var express = require('express');
  var router = express.Router();
  router.get('/:id', function(req, res) {
    var callback = typeof getSingle !== 'undefined' ? getSingle : defaultGetSingle;
    callback(name, req, res, fixtures);
  });
  router.get('/', function(req, res) {
    var callback = typeof getSingle !== 'undefined' ? getGroup : defaultGetGroup;
    callback(name, req, res, fixtures);
  });
  router.post('/', function(req, res) {
    var callback = typeof getSingle !== 'undefined' ? post : defaultPost;
    callback(name, req, res, fixtures);
  });
  router.put('/:id', function(req, res) {
    var callback = typeof getSingle !== 'undefined' ? put : defaultPut;
    callback(name, req, res, fixtures);
  });

  return router;
};

var defaultCallbacks = {};

defaultCallbacks.getSingle = function(name, req, res, fixtures){
  var responseObj = {};
  if(req.params.id in fixtures){
    responseObj[name] = fixtures[req.params.id];
    res.send(responseObj);
  } else {
    res.status(404).end();
  }
};

defaultCallbacks.getGroup = function(name, req, res, fixtures){
  var responseObj = {};
  var response = [];
  if(req.query !== undefined && req.query.filters !== undefined && req.query.filters.id !== undefined){
    var ids = req.query.filters.id;
    for(var i = 0; i< ids.length; i++){
      if(ids[i] in fixtures){
        response.push(fixtures[ids[i]]);
      }
    }
  } else {
    response = fixtures;
  }
  responseObj[name] = response;
  res.send(responseObj);
};

defaultCallbacks.post = function(name, req, res, fixtures){
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

defaultCallbacks.put = function(name, req, res, fixtures){
  var responseObj = {};
  if(req.params.id in fixtures){
    responseObj[name] = req.body[name];
    responseObj[name].id = req.params.id;
    res.send(responseObj);
  } else {
    res.status(404).end();
  }
};


module.exports = function(name, fixtures, callbacks) {
  if(typeof callbacks == 'undefined'){
    callbacks = {};
  }
  var getCallback = function(name){
    if(callbacks.hasOwnProperty(name) && typeof callbacks[name] == 'function'){
      return callbacks[name];
    }
    return defaultCallbacks[name];
  };
  var express = require('express');
  var router = express.Router();
  router.get('/:id', function(req, res) {
    var callback = getCallback('getSingle');
    callback(name, req, res, fixtures);
  });
  router.get('/', function(req, res) {
    var callback = getCallback('getGroup');
    callback(name, req, res, fixtures);
  });
  router.post('/', function(req, res) {
    var callback = getCallback('post');
    callback(name, req, res, fixtures);
  });
  router.put('/:id', function(req, res) {
    var callback = getCallback('put');
    callback(name, req, res, fixtures);
  });

  return router;
};

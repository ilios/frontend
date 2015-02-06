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
  var filterByProperty = function(obj){
    if(filter instanceof Array){
      if(obj[prop] === undefined){
        return false;
      }
      return filter.indexOf(obj[prop].toString()) != -1;
    } else {
      if(obj[prop] === undefined){
        return filter == 'null';
      }
      return obj[prop] == filter;
    }
  };
  if(req.query !== undefined && req.query.filters !== undefined){
    for(var id in fixtures){
      response.push(fixtures[id]);
    }
    for(var prop in req.query.filters){
      var filter = req.query.filters[prop];
      response = response.filter(filterByProperty);
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

var defaultCallbacks = {};

defaultCallbacks.getSingle = function(name, req, res){
  var pluralize = require('pluralize');
  var fixtureStorage = require('./fixtureStorage.js');
  var fixtures = fixtureStorage.get(name);
  var responseObj = {};
  var singularName = pluralize(name, 1);
  if(req.params.id in fixtures){
    responseObj[singularName] = fixtures[req.params.id];
    res.send(responseObj);
  } else {
    res.status(404).end();
  }
};

defaultCallbacks.getGroup = function(name, req, res){
  var pluralize = require('pluralize');
  var fixtureStorage = require('./fixtureStorage.js');
  var fixtures = fixtureStorage.get(name);
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
      if (filter == 'false'){
        filter = false;
      }
      return obj[prop] == filter;
    }
  };
  for(var id in fixtures){
    response.push(fixtures[id]);
  }
  if(req.query !== undefined && req.query.filters !== undefined){
    for(var prop in req.query.filters){
      var filter = req.query.filters[prop];
      response = response.filter(filterByProperty);
    }
  }
  if(req.query !== undefined && req.query.limit !== undefined){
    response = response.slice(0, req.query.limit);
  }
  responseObj[name] = response;
  res.send(responseObj);
};

defaultCallbacks.post = function(name, req, res){
  var pluralize = require('pluralize');
  var fixtureStorage = require('./fixtureStorage.js');
  var fixtures = fixtureStorage.get(name);
  var responseObj = {};
  var singularName = pluralize(name, 1);
  if(req.body === undefined){
    console.log('You need to install the body-parser node library.');
    return;
  }
  var obj = req.body[singularName];
  var id = Object.keys(fixtures).length;
  obj.id = id;
  fixtureStorage.save(name, obj);
  responseObj[singularName] = fixtureStorage.get(name)[id];
  res.send(responseObj);
};

defaultCallbacks.put = function(name, req, res){
  var pluralize = require('pluralize');
  var fixtureStorage = require('./fixtureStorage.js');
  var fixtures = fixtureStorage.get(name);
  var responseObj = {};
  var singularName = pluralize(name, 1);
  if(req.params.id in fixtures){
    var changedObject = req.body[singularName];
    changedObject.id = req.params.id;
    fixtureStorage.save(name, changedObject);
    responseObj[singularName] = fixtureStorage.get(name)[changedObject.id];
    res.send(responseObj);
  } else {
    res.status(404).end();
  }
};

defaultCallbacks.delete = function(name, req, res){
  var pluralize = require('pluralize');
  var fixtureStorage = require('./fixtureStorage.js');
  var fixtures = fixtureStorage.get(name);
  var singularName = pluralize(name, 1);
  if(req.params.id in fixtures){
    fixtureStorage.remove(name, req.params.id);
    res.send();
  } else {
    res.status(404).end();
  }
};

module.exports = function(name, callbacks) {
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
    callback(name, req, res);
  });
  router.get('/', function(req, res) {
    var callback = getCallback('getGroup');
    callback(name, req, res);
  });
  router.post('/', function(req, res) {
    var callback = getCallback('post');
    callback(name, req, res);
  });
  router.put('/:id', function(req, res) {
    var callback = getCallback('put');
    callback(name, req, res);
  });
  router.delete('/:id', function(req, res) {
    var callback = getCallback('delete');
    callback(name, req, res);
  });

  return router;
};

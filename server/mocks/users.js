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
        primarySchool: 0,
        directedCourses: [0]
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
        primarySchool: 1,
        directedCourses: [0]
      },
      {
        id: 2,
        firstName: 'Cool',
        lastName: 'Guy',
        middleName: 'est',
        email: 'coolguy@example.com',
        enabled: true,
        ucUid: '123456777',
        schools: [],
        directedCourses: [0]
      },
  ];

  var createRouter = require('../helpers/createrouter.js');

  var getGroup = function(name, req, res, fixtures){
    var responseObj = {};
    var response = [];
    if(req.query.ids !== undefined){
      for(var i = 0; i< req.query.ids.length; i++){
        if(req.query.ids[i] in fixtures){
          response.push(fixtures[req.query.ids[i]]);
        }
      }
    } else if(req.query.searchTerm !== undefined){
      var terms = req.query.searchTerm.replace(/[ ,]+/g, ' ').split(' ').map(function(t){
        return '(?=.*' + t + ')';
      }).join('');
      var exp = new RegExp(terms, 'gi');
      for(var j = 0; j< fixtures.length; j++){
        var obj = fixtures[j];
        var fullString = [
          obj.firstName,
          obj.lastName,
          obj.email
        ].join(' ');
        if (fullString.match(exp)){
          response.push(obj);
        }
      }
    } else {
      response = fixtures;
    }
    responseObj[name] = response;
    res.send(responseObj);
  };

  var router = createRouter('user', fixtures, {getGroup: getGroup});

  app.use('/api/users', router);
};

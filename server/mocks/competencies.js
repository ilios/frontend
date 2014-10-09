module.exports = function(app) {
  var express = require('express');
  var fixtures = [
    {
      id: 0,
      title: 'First Competency',
      owningSchool: 0,
      parent: null,
      children: [4,5,6],
      programYears: [1,2]
    },
    {
      id: 1,
      title: 'Second Competency',
      owningSchool: 0,
      parent: null
    },
    {
      id: 2,
      title: 'Third Competency',
      owningSchool: 0,
      parent: null,
      programYears: [0,1,2]
    },
    {
      id: 3,
      title: 'Fourth Competency',
      owningSchool: 0,
      parent: null
    },
    {
      id: 4,
      title: 'First Child Competency',
      owningSchool: 0,
      parent: 0,
      programYears: [0,1]
    },
    {
      id: 5,
      title: 'Second Child Competency',
      owningSchool: 0,
      parent: 0
    },
    {
      id: 6,
      title: 'Third Child Competency',
      owningSchool: 0,
      parent: 0
    },
  ];
  var router = express.Router();
  router.get('/:id', function(req, res) {
    var responseObj = {};
    if(req.params.id in fixtures){
        responseObj.competency = fixtures[req.params.id];
        res.send(responseObj);
    } else {
        res.status(404).end();
    }
  });
  router.post('/', function(req, res) {
    var obj = req.body.competency;
    obj.id = fixtures.length;
    fixtures.push(obj);
    responseObj.competency = obj;
    res.send(responseObj);
  });

  router.get('/', function(req, res) {
    var responseObj = {};
    var response = [];
    if(req.query.ids !== undefined){
        for(var i = 0; i< req.query.ids.length; i++){
            if(req.query.ids[i] in fixtures){
                response.push(fixtures[req.query.ids[i]]);
            }
        }
    } else if (req.query.parent !== undefined){
        if(req.query.parent === ''){
          req.query.parent = null;
        }
        for(var j = 0; j< fixtures.length; j++){
            if(fixtures[j].parent == req.query.parent){
                response.push(fixtures[j]);
            }
        }
    } else {
        response = fixtures;
    }
    responseObj.competencies = response;
    res.send(responseObj);
  });
  app.use('/api/competencies', router);
};

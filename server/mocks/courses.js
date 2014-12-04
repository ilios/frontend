module.exports = function(app) {
  var fixtures = [
      {
        id: 0,
        title: 'First Test Course',
        sessions: [0,2,3],
        owningSchool: 0,
        level: 1,
        externalId: 'ili-tc1',
        startDate: '2013-08-01',
        endDate: '2013-12-31',
        year: '2013'
      },
      {
        id: 1,
        title: 'Second Test Course',
        sessions: [1],
        owningSchool: 0,
        level: 1,
        year: '2013'
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
    } else if(req.query.school !== undefined && req.query.year !== undefined){
      var schoolId = req.query.school;
      var yearId = req.query.year;
      for(var j = 0; j< fixtures.length; j++){
        var obj = fixtures[j];
        if(obj.owningSchool == schoolId && obj.year==yearId){
          response.push(obj);
        }
      }
    } else {
      response = fixtures;
    }
    responseObj[name] = response;
    res.send(responseObj);
  };

  var router = createRouter('course', fixtures, {getGroup: getGroup});
  app.use('/api/courses', router);
};

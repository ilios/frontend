module.exports = function(app) {
  var moment = require('moment');
  var fixtures = [
    {
      id: 0,
      title: 'First Competency',
      owningSchool: 0,
      parent: null
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
      parent: null
    },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('competency', fixtures);
  app.use('/api/competencies', router);
};

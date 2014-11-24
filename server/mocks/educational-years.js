module.exports = function(app) {
  var fixtures = [
    {
      id: 0,
      title: '2013'
    },
    {
      id: 1,
      title: '2014'
    }
  ];

  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('educationalYear', fixtures);
  app.use('/api/educationalYears', router);
};

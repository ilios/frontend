module.exports = function(app) {
  var fixtures = [
      {
        id: 0,
        name: 'First Mesh Term',
        objectives: [0,4,6],
      },
      {
        id: 1,
        name: 'Second Mesh Term',
        objectives: [0,4,6],
        courses: [0]
      },
      {
        id: 2,
        name: 'Third Mesh Term',
        objectives: [],
        courses: [0]
      },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('meshDescriptor', fixtures);
  app.use('/api/meshDescriptors', router);
};

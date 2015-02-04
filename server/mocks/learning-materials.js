module.exports = function(app) {
  var fixtures = [
    {
      id: 0,
      title: 'First Learning Material',
      type: 'testtype',
      owner: 'user string',
      required: false,
      notes: 'some notes',
      courses: [0,1]
    },
    {
      id: 1,
      title: 'Second Learning Material',
      type: 'testtype',
      owner: 'user string',
      required: false,
      notes: 'some notes',
      courses: [0,1]
    },
    {
      id: 2,
      title: 'Third Learning Material',
      type: 'testtype',
      owner: 'user string',
      required: false,
      notes: 'some notes',
      courses: [0,1]
    },
    {
      id: 3,
      title: 'Fourth Learning Material',
      type: 'testtype',
      owner: 'user string',
      required: false,
      notes: 'some notes',
      courses: [0,1]
    },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('learningMaterial', fixtures);
  app.use('/api/learningMaterials', router);
};

module.exports = function(app) {
  var fixtures = [
    {
      id: 0,
      title: 'First Test School',
      iliosAdministratorEmail: 'test@example.com',
      isDeleted: false,
      programs: [0,1]
    },
    {
      id: 1,
      title: 'Second Test School',
      iliosAdministratorEmail: 'test@example.com',
      isDeleted: false,
      stewardedProgramYears: [0,1]
    }
  ];

  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('school', fixtures);
  app.use('/api/schools', router);
};

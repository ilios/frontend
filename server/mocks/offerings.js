module.exports = function(app) {
  var moment = require('moment');
  var fixtures = [
    {
      id: 0,
      start: moment().toDate(),
      end: moment().add(1, 'hours').toDate(),
      session: 0,
      users: [0],
      instructorGroups: [2]
    },
    {
      id: 1,
      start: moment().subtract(1, 'day').toDate(),
      end: moment().subtract(1, 'day').add(1, 'hours').toDate(),
      session: 0,
      users: [0]
    },
    {
      id: 2,
      start: moment().subtract(1, 'week').toDate(),
      end: moment().subtract(1, 'week').add(1, 'hours').toDate(),
      session: 0,
      users: [0]
    },
    {
      id: 3,
      start: moment().subtract(1, 'year').toDate(),
      end: moment().subtract(1, 'year').add(1, 'hours').toDate(),
      session: 1,
      users: [0],
      instructorGroups: [2]
    },
    {
      id: 4,
      start: moment().subtract(2, 'year').toDate(),
      end: moment().subtract(2, 'year').add(1, 'hours').toDate(),
      session: 0,
      users: [0]
    }
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('offering', fixtures);
  app.use('/api/offerings', router);
};

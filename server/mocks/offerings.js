module.exports = function(app) {
  var express = require('express');
  var moment = require('moment');
  var offeringsRouter = express.Router();
  var fixtures = [
      {
          id: 0,
          start: moment().toDate(),
          end: moment().add(1, 'hours').toDate(),
          session: 0,
          users: [0]
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
          session: 0,
          users: [0]
      },
      {
          id: 4,
          start: moment().subtract(2, 'year').toDate(),
          end: moment().subtract(2, 'year').add(1, 'hours').toDate(),
          session: 0,
          users: [0]
      }
    ];

    offeringsRouter.get('/:id', function(req, res) {
        if(req.params.id in fixtures){
            res.send({offerings: fixtures[req.params.id]});
        } else {
            res.status(404).end();
        }
    });
  offeringsRouter.get('/', function(req, res) {
    var response = [];
    if(req.query.ids !== undefined){
        for(var i = 0; i< req.query.ids.length; i++){
            if(req.query.ids[i] in fixtures){
                response.push(fixtures[req.query.ids[i]]);
            }
        }
    } else {
        response = fixtures;
    }
    res.send({'offerings': response});
  });
  app.use('/api/offerings', offeringsRouter);
};

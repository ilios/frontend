import Ember from 'ember';

import getAll from './get-all';
import getOne from './get-one';
import getName from './get-name';
import getQuery from './get-query';
import getFixture from './get-fixture';

export default function startServer() {
  let server = new Pretender(function() {
    this.get('/api/:model', function(request) {
      var obj = {};
      var name = getName(request.params.model);
      var fixture = getFixture(name);
      var results;
      if('q' in request.queryParams){
        results = getQuery(request.queryParams.q, name, fixture, request.queryParams.limit);
      } else {
        results = getAll(request.queryParams, fixture);
      }

      if(request.queryParams.limit){
        results = results.slice(0, request.queryParams.limit);
      }
      obj[name] = results;
      return [200, {"Content-Type": "application/json"}, JSON.stringify(obj)];
    });
    this.get('/api/:model/:id', function(request) {
      var obj = {};
      var name = getName(request.params.model);
      var fixture = getFixture(name);
      obj[name] = getOne(request.params.id, fixture);
      return [200, {"Content-Type": "application/json"}, JSON.stringify(obj)];
    });
  });

  return server;
}

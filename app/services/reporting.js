import Ember from 'ember';
import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

const { inject, Service, RSVP, computed } = Ember;
const { PromiseArray } = DS;
const { service } = inject;

export default Service.extend({
store: service(),
currentUser: service(),
reportsList: computed('currentUser.model.reports.[]', function(){
  let defer = RSVP.defer();
  this.get('currentUser').get('model').then( user => {
    user.get('reports').then( reports => {
      defer.resolve(reports);
    });
  });
  return PromiseArray.create({
    promise: defer.promise
  });
}),
getResults(report){
  const subject = report.get('subject');
  const object = report.get('prepositionalObject');
  const objectId = report.get('prepositionalObjectTableRowId');
  let defer = RSVP.defer();
  this.get('store').query(
    this.getModel(subject),
    this.getQuery(object, objectId)
  ).then(results => {
    let mappedResults =  results.map(result => {
      return this.mapResult(result, subject);
    }).sortBy('value');
    defer.resolve(mappedResults);
  });
  
  return DS.PromiseArray.create({
    promise: defer.promise
  });
},
getModel(subject){
  let model = subject.dasherize();
  if(model === 'instructor'){
    model = 'user';
  }
  if(model === 'mesh-term'){
    model = 'mesh-descriptor';
  }
  
  return model;
},
getQuery(object, objectId){
  let query = {
    limit: 1000
  };
  
  if(object && objectId){
    let what = pluralize(object.camelize());
    if(object === 'mesh term'){
      what = 'meshDescriptors';
    }
    query.filters = {};
    query.filters[what] = objectId;
  }
  
  return query;
},
mapResult(result, subject){
  let titleParam = 'title';
  if(subject === 'instructor'){
    titleParam = 'fullName';
  }
  if(subject === 'mesh-term'){
    titleParam = 'name';
  }
  
  return {
    value: result.get(titleParam)
  };
}
});

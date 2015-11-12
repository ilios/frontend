import Ember from 'ember';

const { inject } = Ember;
const { service } = inject;

export default Ember.Service.extend({
  store: service(),
  getResults(subject, object, objectId){
    return this.get('store').query(
      this.getModel(subject),
      this.getQuery(object, objectId)
    ).then(results => {
      return results.map(result => {
        return this.mapResult(result, object);
      });
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
      query.filters = {};
      query.filters[object] = objectId;
    }
    
    return query;
  },
  mapResult(result, object){
    let titleParam = 'title';
    if(object === 'instructor'){
      titleParam = 'fullName';
    }
    if(object === 'mesh-term'){
      titleParam = 'name';
    }
    
    return {
      value: result.get(titleParam)
    };
  }
});

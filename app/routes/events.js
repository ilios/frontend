import Ember from 'ember';

export default Ember.Route.extend({
  userEvents: Ember.inject.service(),
  schoolEvents: Ember.inject.service(),
  model(params){
    let slug = params.slug;
    let container = slug.substring(0, 1);
    let service;
    if(container === 'S'){
      service = this.get('schoolEvents');
    }
    if(container === 'U'){
      service = this.get('userEvents');
    }
    
    return service.getEventForSlug(slug);
  }
});

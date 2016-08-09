import Ember from "ember";
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, inject } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, {

  userEvents: service(),
  schoolEvents: service(),
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

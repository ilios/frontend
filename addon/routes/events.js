import Ember from "ember";
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {

  userEvents: Ember.inject.service(),
  schoolEvents: Ember.inject.service(),
  model(params){
    let slug = params.slug;
    let container = slug.substring(0, 1);
    let eventService;
    if(container === 'S'){
      eventService = this.get('schoolEvents');
    }
    if(container === 'U'){
      eventService = this.get('userEvents');
    }

    return eventService.getEventForSlug(slug);
  }
});

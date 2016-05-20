import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { RSVP } = Ember;
const { all } = RSVP;

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  afterModel(model){
    //preload data to speed up rendering later
    return all([
      model.get('usersOnlyAtThisLevel'),
      model.get('allInstructors'),
      model.get('courses'),
      model.get('allParents'),
      model.get('courses'),
    ]);
  }
});

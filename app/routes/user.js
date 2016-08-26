import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP } = Ember;
const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  afterModel(user){
    return all([
      user.get('cohorts'),
      user.get('learnerGroups'),
      user.get('roles')
    ]);
  }
});

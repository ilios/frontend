import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.learnerGroups',
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

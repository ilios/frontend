import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP } = Ember;
const { hash } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.schools',
  afterModel(model){
    //preload relationships to improve the user experience
    return hash(model.getProperties(
      'administrators',
      'competencies',
      'configurations',
      'directors',
      'sessionTypes',
      'vocabularies')
    );
  }
});

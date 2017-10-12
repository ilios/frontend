import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

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

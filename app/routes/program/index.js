import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP } = Ember;
const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  async afterModel(model){
    await all([
      model.get('programYears'),
      model.get('allPublicationIssuesLength')
    ]);
  }
});

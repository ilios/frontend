import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  async afterModel(model){
    await all([
      model.get('programYears'),
      model.get('allPublicationIssuesLength')
    ]);
  }
});

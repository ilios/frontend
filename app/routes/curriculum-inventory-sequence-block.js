import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.curriculumInventoryReports',
  afterModel(model){
    //preload data to speed up rendering later
    return all([
      model.get('children'),
      model.get('parent'),
      model.get('report'),
    ]);
  },
});

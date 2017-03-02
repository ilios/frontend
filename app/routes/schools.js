import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, inject } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.schools',
  model(){
    return this.get('store').findAll('school');
  },
});

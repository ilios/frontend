import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route} = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  store: Ember.inject.service(),
  titleToken: 'general.schools',
  model(){
    return this.get('store').findAll('school');
  },
});

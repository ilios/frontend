import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { service } = Ember.inject;

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  titleToken: 'general.myProfile',
  model(){
    return this.get('currentUser').get('model');
  }
});

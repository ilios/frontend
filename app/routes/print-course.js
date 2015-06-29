import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  beforeModel: function(){
    this.controllerFor('application').set('showHeader', false);
    this.controllerFor('application').set('showNavigation', false);
  },
  renderTemplate: function() {
    this.render({ outlet: 'fullscreen' });
  }
});

import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Route.extend({
  store: service(),
  model(){
    return this.get('store').findAll('school');
  },
  setupController: function(controller, model){
    this._super(...arguments);
    controller.set('model', model);
    this.controllerFor('application').set('pageTitleTranslation', 'general.schools');
  },
});

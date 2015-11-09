import Ember from 'ember';

const { Route } = Ember;

export default Route.extend({
  setupController() {
    this._super(...arguments);

    this.controllerFor('application').set('pageTitleTranslation', 'navigation.admin');
  }
});

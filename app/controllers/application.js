import Ember from 'ember';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),
  pageTitle: '',
  showHeader: true,
  showNavigation: true,
});

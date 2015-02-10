import Ember from 'ember';

export default Ember.Component.extend({
  isMenuVisible: false,
  menuItems: [
    {
      'icon': 'home',
      'route': 'dashboard',
      'name': Ember.I18n.t('navigation.dashboard')
    },
    {
      'icon': 'book',
      'route': 'courses',
      'name': Ember.I18n.t('navigation.courses')
    },
    {
      'icon': 'mortar-board',
      'route': 'learnergroups',
      'name': Ember.I18n.t('navigation.learnerGroups')
    },
    {
      'icon': 'user-md',
      'route': 'instructorgroups',
      'name': Ember.I18n.t('navigation.instructorGroups')
    },
    {
      'icon': 'list-alt',
      'route': 'programs',
      'name': Ember.I18n.t('navigation.programs')
    },
    {
      'icon': 'area-chart',
      'route': 'visualize',
      'name': Ember.I18n.t('navigation.visualizer')
    },
  ],
  actions: {
    toggleMenuVisibility: function(){
      this.toggleProperty('isMenuVisible');
    }
  }
});

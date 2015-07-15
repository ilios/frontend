import Ember from 'ember';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  isMenuVisible: false,
  menuItems: Ember.computed('i18n.locale', function(){
    return [
      {
        'icon': 'home',
        'route': 'dashboard',
        'name': this.get('i18n').t('navigation.dashboard')
      },
      {
        'icon': 'book',
        'route': 'courses',
        'name': this.get('i18n').t('navigation.courses')
      },
      {
        'icon': 'mortar-board',
        'route': 'learnerGroups',
        'name': this.get('i18n').t('navigation.learnerGroups')
      },
      {
        'icon': 'user-md',
        'route': 'instructorGroups',
        'name': this.get('i18n').t('navigation.instructorGroups')
      },
      {
        'icon': 'list-alt',
        'route': 'programs',
        'name': this.get('i18n').t('navigation.programs')
      },
    ];
  }),
  actions: {
    toggleMenuVisibility: function(){
      this.toggleProperty('isMenuVisible');
    }
  }
});

import Ember from 'ember';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),
  i18n: Ember.inject.service(),
  pageTitleTranslation: null,
  pageTitle: Ember.computed('pageTitleTranslation', 'i18n.locale', function(){
    if(this.get('pageTitleTranslation')){
      return this.get('i18n').t(this.get('pageTitleTranslation'));
    }
    
    return '';
  }),
  showHeader: true,
  showNavigation: true,
});

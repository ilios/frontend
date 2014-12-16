import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  title: '',
  count: null,
  isExpanded: false,
  forceOpenObserver: function(){
    if(this.get('forceOpen') === true){
      this.set('isExpanded', true);
    }
  }.observes('forceOpen').on('init'),
  actions: {
    toggleVisibility: function(){
      this.toggleProperty('isExpanded');
    }
  }
});

import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  title: '',
  isExpanded: false,
  isRemovable: false,
  isSaveable: false,
  forceOpenObserver: function(){
    if(this.get('forceOpen') === true){
      this.set('isExpanded', true);
    }
  }.observes('forceOpen').on('init'),
  actions: {
    toggleVisibility: function(){
      this.toggleProperty('isExpanded');
    },
    remove: function(){
      this.sendAction('remove');
    },
    save: function(){
      this.sendAction('save');
    }
  }
});

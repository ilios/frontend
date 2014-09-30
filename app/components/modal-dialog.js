import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  showModal: false,
  actions: {
    toggleVisibility: function(){
      this.toggleProperty('showModal');
    }
  }
});

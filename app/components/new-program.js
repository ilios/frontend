import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'programs.programTitlePlaceholder',
  program: null,
  actions: {
    save: function(){
      this.sendAction('save', this.get('program'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('program'));
    }
  }
});

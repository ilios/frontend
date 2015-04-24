import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'instructorGroups.instructorGroupTitlePlaceholder',
  instructorGroup: null,
  actions: {
    save: function(){
      this.sendAction('save', this.get('instructorGroup'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('instructorGroup'));
    }
  }
});

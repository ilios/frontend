import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'learnerGroups.learnerGroupTitlePlaceholder',
  learnerGroup: null,
  actions: {
    save: function(){
      this.sendAction('save', this.get('learnerGroup'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('learnerGroup'));
    }
  }
});

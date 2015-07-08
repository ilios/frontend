import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  placeholder: t('instructorGroups.instructorGroupTitlePlaceholder'),
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

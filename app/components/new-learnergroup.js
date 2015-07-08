import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  placeholder: t('learnerGroups.learnerGroupTitlePlaceholder'),
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

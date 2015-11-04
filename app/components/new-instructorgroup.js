import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

const { inject, Component } = Ember;
const { service } = inject;

export default Component.extend({
  i18n: service(),
  store: service(),
  placeholder: t('instructorGroups.instructorGroupTitlePlaceholder'),
  title: null,
  actions: {
    save: function(){
      let instructorGroup = this.get('store').createRecord('instructorGroup', {
        title: this.get('title'),
        school: this.get('currentSchool')
      });
      this.sendAction('save', instructorGroup);
    },
    cancel: function(){
      this.sendAction('cancel');
    }
  }
});

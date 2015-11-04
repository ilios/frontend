import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

const { inject, Component } = Ember;
const { service } = inject;

export default Component.extend({
  i18n: service(),
  store: service(),
  placeholder: t('programs.programTitlePlaceholder'),
  title: null,
  actions: {
    save: function(){
      let program = this.get('store').createRecord('program', {
        title: this.get('title'),
        school: this.get('currentSchool')
      });
      this.sendAction('save', program);
    },
    cancel: function(){
      this.sendAction('cancel');
    }
  }
});

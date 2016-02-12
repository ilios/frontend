import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { inject, Component } = Ember;
const { service } = inject;

export default Component.extend(EmberValidations, ValidationError, {
  init() {
    this._super(...arguments);
  },
  i18n: service(),
  store: service(),
  placeholder: t('instructorGroups.instructorGroupTitlePlaceholder'),
  title: null,
  validations: {
    title : {
      length: {maximum: 60, allowBlank: true, messages: { tooLong: "instructorGroups.errors.titleTooLong" }}
    }
  },
  actions: {
    save: function(){
      this.validate().then(() => {
        let instructorGroup = this.get('store').createRecord('instructorGroup', {
          title: this.get('title'),
          school: this.get('currentSchool')
        });
        this.sendAction('save', instructorGroup);
      }).catch(() => {
        const keys = Ember.keys(this.get('errors'));
        keys.forEach((key) => {
          this.get('flashMessages').alert(this.get('errors.' + key));
        });
      });
    },
    cancel: function(){
      this.sendAction('cancel');
    }
  }
});

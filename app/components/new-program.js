import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, computed, inject, isBlank } = Ember;
const { service } = inject;
const { alias } = computed;

export default Component.extend(ValidationError, EmberValidations, {
  tagName: 'section',
  classNames: ['new-program', 'new-result', 'form-container', 'resultslist-new'],

  i18n: service(),

  placeholder: t('programs.programTitlePlaceholder'),

  title: null,

  titleCheck() {
    const title = this.get('title');

    return isBlank(title) ? true : false;
  },

  validationBuffer: alias('title'),
  validations: {
    'validationBuffer': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    }
  },

  actions: {
    save() {
      if (this.titleCheck()) {
        return;
      }

      this.validate()
        .then(() => {
          const title = this.get('title');

          this.sendAction('save', title);
        })
        .catch(() => {
          return;
        });
    },

    cancel() {
      this.sendAction('cancel');
    },

    changeValue(value) {
      this.set('title', value);
    }
  }
});

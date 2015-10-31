import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { computed, Component, inject, isBlank } = Ember;
const { alias, sort } = computed;
const { service } = inject;

export default Component.extend(EmberValidations, ValidationError, {
  init() {
    this._super(...arguments);

    const defaultSessionType = this.get('sortedSessionTypes')[0];
    this.set('sessionType', defaultSessionType);
  },

  classNames: ['new-session', 'resultslist-new', 'form-container'],

  i18n: service(),

  placeholder: t('sessions.sessionTitlePlaceholder'),

  sessionTypes: [],
  sortSessionsBy: ['title'],
  sortedSessionTypes: sort('sessionTypes', 'sortSessionsBy'),

  validationBuffer: alias('title'),
  validations: {
    'validationBuffer': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    }
  },

  title: null,
  sessionType: null,

  titleCheck() {
    const title = this.get('title');

    return isBlank(title) ? true : false;
  },

  actions: {
    save() {
      if (this.titleCheck()) {
        return;
      }

      this.validate()
        .then(() => {
          const title = this.get('title');
          const sessionType = this.get('sessionType');

          this.sendAction('save', title, sessionType);
        })
        .catch(() => {
          return;
        });
    },

    cancel() {
      this.sendAction('cancel');
    },

    changeSessionType() {
      const selectedEl = this.$('select')[0];
      const selectedIndex = selectedEl.selectedIndex;
      const sortedSessionTypes = this.get('sortedSessionTypes');
      const sessionType = sortedSessionTypes.toArray()[selectedIndex];

      this.set('sessionType', sessionType);
    },

    changeValue(value) {
      this.set('title', value);
    }
  }
});

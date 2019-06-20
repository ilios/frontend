import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { resolve } from 'rsvp';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  newVocabularyTitle: [
    validator('presence', true),
    validator('length', {
      min: 1,
      max: 200
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),

  classNames: ['school-vocabularies-list'],

  canCreate: false,
  canDelete: false,
  newVocabulary: null,
  newVocabularyTitle: null,
  school: null,
  showNewVocabularyForm: false,
  showRemovalConfirmationFor: null,

  sortedVocabularies: computed('school.vocabularies.[]', 'newVocabulary', async function() {
    const school = this.school;
    if (! isPresent(school)) {
      resolve([]);
    }
    const vocabularies = await school.get('vocabularies');
    return vocabularies.filterBy('isNew', false).sortBy('title').toArray();
  }),

  actions: {
    toggleShowNewVocabularyForm() {
      this.set('newVocabularyTitle', null);
      this.set('showNewVocabularyForm', !this.showNewVocabularyForm);
    },

    confirmRemoval(vocabulary) {
      this.set('showRemovalConfirmationFor', vocabulary);
    },

    cancelRemoval() {
      this.set('showRemovalConfirmationFor', null);
    }
  },

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.saveNew.perform(this.newVocabularyTitle);
      return;
    }

    if (27 === keyCode) {
      this.send('toggleShowNewVocabularyForm');
    }
  },

  saveNew: task(function* (title) {
    this.send('addErrorDisplayFor', 'newVocabularyTitle');
    const { validations } = yield this.validate();
    if (validations.get('isValid')) {
      const school = this.school;
      const vocabulary = this.store.createRecord('vocabulary', {title, school, active: true});
      const savedVocabulary = yield vocabulary.save();
      const vocabularies = yield school.get('vocabularies');
      vocabularies.pushObject(savedVocabulary);
      this.send('removeErrorDisplayFor', 'newVocabularyTitle');
      this.set('showNewVocabularyForm', false);
      this.set('newVocabularyTitle', null);
      this.set('newVocabulary', savedVocabulary);
    }
  }).drop(),

  remove: task(function* (vocabulary) {
    const school = this.school;
    const vocabularies = yield school.get('vocabularies');
    vocabularies.removeObject(vocabulary);
    yield vocabulary.destroyRecord();
    const newVocabulary = this.newVocabulary;
    if (newVocabulary === vocabulary) {
      this.set('newVocabulary', null);
    }
  }).drop()
});

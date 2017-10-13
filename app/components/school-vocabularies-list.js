import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { Promise } = RSVP;

const Validations = buildValidations({
  newVocabularyTitle: [
    validator('presence', true),
    validator('length', {
      min: 1,
      max: 200
    })
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  school: null,
  newVocabulary: null,

  sortedVocabularies: computed('school.vocabularies.[]', 'newVocabulary', function(){
    const school = this.get('school');
    return new Promise((resolve, reject) => {
      if (isPresent(school)) {
        school.get('vocabularies').then(vocabularies => {
          resolve(vocabularies.filterBy('isNew', false).sortBy('title').toArray());
        });
      } else {
        reject();
      }
    });
  }),
  editable: true,
  showNewVocabularyForm: false,
  newVocabularyTitle: null,
  showRemovalConfirmationFor: [],
  saveNew: task(function * (title){
    this.send('addErrorDisplayFor', 'newVocabularyTitle');
    const { validations } = yield this.validate();
    if (validations.get('isValid')) {
      const school = this.get('school');
      const vocabulary = this.get('store').createRecord('vocabulary', {title, school});
      const savedVocabulary = yield vocabulary.save();
      const vocabularies = yield school.get('vocabularies');
      vocabularies.pushObject(savedVocabulary);
      this.send('removeErrorDisplayFor', 'newVocabularyTitle');
      this.set('showNewVocabularyForm', false);
      this.set('newVocabularyTitle', null);
      this.set('newVocabulary', savedVocabulary);
    }
  }).drop(),

  actions: {
    toggleShowNewVocabularyForm(){
      this.set('newVocabularyTitle', null);
      this.set('showNewVocabularyForm', !this.get('showNewVocabularyForm'));
    },
    confirmRemoval(vocabulary){
      this.get('showRemovalConfirmationFor').pushObject(vocabulary);
    },
    cancelRemoval(vocabulary){
      this.get('showRemovalConfirmationFor').removeObject(vocabulary);
    },
    remove(vocabulary){
      this.set('newVocabulary', null);
      vocabulary.deleteRecord();
      vocabulary.save();
    },
  }
});

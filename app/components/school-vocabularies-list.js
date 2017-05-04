import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, inject, RSVP, isPresent } = Ember;
const { service } = inject;
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
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('newVocabularies', []);
  },
  school: null,
  newVocabularies: [],
  sortedVocabularies: computed('school.vocabularies.[]', function(){
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
  isSavingNewVocabulary: false,
  showRemovalConfirmationFor: [],
  actions: {
    toggleShowNewVocabularyForm(){
      this.set('newVocabularyTitle', null);
      this.set('showNewVocabularyForm', !this.get('showNewVocabularyForm'));
    },
    add(title){
      let self = this;
      this.set('isSavingNewVocabulary', true);
      this.send('addErrorDisplayFor', 'newVocabularyTitle');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const school = this.get('school');
          let vocabulary = this.get('store').createRecord('vocabulary', {title, school});
          vocabulary.save().then(savedVocabulary => {
            this.get('newVocabularies').pushObject(savedVocabulary);
          }).finally(() => {
            if (!self.get('isDestroyed')) {
              self.send('removeErrorDisplayFor', 'newVocabularyTitle');
              self.set('showNewVocabularyForm', false);
              self.set('isSavingNewVocabulary', false);
              self.set('newVocabularyTitle', null);
            }
          });
        }
      });
    },
    confirmRemoval(vocabulary){
      this.get('showRemovalConfirmationFor').pushObject(vocabulary);
    },
    cancelRemoval(vocabulary){
      this.get('showRemovalConfirmationFor').removeObject(vocabulary);
    },
    remove(vocabulary){
      this.get('newVocabularies').removeObject(vocabulary);
      vocabulary.deleteRecord();
      vocabulary.save();
    },
  }
});

import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, inject } = Ember;
const { sort, reads, filterBy } = computed;
const { service } = inject;

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
  vocabularies: reads('school.vocabularies'),
  newVocabularies: [],
  sortBy: ['title'],
  filteredVocabularies: filterBy('vocabularies', 'isNew', false),
  sortedVocabularies: sort('filteredVocabularies', 'sortBy'),
  editable: true,
  showNewVocabularyForm: false,
  newVocabularyTitle: null,
  isSavingNewVocabulary: false,
  showRemovalConfirmationFor: [],
  actions: {
    changeVocabularyTitle(title, vocabulary){
      vocabulary.set('title', title);
      vocabulary.save();
    },
    toggleShowNewVocabularyForm(){
      this.set('newVocabularyTitle', null);
      this.set('showNewVocabularyForm', !this.get('showNewVocabularyForm'));
    },
    add(title){
      this.set('isSavingNewVocabulary', true);
      const school = this.get('school');
      let vocabulary = this.get('store').createRecord('vocabulary', {title, school});
      vocabulary.save().then(vocabulary => {
        this.send('removeErrorDisplayFor', 'newVocabularyTitle');
        this.get('newVocabularies').pushObject(vocabulary);
        this.set('showNewVocabularyForm', false);
        this.set('isSavingNewVocabulary', false);
        this.set('newVocabularyTitle', null);
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

import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, isPresent, isEmpty, inject, RSVP } = Ember;
const { service } = inject;
const { Promise } = RSVP;

const Validations = buildValidations({
  newTermTitle: [
    validator('presence', true),
    validator('length', {
      min: 1,
      max: 200
    })
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  vocabulary: null,
  sortBy: ['title'],
  sortedTerms: computed('vocabulary.terms.[]', function(){
    return new Promise(resolve => {
      const vocabulary = this.get('vocabulary');
      if (isEmpty(vocabulary)) {
        resolve([]);
      } else {
        vocabulary.get('terms').then(terms => {
          resolve(terms.sortBy('title'));
        });
      }
    });
  }),
  newTermTitle: null,
  isSavingNewTerm: false,
  actions: {
    changeVocabularyTitle(title){
      const vocabulary = this.get('vocabulary');
      vocabulary.set('title', title);
      vocabulary.save();
    },
    createTerm(){
      let title = this.get('newTermTitle');
      const vocabulary = this.get('vocabulary');
      const store = this.get('store');
      if (isPresent(title)) {
        this.set('isSavingNewTerm', true);
        let term = store.createRecord('term', {title, vocabulary});
        term.save().then(() => {
          this.set('newTermTitle', null);
          this.set('isSavingNewTerm', false);
        });
      }
    }
  }
});

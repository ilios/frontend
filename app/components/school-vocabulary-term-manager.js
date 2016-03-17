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
  term: null,
  vocabulary: null,
  sortedTerms: computed('term.children.[]', function(){
    return new Promise(resolve => {
      const term = this.get('term');
      if (isEmpty(term)) {
        resolve([]);
      } else {
        term.get('children').then(terms => {
          resolve(terms.sortBy('title'));
        });
      }
    });
  }),
  allParents: computed('term.allParents.[]', function(){
    return new Promise(resolve => {
      const term = this.get('term');
      if (isEmpty(term)) {
        resolve([]);
      } else {
        resolve(term.get('allParents'));
      }
    });
  }),
  newTermTitle: null,
  isSavingNewTerm: false,
  actions: {
    changeTermTitle(title){
      const term = this.get('term');
      term.set('title', title);
      term.save();
    },
    createTerm(){
      let title = this.get('newTermTitle');
      const parent = this.get('term');
      const vocabulary = this.get('vocabulary');
      const store = this.get('store');
      if (isPresent(title)) {
        this.set('isSavingNewTerm', true);
        let term = store.createRecord('term', {title, parent, vocabulary});
        term.save().then(() => {
          this.set('newTermTitle', null);
          this.set('isSavingNewTerm', false);
        });
      }
    },
    selectVocabulary(id){
      this.attrs.manageTerm(null);
      this.attrs.manageVocabulary(id);
    },
  }
});

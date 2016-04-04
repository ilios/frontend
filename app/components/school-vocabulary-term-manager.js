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
    }),
    validator('async-exclusion', {
      dependentKeys: ['term.children.@each.title'],
      in(){
        return new Promise(resolve => {
          const term = this.get('model.term');
          if (isPresent(term)) {
            term.get('children').then(children => {
              resolve(children.mapBy('title'));
            });
          } else {
            resolve([]);
          }
        });

      },
      descriptionKey: 'general.term',
    })
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  flashMessages: service(),
  term: null,
  vocabulary: null,
  newTermTitle: null,
  isSavingNewTerm: false,
  newTerms: [],
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('newTerms', []);
  },
  sortedTerms: computed('term.children.[]', function(){
    return new Promise(resolve => {
      const term = this.get('term');
      if (isPresent(term)) {
        term.get('children').then(terms => {
          resolve(terms.filterBy('isNew', false).filterBy('isDeleted', false).sortBy('title'));
        });
      }
    });
  }),
  allParents: computed('term.allParents.[]', function(){
    return new Promise(resolve => {
      const term = this.get('term');
      if (isPresent(term)) {
        term.get('allParents').then(allParents => {
          resolve(allParents.toArray().reverse())
        })
      }
    });
  }),
  actions: {
    changeTermTitle(title){
      const term = this.get('term');
      term.set('title', title);
      term.save().then(newTerm => {
        this.set('term', newTerm);
      });
    },
    changeTermDescription(description){
      const term = this.get('term');
      term.set('description', description);
      term.save().then(newTerm => {
        this.set('term', newTerm);
      });
    },
    createTerm(){
      this.send('addErrorDisplayFor', 'newTermTitle');
      this.set('isSavingNewTerm', true);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.send('removeErrorDisplayFor', 'newTermTitle');
          let title = this.get('newTermTitle');
          const parent = this.get('term');
          const vocabulary = this.get('vocabulary');
          const store = this.get('store');
          let term = store.createRecord('term', {title, parent, vocabulary});
          return term.save().then((newTerm) => {
            this.set('newTermTitle', null);
            this.get('newTerms').pushObject(newTerm);
          });
        }
      }).finally(() => {
        this.set('isSavingNewTerm', false);
      });
    },
    deleteTerm(){
      const term = this.get('term');
      term.get('parent').then(parent => {
        let goTo = isEmpty(parent)?null:parent.get('id');
        this.attrs.manageTerm(goTo);
        term.deleteRecord();
        term.save().then(() => {
          this.get('flashMessages').success('schools.successfullyRemovedTerm');
        });
      });

    },
    clearVocabAndTerm(){
      this.attrs.manageVocabulary(null);
      this.attrs.manageTerm(null);
    }
  }
});

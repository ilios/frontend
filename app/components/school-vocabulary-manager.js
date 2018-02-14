/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Promise } = RSVP;

const Validations = buildValidations({
  newTermTitle: [
    validator('presence', true),
    validator('length', {
      min: 1,
      max: 200
    }),
    validator('async-exclusion', {
      dependentKeys: ['model.vocabulary.terms.@each.title'],
      in: computed('model.vocabulary.terms.@each.title', function(){
        return new Promise(resolve => {
          const vocabulary = this.get('model.vocabulary');
          if (isPresent(vocabulary)) {
            return vocabulary.get('terms').then(terms => {
              resolve(terms.filterBy('isTopLevel', true).mapBy('title'));
            });
          }
          resolve([]);
        });

      }),
      descriptionKey: 'general.term',
    })
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  vocabulary: null,
  title: null,
  isActive: null,
  newTermTitle: null,
  isSavingNewTerm: false,
  newTerms: null,
  classNames: ['school-vocabulary-manager'],
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('newTerms', []);
    const vocabulary = this.get('vocabulary');
    if (vocabulary) {
      this.set('title', vocabulary.get('title'));
      this.set('isActive', vocabulary.get('active'));
    }
  },
  sortedTerms: computed('vocabulary.terms.[]', function(){
    return new Promise(resolve => {
      const vocabulary = this.get('vocabulary');
      if (isPresent(vocabulary)) {
        vocabulary.get('terms').then(terms => {
          resolve(
            terms.filterBy('isTopLevel')
              .filterBy('isNew', false)
              .filterBy('isDeleted', false)
              .sortBy('title')
          );
        });
      }
    });
  }),
  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.send('createTerm');
    }
  },
  actions: {
    changeVocabularyTitle(){
      const vocabulary = this.get('vocabulary');
      const title = this.get('title');
      vocabulary.set('title', title);
      return vocabulary.save();
    },
    async changeIsActive(isActive){
      const vocabulary = this.get('vocabulary');
      vocabulary.set('active', isActive);
      await vocabulary.save();
      this.set('isActive', isActive);
    },
    revertVocabularyTitleChanges(){
      const vocabulary = this.get('vocabulary');
      this.set('title', vocabulary.get('title'));
    },
    createTerm(){
      this.send('addErrorDisplayFor', 'newTermTitle');
      this.set('isSavingNewTerm', true);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.send('removeErrorDisplayFor', 'newTermTitle');
          let title = this.get('newTermTitle');
          const vocabulary = this.get('vocabulary');
          const store = this.get('store');
          let term = store.createRecord('term', {title, vocabulary});
          return term.save().then((newTerm) => {
            this.set('newTermTitle', null);
            this.get('newTerms').pushObject(newTerm);
          });
        }
      }).finally(() => {
        this.set('isSavingNewTerm', false);
      });
    }
  }
});

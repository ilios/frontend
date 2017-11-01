/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
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
      dependentKeys: ['model.term.children.@each.title'],
      in: computed('model.term.@each.title', function(){
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
      }),
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
  newTerms: null,
  description: null,
  title: null,
  classNames: ['school-vocabulary-term-manager'],
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('newTerms', []);
    const term = this.get('term');
    if (term) {
      this.set('description', term.get('description'));
      this.set('title', term.get('title'));
    }
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
          resolve(allParents.reverse());
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
    changeTermTitle(){
      const term = this.get('term');
      const title = this.get('title');
      term.set('title', title);
      return term.save();
    },
    revertTermTitleChanges(){
      const term = this.get('term');
      this.set('title', term.get('title'));
    },
    changeTermDescription(){
      const term = this.get('term');
      const description = this.get('description');
      term.set('description', description);
      return term.save();
    },
    revertTermDescriptionChanges(){
      const term = this.get('term');
      this.set('description', term.get('description'));
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
      const manageTerm = this.get('manageTerm');
      term.get('parent').then(parent => {
        let goTo = isEmpty(parent)?null:parent.get('id');
        manageTerm(goTo);
        term.deleteRecord();
        term.save().then(() => {
          this.get('flashMessages').success('general.successfullyRemovedTerm');
        });
      });

    },
    clearVocabAndTerm(){
      const manageVocabulary = this.get('manageVocabulary');
      const manageTerm = this.get('manageTerm');
      manageVocabulary(null);
      manageTerm(null);
    }
  }
});

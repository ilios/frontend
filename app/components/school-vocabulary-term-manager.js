/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
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
  canUpdate: false,
  canDelete: false,
  canCreate: false,
  newTerm: null,
  vocabulary: null,
  newTermTitle: null,
  isSavingNewTerm: false,
  description: null,
  title: null,
  isActive: null,
  classNames: ['school-vocabulary-term-manager'],
  didReceiveAttrs(){
    this._super(...arguments);
    const term = this.term;
    if (term) {
      this.set('description', term.get('description'));
      this.set('title', term.get('title'));
      this.set('isActive', term.get('active'));
    }
  },
  sortedTerms: computed('term.children.[]', 'newTerm', function(){
    return new Promise(resolve => {
      const term = this.term;
      if (isPresent(term)) {
        term.get('children').then(terms => {
          resolve(terms.filterBy('isNew', false).filterBy('isDeleted', false).sortBy('title'));
        });
      }
    });
  }),
  allParents: computed('term.allParents.[]', function(){
    return new Promise(resolve => {
      const term = this.term;
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

  changeIsActive: task(function * (isActive){
    const term = this.term;
    term.set('active', isActive);
    yield term.save();
    this.set('isActive', term.get('active'));
  }).drop(),

  actions: {
    changeTermTitle(){
      const term = this.term;
      const title = this.title;
      term.set('title', title);
      return term.save();
    },
    revertTermTitleChanges(){
      const term = this.term;
      this.set('title', term.get('title'));
    },
    changeTermDescription(){
      const term = this.term;
      const description = this.description;
      term.set('description', description);
      return term.save();
    },
    revertTermDescriptionChanges(){
      const term = this.term;
      this.set('description', term.get('description'));
    },
    createTerm(){
      this.send('addErrorDisplayFor', 'newTermTitle');
      this.set('isSavingNewTerm', true);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.send('removeErrorDisplayFor', 'newTermTitle');
          let title = this.newTermTitle;
          const parent = this.term;
          const vocabulary = this.vocabulary;
          const store = this.store;
          let term = store.createRecord('term', {title, parent, vocabulary, active: true});
          return term.save().then((newTerm) => {
            this.set('newTermTitle', null);
            this.set('newTerm', newTerm);
          });
        }
      }).finally(() => {
        this.set('isSavingNewTerm', false);
      });
    },
    deleteTerm(){
      const term = this.term;
      const manageTerm = this.manageTerm;
      term.get('parent').then(parent => {
        let goTo = isEmpty(parent)?null:parent.get('id');
        manageTerm(goTo);
        term.deleteRecord();
        term.save().then(() => {
          this.flashMessages.success('general.successfullyRemovedTerm');
        });
      });

    },
    clearVocabAndTerm(){
      const manageVocabulary = this.manageVocabulary;
      const manageTerm = this.manageTerm;
      manageVocabulary(null);
      manageTerm(null);
    }
  }
});

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  newTermTitle: [
    validator('presence', true),
    validator('length', {
      min: 1,
      max: 200
    }),
    validator('async-exclusion', {
      dependentKeys: ['model.vocabulary.terms.@each.title'],
      in: computed('model.vocabulary.terms.@each.title', async function(){
        const vocabulary = this.get('model.vocabulary');
        if (isPresent(vocabulary)) {
          const terms = await vocabulary.terms;
          return terms.filterBy('isTopLevel', true).mapBy('title');
        }
        return [];

      }),
      descriptionKey: 'general.term',
    })
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  vocabulary: null,
  canUpdate: false,
  canCreate: false,
  title: null,
  isActive: null,
  newTermTitle: null,
  isSavingNewTerm: false,
  newTerm: null,
  classNames: ['school-vocabulary-manager'],
  'data-test-school-vocabulary-manager': true,
  sortedTerms: computed('vocabulary.terms.[]', 'newTerm', async function(){
    const vocabulary = this.vocabulary;
    if (isPresent(vocabulary)) {
      const terms = await vocabulary.terms;
      return terms.filterBy('isTopLevel')
        .filterBy('isNew', false)
        .filterBy('isDeleted', false)
        .sortBy('title');
    }
  }),
  didReceiveAttrs(){
    this._super(...arguments);
    const vocabulary = this.vocabulary;
    if (vocabulary) {
      this.set('title', vocabulary.get('title'));
      this.set('isActive', vocabulary.get('active'));
    }
  },
  actions: {
    changeVocabularyTitle(){
      const vocabulary = this.vocabulary;
      const title = this.title;
      vocabulary.set('title', title);
      return vocabulary.save();
    },
    revertVocabularyTitleChanges(){
      const vocabulary = this.vocabulary;
      this.set('title', vocabulary.get('title'));
    },
    async createTerm(){
      this.send('addErrorDisplayFor', 'newTermTitle');
      this.set('isSavingNewTerm', true);
      try {
        const { validations } = await this.validate();
        if (validations.get('isValid')) {
          this.send('removeErrorDisplayFor', 'newTermTitle');
          let title = this.newTermTitle;
          const vocabulary = this.vocabulary;
          const store = this.store;
          let term = store.createRecord('term', {title, vocabulary, active: true});
          return term.save().then((newTerm) => {
            this.set('newTermTitle', null);
            this.set('newTerm', newTerm);
          });
        }
      } finally {
        this.set('isSavingNewTerm', false);
      }
    }
  },
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
});

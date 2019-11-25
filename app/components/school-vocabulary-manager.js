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
  vocabularyTitle: [
    validator('presence', true),
    validator('length', {
      min: 1,
      max: 200
    }),
    validator('async-exclusion', {
      dependentKeys: ['model.vocabulary.schools.@each.vocabularies'],
      in: computed('model.vocabulary.vocabularies.@each.title', async function(){
        const vocabulary = this.get('model.vocabulary');
        if (isPresent(vocabulary)) {
          const school = await vocabulary.school;
          const siblingVocabularier = await school.vocabularies;
          return siblingVocabularier.mapBy('title');
        }
        return [];

      }),
      descriptionKey: 'general.vocabulary',
    })
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  vocabulary: null,
  canUpdate: false,
  canCreate: false,
  vocabularyTitle: null,
  isActive: null,
  newTermTitle: null,
  isSavingNewTerm: false,
  newTerm: null,
  classNames: ['school-vocabulary-manager'],
  'data-test-school-vocabulary-manager': true,
  sortedTerms: computed('vocabulary.terms.[]', 'newTerm', async function () {
    if (!this.vocabulary) {
      return [];
    }
    const terms = await this.vocabulary.terms;
    return terms.filterBy('isTopLevel')
      .filterBy('isNew', false)
      .filterBy('isDeleted', false)
      .sortBy('title');
  }),
  didReceiveAttrs(){
    this._super(...arguments);
    if (this.vocabulary) {
      this.set('vocabularyTitle', this.vocabulary.title);
      this.set('isActive', this.vocabulary.active);
    }
  },
  actions: {
    async changeVocabularyTitle() {
      this.send('addErrorDisplayFor', 'vocabularyTitle');
      await this.validate();
      if (this.validations.attrs.vocabularyTitle.isValid) {
        this.send('removeErrorDisplayFor', 'vocabularyTitle');
        this.vocabulary.set('title', this.vocabularyTitle);
        return this.vocabulary.save();
      }

      return false;
    },
    revertVocabularyTitleChanges(){
      this.send('removeErrorDisplayFor', 'vocabularyTitle');
      this.set('vocabularyTitle', this.vocabulary.title);
    },
    async createTerm(){
      this.send('addErrorDisplayFor', 'newTermTitle');
      this.set('isSavingNewTerm', true);
      try {
        await this.validate();
        if (this.validations.attrs.newTermTitle.isValid) {
          this.send('removeErrorDisplayFor', 'newTermTitle');
          const title = this.newTermTitle;
          const vocabulary = this.vocabulary;
          const store = this.store;
          const term = store.createRecord('term', { title, vocabulary, active: true });
          const newTerm = await term.save();
          this.set('newTermTitle', null);
          this.set('newTerm', newTerm);
          return true;
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

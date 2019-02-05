import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
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
      dependentKeys: ['model.term.children.@each.title'],
      in: computed('model.term.children.@each.title', async function(){
        const term = this.get('model.term');
        if (isPresent(term)) {
          const children = await term.children;
          return children.mapBy('title');
        }
        return [];

      }),
      descriptionKey: 'general.term',
    }),
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
  'data-test-school-vocabulary-term-manager': true,
  sortedTerms: computed('term.children.[]', 'newTerm', async function(){
    if (isPresent(this.term)) {
      const terms = await this.term.children;
      return terms.filterBy('isNew', false).filterBy('isDeleted', false).sortBy('title');
    }
  }),
  allParents: computed('term.allParents.[]', async function(){
    if (isPresent(this.term)) {
      return await this.term.allParents;
    }

    return [];
  }),
  didReceiveAttrs(){
    this._super(...arguments);
    if (this.term) {
      this.set('description', this.term.description);
      this.set('title', this.term.title);
      this.set('isActive', this.term.active);
    }
  },

  actions: {
    async changeTermTitle(){
      this.term.set('title', this.title);
      return this.term.save();
    },
    revertTermTitleChanges(){
      this.set('title', this.term.title);
    },
    async changeTermDescription(){
      this.term.set('description', this.description);
      return this.term.save();
    },
    revertTermDescriptionChanges(){
      this.set('description', this.term.description);
    },
    async createTerm() {
      this.send('addErrorDisplayFor', 'newTermTitle');
      this.set('isSavingNewTerm', true);
      try {
        await this.validate();
        if (this.validations.attrs.newTermTitle.isValid) {
          this.send('removeErrorDisplayFor', 'newTermTitle');
          let title = this.newTermTitle;
          let term = this.store.createRecord('term', {
            title,
            parent: this.term,
            vocabulary: this.vocabulary,
            active: true,
          });

          const newTerm = await term.save();
          this.set('newTermTitle', null);
          this.set('newTerm', newTerm);
          return true;
        }
      } finally {
        this.set('isSavingNewTerm', false);
      }
    },
    async deleteTerm() {
      const parent = await this.term.parent;
      let goTo = isEmpty(parent)?null:parent.id;
      this.manageTerm(goTo);
      this.term.deleteRecord();
      await this.term.save();
      this.flashMessages.success('general.successfullyRemovedTerm');
    },
    clearVocabAndTerm(){
      this.manageVocabulary(null);
      this.manageTerm(null);
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
  changeIsActive: task(function * (isActive){
    this.term.set('active', isActive);
    yield this.term.save();
    this.set('isActive', this.term.active);
  }).drop(),
});

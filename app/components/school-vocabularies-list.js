/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';
import { isPresent } from '@ember/utils';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

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
  classNames: ['school-vocabularies-list'],
  school: null,
  newVocabulary: null,

  sortedVocabularies: computed('school.vocabularies.[]', 'newVocabulary', async function(){
    const school = this.get('school');
    if (! isPresent(school)) {
      resolve([]);
    }
    const vocabularies = await school.get('vocabularies');
    return vocabularies.filterBy('isNew', false).sortBy('title').toArray();
  }),

  editable: true,
  showNewVocabularyForm: false,
  newVocabularyTitle: null,
  showRemovalConfirmationFor: null,

  saveNew: task(function * (title){
    this.send('addErrorDisplayFor', 'newVocabularyTitle');
    const { validations } = yield this.validate();
    if (validations.get('isValid')) {
      const school = this.get('school');
      const vocabulary = this.get('store').createRecord('vocabulary', {title, school, active: true});
      const savedVocabulary = yield vocabulary.save();
      const vocabularies = yield school.get('vocabularies');
      vocabularies.pushObject(savedVocabulary);
      this.send('removeErrorDisplayFor', 'newVocabularyTitle');
      this.set('showNewVocabularyForm', false);
      this.set('newVocabularyTitle', null);
      this.set('newVocabulary', savedVocabulary);
    }
  }).drop(),

  remove: task(function * (vocabulary){
    const school = this.get('school');
    const vocabularies = yield school.get('vocabularies');
    vocabularies.removeObject(vocabulary);
    yield vocabulary.destroyRecord();
    const newVocabulary = this.get('newVocabulary');
    if (newVocabulary === vocabulary) {
      this.set('newVocabulary', null);
    }
  }).drop(),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.get('saveNew').perform(this.get('newVocabularyTitle'));
      return;
    }

    if(27 === keyCode) {
      this.send('toggleShowNewVocabularyForm');
    }
  },

  actions: {
    toggleShowNewVocabularyForm(){
      this.set('newVocabularyTitle', null);
      this.set('showNewVocabularyForm', !this.get('showNewVocabularyForm'));
    },
    confirmRemoval(vocabulary){
      this.set('showRemovalConfirmationFor', vocabulary);
    },
    cancelRemoval(){
      this.set('showRemovalConfirmationFor', null);
    },
  }
});

/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { validator, buildValidations } from 'ember-cp-validations';
import { task } from 'ember-concurrency';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
  ],
  calendarColor: [
    validator('presence', true),
    validator('format', {
      regex: /^#[a-fA-F0-9]{6}$/,
    })
  ],
  selectedAamcMethodId: [
    validator(function(aamcMethodId, options, model) {
      if (!aamcMethodId) {
        return true;
      }
      const assessment = model.get('assessment');
      const lookup = assessment?'AM':'IM';
      if (aamcMethodId.indexOf(lookup) !== 0) {
        return this.createErrorMessage(options.messageKey, aamcMethodId, options);
      }

      return true;
    }, {
      dependentKeys: ['model.assessment'],
      descriptionKey: 'general.aamcMethod',
      messageKey: 'general.invalid',
    })
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  classNames: ['school-session-type-form'],
  title: null,
  selectedAamcMethodId: null,
  calendarColor: null,
  assessment: false,
  isActive: true,
  selectedAssessmentOptionId: null,
  canEditTitle: false,
  canEditAamcMethod: false,
  canEditCalendarColor: false,
  canEditAssessment: false,
  canEditAssessmentOption: false,
  canEditActive: false,
  canUpdate: false,
  saveSessionType: task(function * () {
    this.send('addErrorDisplaysFor', ['title', 'calendarColor', 'selectedAamcMethodId']);
    let {validations} = yield this.validate();
    if (validations.get('isInvalid')) {
      return;
    }

    const title = this.title;
    const calendarColor = this.calendarColor;
    const assessment = this.assessment;
    const aamcMethod = yield this.selectedAamcMethod;
    const assessmentOption = yield this.selectedAssessmentOption;
    const isActive = this.isActive;
    const save = this.save;

    yield save(title, calendarColor, assessment, assessmentOption, aamcMethod, isActive);
    this.send('clearErrorDisplay');
  }),
  assessmentOptions: computed(async function(){
    const store = this.store;
    return await store.findAll('assessment-option');
  }),
  allAamcMethods: computed(async function(){
    const store = this.store;
    const aamcMethods = await store.findAll('aamc-method');

    return aamcMethods;
  }),
  filteredAamcMethods: computed('allAamcMethods.[]', 'assessment', async function(){
    const assessment = this.assessment;
    const aamcMethods = await this.allAamcMethods;
    const filteredAamcMethods = aamcMethods.filter(aamcMethod => {
      const id = aamcMethod.get('id');
      if (assessment) {
        return id.indexOf('AM') === 0;
      } else {
        return id.indexOf('IM') === 0;
      }
    });

    return filteredAamcMethods;
  }),
  selectedAamcMethod: computed('filteredAamcMethods.[]', 'selectedAamcMethodId', async function(){
    const filteredAamcMethods = await this.filteredAamcMethods;
    const selectedAamcMethodId = this.selectedAamcMethodId;
    if(isPresent(selectedAamcMethodId)){
      const selectedAamcMethod = filteredAamcMethods.findBy('id', selectedAamcMethodId);
      if (selectedAamcMethod) {
        return selectedAamcMethod;
      }
    }

    return null;
  }),
  selectedAssessmentOption: computed('assessmentOptions.[]', 'selectedAssessmentOptionId', 'assessment', async function(){
    const assessment = this.assessment;
    const selectedAssessmentOptionId = this.selectedAssessmentOptionId;
    const assessmentOptions = await this.assessmentOptions;
    let assessmentOption = null;

    if (assessment) {
      assessmentOption = selectedAssessmentOptionId?assessmentOptions.findBy('id', selectedAssessmentOptionId):assessmentOptions.sortBy('name').get('firstObject');
    }

    return assessmentOption;
  }),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.saveSessionType.perform();
      return;
    }

    if (27 === keyCode) {
      this.sendAction('close');
    }
  },

  actions: {
    updateAssessment(value){
      this.set('selectedAamcMethodId', null);
      this.set('assessment', value);
    }
  }
});

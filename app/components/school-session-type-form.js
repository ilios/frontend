import Ember from 'ember';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { validator, buildValidations } from 'ember-cp-validations';
import { task } from 'ember-concurrency';

const { computed, Component, inject, isPresent, isEmpty, Promise } = Ember;
const { service } = inject;

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
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  classNames: ['school-session-type-form'],
  title: null,
  calendarColor: null,
  assessment: null,
  assessmentOptionId: null,
  aamcMethods: computed(function(){
    const store = this.get('store');
    return store.findAll('aamc-method');
  }),
  assessmentOptions: null,
  canEditTitle: false,
  canEditCalendarColor: false,
  canEditAssessment: false,
  canEditAssessmentOption: false,
  saveSessionType: task(function * () {
    this.send('addErrorDisplaysFor', ['title', 'calendarColor']);
    let {validations} = yield this.validate();
    if (validations.get('isInvalid')) {
      return;
    }

    const title = this.get('title');
    const calendarColor = this.get('calendarColor');
    const assessment = this.get('assessment');
    const assessmentOptionId = this.get('assessmentOptionId');
    const assessmentOptions = this.get('assessmentOptions');
    const aamcMethod = yield this.get('selectedAamcMethod');
    const save = this.get('save');
    let assessmentOption = null;
		
    if (assessment) {
      assessmentOption = assessmentOptionId?assessmentOptions.findBy('id', assessmentOptionId):assessmentOptions.sortBy('name').get('firstObject');
    }

    yield save(title, calendarColor, assessment, assessmentOption, aamcMethod);
    this.send('clearErrorDisplay');
  }),
  selectedAamcMethod: computed('aamcMethods.[]', 'selectedAamcMethodId', function(){
    return new Promise(resolve => {
      let selectedAamcMethod;
      this.get('aamcMethods').then(aamcMethods => {
        const selectedAamcMethodId = this.get('selectedAamcMethodId');
        if(isPresent(selectedAamcMethodId)){
          selectedAamcMethod = aamcMethods.find(aamcMethod => {
            return aamcMethod.get('id') === selectedAamcMethodId;
          });
        }

        if(isEmpty(selectedAamcMethod)){
          selectedAamcMethod = aamcMethods.get('firstObject');
        }

        resolve(selectedAamcMethod);

      });
    });
  }),
});

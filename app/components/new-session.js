import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { computed, Component, inject, isEmpty, isPresent } = Ember;
const { sort } = computed;
const { service } = inject;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200,
      descriptionKey: 'general.title'
    }),
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  classNames: ['new-session', 'resultslist-new', 'form-container'],

  sessionTypes: [],
  sortSessionsBy: ['title'],
  sortedSessionTypes: sort('sessionTypes', 'sortSessionsBy'),

  title: null,
  selectedSessionTypeId: null,
  isSaving: false,


  selectedSessionType: computed('sessionTypes.[]', 'selectedSessionTypeId', function(){
    let sessionTypes = this.get('sessionTypes');
    const selectedSessionTypeId = this.get('selectedSessionTypeId');
    if(isPresent(selectedSessionTypeId)){
      return sessionTypes.find(sessionType => {
        return parseInt(sessionType.get('id')) === parseInt(selectedSessionTypeId);
      });
    }

    //try and default to a type names 'Lecture';
    let lectureType = sessionTypes.find(sessionType => sessionType.get('title') === 'Lecture');
    if(isEmpty(lectureType)){
      lectureType = sessionTypes.get('firstObject');
    }

    return lectureType;
  }),

  actions: {
    save: function(){
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let session = this.get('store').createRecord('session', {
            title: this.get('title'),
            sessionType: this.get('selectedSessionType')
          });
          this.get('save')(session).finally(()=>{
            this.get('cancel')();
          });
        }
      });
    },
  }
});

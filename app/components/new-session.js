import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { computed, Component, inject, isEmpty, isPresent, RSVP } = Ember;
const { service } = inject;
const { Promise } = RSVP;

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

  sessionTypes: null,

  title: null,
  selectedSessionTypeId: null,
  isSaving: false,

  selectedSessionType: computed('sessionTypes.[]', 'selectedSessionTypeId', function(){
    return new Promise(resolve => {
      let selectedSessionType;
      this.get('sessionTypes').then(sessionTypes => {
        const selectedSessionTypeId = this.get('selectedSessionTypeId');
        if(isPresent(selectedSessionTypeId)){
          selectedSessionType = sessionTypes.find(sessionType => {
            return parseInt(sessionType.get('id')) === parseInt(selectedSessionTypeId);
          });
        }

        if (isEmpty(selectedSessionType)){
          //try and default to a type names 'Lecture';
          selectedSessionType = sessionTypes.find(sessionType => sessionType.get('title') === 'Lecture');
        }

        if(isEmpty(selectedSessionType)){
          selectedSessionType = sessionTypes.get('firstObject');
        }

        resolve(selectedSessionType);

      });
    });
  }),

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.get('selectedSessionType').then(sessionType => {
            let session = this.get('store').createRecord('session', {
              title: this.get('title'),
              sessionType
            });
            this.get('save')(session).finally(()=>{
              this.sendAction('cancel');
            });
          });
        }
      });
    },
    cancel() {
      this.sendAction('cancel');
    }
  }
});

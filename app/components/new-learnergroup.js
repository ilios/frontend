import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component } = Ember;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 60,
      descriptionKey: 'general.title'
    }),
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  tagName: 'section',
  classNames: ['new-learnergroup', 'new-result', 'form-container'],
  isSaving: false,
  title: null,

  actions: {
    save: function(){
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const title = this.get('title');
          this.get('save')(title).finally(()=>{
            this.set('isSaving', false);
            this.send('clearErrorDisplay');
          })
        }
      });
    },
    cancel() {
      this.sendAction('cancel');
    }
  }
});

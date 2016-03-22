import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { inject, Component } = Ember;
const { service } = inject;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    }),
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  title: null,
  currentSchool: null,
  isSaving: false,
  actions: {
    save: function(){
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let instructorGroup = this.get('store').createRecord('instructorGroup', {
            title: this.get('title'),
            school: this.get('currentSchool')
          });
          this.get('save')(instructorGroup).finally(()=>{
            this.set('isSaving', false);
          })
        }
      });
    },
    cancel: function(){
      this.sendAction('cancel');
    }
  }
});

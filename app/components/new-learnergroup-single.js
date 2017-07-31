import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 60
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  title: null,
  fillModeSupported: false,
  fillWithCohort: false,
  isSaving: false,

  actions: {
    save() {
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        this.set('isSaving', true);
        if (validations.get('isValid')) {
          const title = this.get('title');
          const fillWithCohort = this.get('fillWithCohort');
          return this.get('save')(title, fillWithCohort);
        }
      }).finally(()=>{
        this.set('isSaving', false);
      });
    },
  }
});

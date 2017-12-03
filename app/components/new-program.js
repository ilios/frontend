/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

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
  tagName: 'section',
  classNames: ['new-program', 'new-result', 'form-container', 'resultslist-new'],
  title: null,
  isSaving: false,

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let program = this.get('store').createRecord('program', {
            title: this.get('title'),
            school: this.get('currentSchool')
          });
          this.get('save')(program).finally(()=>{
            this.set('isSaving', false);
          });
        } else {
          this.set('isSaving', false);
        }
      });
    }
  }
});

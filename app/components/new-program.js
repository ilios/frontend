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
  title: null,
  isSaving: false,
  classNames: ['new-program'],
  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.send('save');
      return;
    }

    if(27 === keyCode) {
      this.sendAction('cancel');
    }
  },
  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let program = this.store.createRecord('program', {
            title: this.title,
            school: this.currentSchool
          });
          this.save(program).finally(()=>{
            this.set('isSaving', false);
          });
        } else {
          this.set('isSaving', false);
        }
      });
    }
  }
});

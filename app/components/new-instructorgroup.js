import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),

  classNames: ['new-instructorgroup'],

  currentSchool: null,
  isSaving: false,
  title: null,

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let instructorGroup = this.store.createRecord('instructorGroup', {
            title: this.title,
            school: this.currentSchool
          });
          this.save(instructorGroup).finally(()=>{
            this.set('isSaving', false);
          });
        }
      });
    },

    cancel() {
      this.cancel();
    }
  },

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
      this.send('cancel');
    }
  }
});

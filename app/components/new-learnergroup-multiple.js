/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const Validations = buildValidations({
  numSubGroups: [
    validator('presence', true),
    validator('number', {
      allowString: true,
      integer: true,
      gt: 0,
      lte: 50
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  classNames: ['form'],
  numSubGroups: null,
  isSaving: false,

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
      this.send('addErrorDisplayFor', 'numSubGroups');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const num = this.numSubGroups;
          this.sendAction('generateNewLearnerGroups', num);
        }
      });
    },
  }
});

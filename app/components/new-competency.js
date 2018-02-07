/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 200
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  title: null,
  classNames: ['new-competency'],
  save: task(function * (){
    this.send('addErrorDisplayFor', 'title');
    let {validations} = yield this.validate();
    if (validations.get('isInvalid')) {
      return;
    }
    yield timeout(10);
    const title = this.get('title');
    yield this.get('add')(title);
    this.send('clearErrorDisplay');
    this.set('title', null);
  }),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.get('save').perform();
      return;
    }

    if(27 === keyCode) {
      this.send('removeErrorDisplayFor', 'title');
      this.set('title', '');
    }
  }
});

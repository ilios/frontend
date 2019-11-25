import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 200
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  classNames: ['new-competency'],

  title: null,

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.save.perform();
      return;
    }

    if(27 === keyCode) {
      this.send('removeErrorDisplayFor', 'title');
      this.set('title', '');
    }
  },

  save: task(function* () {
    this.send('addErrorDisplayFor', 'title');
    const {validations} = yield this.validate();
    if (validations.get('isInvalid')) {
      return;
    }
    yield timeout(10);
    const title = this.title;
    yield this.add(title);
    this.send('clearErrorDisplay');
    this.set('title', null);
  })
});

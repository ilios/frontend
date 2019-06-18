import Component from '@ember/component';
import NewUser from 'ilios/mixins/newuser';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  firstName: [
    validator('presence', true),
    validator('length', {
      max: 20
    })
  ],
  middleName: [
    validator('length', {
      max: 20
    })
  ],
  lastName: [
    validator('presence', true),
    validator('length', {
      max: 20
    })
  ],
  username: [
    validator('presence', true),
    validator('length', {
      max: 100
    })
  ],
  password: [
    validator('presence', true)
  ],
  campusId: [
    validator('length', {
      max: 16
    })
  ],
  otherId: [
    validator('length', {
      max: 16
    })
  ],
  email: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
    validator('format', {
      type: 'email'
    })
  ],
  phone: [
    validator('length', {
      max: 20
    })
  ]
});

export default Component.extend(NewUser, Validations, {
  classNames: ['new-user'],

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

    if (27 === keyCode) {
      this.close();
    }
  }
});

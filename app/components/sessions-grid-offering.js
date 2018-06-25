import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';

const Validations = buildValidations({
  room: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 255
    }),
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  tagName: 'tr',
  classNames: ['is-expanded'],
  canUpdate: false,
  room: null,

  didReceiveAttrs(){
    this._super(...arguments);
    const offering = this.get('offering');
    this.set('room', offering.room);
  },

  actions: {
    revertRoomChanges(){
      const offering = this.get('offering');
      this.set('room', offering.get('room'));
    },
  },
  changeRoom: task(function * (){
    yield timeout(10);
    this.send('addErrorDisplayFor', 'room');
    const offering = this.get('offering');
    const room = this.get('room');
    const { validations } = yield this.validate();
    if (validations.get('isInvalid')) {
      return;
    }
    this.send('removeErrorDisplayFor', 'room');
    offering.set('room', room);
    yield offering.save();
  }).drop(),
});

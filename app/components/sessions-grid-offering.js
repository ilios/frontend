import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';
import scrollIntoView from 'scroll-into-view';

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
  classNameBindings: [':sessions-grid-offering', 'firstRow', 'even', 'wasUpdated'],
  canUpdate: false,
  room: null,
  firstRow: false,
  even: false,
  isEditing: false,
  wasUpdated: false,
  'data-test-sessions-grid-offering': true,

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
    close() {
      this.set('isEditing', false);
      scrollIntoView(this.element);
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
  save: task(function * (startDate, endDate, room, learnerGroups, instructorGroups, instructors){
    const offering = this.get('offering');
    offering.setProperties({startDate, endDate, room, learnerGroups, instructorGroups, instructors});

    yield offering.save();
    this.updateUi.perform();
  }).drop(),
  updateUi: task(function* () {
    yield timeout(10);
    this.set('wasUpdated', true);
    scrollIntoView(this.element);
    yield timeout(4000);
    this.set('wasUpdated', false);
  }).restartable(),
});

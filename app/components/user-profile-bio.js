import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';

const { Component, inject } = Ember;
const { service } = inject;

const Validations = buildValidations({
  firstName: [
    validator('presence', true),
    validator('length', {
      max: 20
    }),
  ],
  middleName: [
    validator('length', {
      max: 20
    }),
  ],
  lastName: [
    validator('presence', true),
    validator('length', {
      max: 20
    }),
  ],
  campusId: [
    validator('length', {
      max: 16
    }),
  ],
  otherId: [
    validator('length', {
      max: 16
    }),
  ],
  email: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
    validator('format', {
      type: 'email'
    }),
  ],
  phone: [
    validator('length', {
      max: 20
    }),
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  currentUser: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    const user = this.get('user');
    this.setProperties(user.getProperties(
      'firstName',
      'middleName',
      'lastName',
      'campusId',
      'otherId',
      'email',
      'phone'
    ));
  },
  classNameBindings: [':user-profile-bio', ':small-component', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManagable: false,
  firstName: null,
  middleName: null,
  lastName: null,
  campusId: null,
  otherId: null,
  email: null,
  phone: null,
  hasSavedRecently: false,

  save: task(function * (){
    yield timeout(100);
    this.send('addErrorDisplaysFor', ['firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone']);
    let {validations} = yield this.validate();
    if (validations.get('isValid')) {
      const user = this.get('user');
      user.setProperties(this.getProperties(
        'firstName',
        'middleName',
        'lastName',
        'campusId',
        'otherId',
        'email',
        'phone'
      ));

      yield user.save();
      this.send('clearErrorDisplay');
      this.get('setIsManaging')(false);
      this.set('hasSavedRecently', true);
      yield timeout(500);
      this.set('hasSavedRecently', false);
    }

  }).drop(),
});

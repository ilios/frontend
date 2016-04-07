import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { computed, Component, inject, RSVP } = Ember;
const { PromiseObject, PromiseArray } = DS;
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
  flashMessages: service(),


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

  classNames: ['user-profile'],

  firstName: null,
  middleName: null,
  lastName: null,
  campusId: null,
  otherId: null,
  email: null,
  phone: null,

  isEditing: false,
  isSaving: false,

  roles: computed({
    get() {
      const store = this.get('store');
      return store.findAll('user-role');
    }
  }).readOnly(),

  secondaryCohorts: computed('user', {
    get() {
      const user = this.get('user');

      let promise = user.get('cohorts').then((cohorts) => {
        return user.get('primaryCohort').then((primaryCohort) => {
          if (!primaryCohort) {
            return cohorts;
          }
          return cohorts.filter(cohort => {
            return cohort.get('id') !== primaryCohort.get('id');
          });
        });
      });

      return PromiseArray.create({ promise });
    }
  }).readOnly(),

  isCourseDirector: computed('user.roles.[]', {
    get() {
      const roles = this.get('user.roles');
      const isCourseDirector = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Course Director');
      });

      return PromiseObject.create({ promise: isCourseDirector });
    }
  }).readOnly(),

  isInstructor: computed('user.roles.[]', {
    get() {
      const roles = this.get('user.roles');
      const isInstructor = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Faculty');
      });

      return PromiseObject.create({ promise: isInstructor });
    }
  }).readOnly(),

  isDeveloper: computed('user.roles.[]', {
    get() {
      const roles = this.get('user.roles');
      const isDeveloper = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Developer');
      });

      return PromiseObject.create({ promise: isDeveloper });
    }
  }).readOnly(),

  isFormerStudent: computed('user.roles.[]', {
    get() {
      const roles = this.get('user.roles');
      const isFormerStudent = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Former Student');
      });

      return PromiseObject.create({
        promise: isFormerStudent
      });
    }
  }).readOnly(),

  isDisabled: computed('user.enabled', {
    get() {
      const isDisabled = !this.get('user.enabled');
      return isDisabled ? true : false;
    }
  }).readOnly(),

  removeFromSync: computed('user.userSyncIgnore', {
    get() {
      const removeFromSync = this.get('user.userSyncIgnore');
      return removeFromSync ? true : false;
    }
  }).readOnly(),

  inProgress: false,

  save: task(function * () {
    this.set('isSaving', true);
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
      this.set('isEditing', false);
      this.get('flashMessages').success('general.savedSuccessfully');
    }
    this.set('isSaving', false);
  }).drop(),

  actions: {
    addRole(roleToAdd) {
      this.set('inProgress', true);
      const { user, roles } = this.getProperties('user', 'roles');

      roles.then((roles) => {
        const userRole = roles.find((role) => role.get('title') === roleToAdd);

        user.get('roles').then((userRoles) => {
          userRoles.pushObject(userRole);
          user.save().then(() => {
            this.set('inProgress', false);
          });
        });
      });
    },

    removeRole(roleToRemove) {
      this.set('inProgress', true);
      const user = this.get('user');

      user.get('roles').then((roles) => {
        const userRole = roles.find((role) => role.get('title') === roleToRemove);
        roles.removeObject(userRole);
        user.save().then(() => {
          this.set('inProgress', false);
        });
      });
    },

    enableUser() {
      this.set('inProgress', true);
      const user = this.get('user');
      user.set('enabled' , true);
      user.save().then(() => {
        this.set('inProgress', false);
      });
    },

    disableUser() {
      this.set('inProgress', true);
      const user = this.get('user');
      user.set('enabled' , false);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          RSVP.all(updates.invoke('save')).then(() => {
            this.set('inProgress', false);
            this.get('flashMessages').success('general.savedSuccessfully');
          });
        });
      });
    },

    includeToSync() {
      this.set('inProgress', true);
      const user = this.get('user');
      user.set('userSyncIgnore' , false);
      user.save().then(() => {
        this.set('inProgress', false);
      });
    },

    excludeFromSync() {
      this.set('inProgress', true);
      const user = this.get('user');
      user.set('userSyncIgnore' , true);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          RSVP.all(updates.invoke('save')).then(() => {
            this.set('inProgress', false);
            this.get('flashMessages').success('general.savedSuccessfully');
          });
        });
      });
    },
  }
});

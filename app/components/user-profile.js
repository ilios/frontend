import Ember from 'ember';
import DS from 'ember-data';
import { task } from 'ember-concurrency';

const { computed, Component, inject, RSVP } = Ember;
const { PromiseObject } = DS;
const { service } = inject;
const { sort, reads } = computed;

export default Component.extend({
  currentUser: service(),
  classNames: ['user-profile'],

  bufferedCohorts: [],

  isEditing: computed({
    get() {
      return this.get('editMode');
    },
    set(key, value) {
      if (! value) {
        this.set('bufferedCohorts', []);
      } else {
        this.get('user.cohorts').then(cohorts => {
          this.set('bufferedCohorts', cohorts.toArray());
        });
      }
      this.set('editMode', value);
      return value;
    }
  }),

  roles: computed({
    get() {
      const store = this.get('store');
      return store.findAll('user-role');
    }
  }).readOnly(),

  secondaryCohorts: reads('user.secondaryCohorts'),

  cohortSorting: [
    'programYear.program.school.title:asc',
    'programYear.program.title:asc',
    'title:desc'
  ],

  sortedSecondaryCohorts: sort('secondaryCohorts', 'cohortSorting'),

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
      let cohorts = user.get('cohorts');
      cohorts.clear();
      cohorts.addObjects(this.get('bufferedCohorts'));
      this.get('bufferedCohorts').forEach(cohort => {
        cohort.get('users').addObject(user);
      });
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

    addCohortToBuffer(cohort){
      this.get('bufferedCohorts').addObject(cohort);
    },

    removeCohortFromBuffer(cohort){
      this.get('bufferedCohorts').removeObject(cohort);
    }
  }
});

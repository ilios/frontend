import Ember from 'ember';
import DS from 'ember-data';

const { computed, Component, inject } = Ember;
const { PromiseObject } = DS;
const { service } = inject;

export default Component.extend({
  store: service(),

  roles: computed({
    get() {
      const store = this.get('store');
      return store.findAll('user-role');
    }
  }).readOnly(),

  secondaryCohorts: computed('user', {
    get() {
      const user = this.get('model');

      const cohorts = user.get('cohorts').then((cohorts) => {
        return user.get('primaryCohort').then((primaryCohort) => {
          return cohorts.removeObject(primaryCohort);
        });
      });

      return PromiseObject.create({ promise: cohorts });
    }
  }).readOnly(),

  isCourseDirector: computed('model.roles.[]', {
    get() {
      const roles = this.get('model.roles');
      const isCourseDirector = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Course Director');
      });

      return PromiseObject.create({ promise: isCourseDirector });
    }
  }).readOnly(),

  isInstructor: computed('model.roles.[]', {
    get() {
      const roles = this.get('model.roles');
      const isInstructor = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Faculty');
      });

      return PromiseObject.create({ promise: isInstructor });
    }
  }).readOnly(),

  isDeveloper: computed('model.roles.[]', {
    get() {
      const roles = this.get('model.roles');
      const isDeveloper = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Developer');
      });

      return PromiseObject.create({ promise: isDeveloper });
    }
  }).readOnly(),

  isFormerStudent: computed('model.roles.[]', {
    get() {
      const roles = this.get('model.roles');
      const isFormerStudent = roles.then((userRoles) => {
        return !!userRoles.find((userRole) => userRole.get('title') === 'Former Student');
      });

      return PromiseObject.create({
        promise: isFormerStudent
      });
    }
  }).readOnly(),

  isDisabled: computed('model.enabled', {
    get() {
      const isDisabled = !this.get('model.enabled');
      return isDisabled ? true : false;
    }
  }).readOnly(),

  removeFromSync: computed('model.userSyncIgnore', {
    get() {
      const removeFromSync = this.get('model.userSyncIgnore');
      return removeFromSync ? true : false;
    }
  }).readOnly(),

  inProgress: false,

  actions: {
    addRole(roleToAdd) {
      this.set('inProgress', true);
      const user = this.get('model');
      const roles = this.get('roles');

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
      const user = this.get('model');

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
      const user = this.get('model');
      user.set('enabled' , true);
      user.save().then(() => {
        this.set('inProgress', false);
      });
    },

    disableUser() {
      this.set('inProgress', true);
      const user = this.get('model');
      user.set('enabled' , false);
      user.save().then(() => {
        this.set('inProgress', false);
      });
    },

    includeToSync() {
      this.set('inProgress', true);
      const user = this.get('model');
      user.set('userSyncIgnore' , false);
      user.save().then(() => {
        this.set('inProgress', false);
      });
    },

    excludeFromSync() {
      this.set('inProgress', true);
      const user = this.get('model');
      user.set('userSyncIgnore' , true);
      user.save().then(() => {
        this.set('inProgress', false);
      });
    }
  }
});

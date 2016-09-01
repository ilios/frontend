import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Component, inject, isEmpty, computed } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  currentUser: service(),

  init(){
    this._super(...arguments);
    this.set('flippedRoles', []);
  },

  classNameBindings: [':user-profile-roles', ':small-component', ':last', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManagable: false,
  hasSavedRecently: false,
  finishedSetup: false,
  flippedRoles: null,

  save: task(function * (){
    const store = this.get('store');
    const user = this.get('user');

    const isCourseDirector = yield this.get('isCourseDirector');
    const isFaculty = yield this.get('isFaculty');
    const isDeveloper = yield this.get('isDeveloper');
    const isStudent = yield this.get('isStudent');
    const isFormerStudent = yield this.get('isFormerStudent');
    const isEnabled = yield this.get('isEnabled');
    const isUserSyncIgnored = yield this.get('isUserSyncIgnored');

    let roles = yield store.findAll('user-role');
    const courseDirectorRole = roles.findBy('title', 'Course Director');
    const facultyRole = roles.findBy('title', 'Faculty');
    const developerRole = roles.findBy('title', 'Developer');
    const studentRole = roles.findBy('title', 'Student');
    const formerStudentRole = roles.findBy('title', 'Former Student');

    //reset flippedRoles here to prevent CP changes when we update the roles
    this.set('flippedRoles', []);
    user.set('enabled', isEnabled);
    user.set('userSyncIgnore', isUserSyncIgnored);
    let userRoles = yield user.get('roles');
    userRoles.clear();
    if (isCourseDirector) {
      userRoles.pushObject(courseDirectorRole);
    }
    if (isFaculty) {
      userRoles.pushObject(facultyRole);
    }
    if (isDeveloper) {
      userRoles.pushObject(developerRole);
    }
    if (isStudent) {
      userRoles.pushObject(studentRole);
    }
    if (isFormerStudent) {
      userRoles.pushObject(formerStudentRole);
    }

    yield user.save();
    this.get('setIsManaging')(false);
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);

  }).drop(),

  roleTitles: computed('user.roles.[]', function(){
    const user = this.get('user');
    return new Promise(resolve => {
      if (isEmpty(user)) {
        resolve([]);
        return;
      }

      user.get('roles').then(roles => {
        let roleTitles = roles.map(role => role.get('title').toLowerCase());
        resolve(roleTitles);
      });
    })
  }),

  isCourseDirector: computed('roleTitles.[]', 'flippedRoles.[]', function(){
    const flippedRoles = this.get('flippedRoles');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.contains('course director');
        const flipped = flippedRoles.contains('course director');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isFaculty: computed('roleTitles.[]', 'flippedRoles.[]', function(){
    const flippedRoles = this.get('flippedRoles');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.contains('faculty');
        const flipped = flippedRoles.contains('faculty');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isDeveloper: computed('roleTitles.[]', 'flippedRoles.[]', function(){
    const flippedRoles = this.get('flippedRoles');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.contains('developer');
        const flipped = flippedRoles.contains('developer');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isStudent: computed('roleTitles.[]', 'flippedRoles.[]', function(){
    const flippedRoles = this.get('flippedRoles');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.contains('student');
        const flipped = flippedRoles.contains('student');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isFormerStudent: computed('roleTitles.[]', 'flippedRoles.[]', function(){
    const flippedRoles = this.get('flippedRoles');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.contains('former student');
        const flipped = flippedRoles.contains('former student');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isEnabled: computed('user.enabled', 'flippedRoles.[]', function(){
    const flippedRoles = this.get('flippedRoles');
    const user = this.get('user');
    return new Promise(resolve => {
      if (isEmpty(user)) {
        resolve(false);
        return;
      }
      const originallyYes = user.get('enabled');
      const flipped = flippedRoles.contains('enabled');

      resolve((originallyYes && !flipped) || (!originallyYes && flipped));
    });
  }),

  isUserSyncIgnored: computed('user.userSyncIgnore', 'flippedRoles.[]', function(){
    const flippedRoles = this.get('flippedRoles');
    const user = this.get('user');
    return new Promise(resolve => {
      if (isEmpty(user)) {
        resolve(false);
        return;
      }
      const originallyYes = user.get('userSyncIgnore');
      const flipped = flippedRoles.contains('userSyncIgnore');

      resolve((originallyYes && !flipped) || (!originallyYes && flipped));
    });
  }),

  actions: {
    cancel(){
      this.set('flippedRoles', []);
      this.get('setIsManaging')(false);
    },
    toggleFlippedRole(roleTitle){
      if (this.get('flippedRoles').contains(roleTitle)) {
        this.get('flippedRoles').removeObject(roleTitle);
      } else {
        this.get('flippedRoles').pushObject(roleTitle);
      }
    }
  }

});

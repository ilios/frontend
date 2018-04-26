/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

const { Promise } = RSVP;

export default Component.extend({
  store: service(),
  currentUser: service(),

  classNameBindings: [':user-profile-roles', ':small-component', ':last', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManageable: false,
  hasSavedRecently: false,
  finishedSetup: false,
  isCourseDirectorFlipped: false,
  isFacultyFlipped: false,
  isDeveloperFlipped: false,
  isStudentFlipped: false,
  isFormerStudentFlipped: false,
  isEnabledFlipped: false,
  isUserSyncIgnoredFlipped: false,

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
    this.set('isCourseDirectorFlipped', false);
    this.set('isFacultyFlipped', false);
    this.set('isDeveloperFlipped', false);
    this.set('isStudentFlipped', false);
    this.set('isFormerStudentFlipped', false);
    this.set('isEnabledFlipped', false);
    this.set('isUserSyncIgnoredFlipped', false);
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
    });
  }),

  isCourseDirector: computed('roleTitles.[]', 'isCourseDirectorFlipped', function(){
    const flipped = this.get('isCourseDirectorFlipped');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.includes('course director');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isFaculty: computed('roleTitles.[]', 'isFacultyFlipped', function(){
    const flipped = this.get('isFacultyFlipped');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.includes('faculty');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isDeveloper: computed('roleTitles.[]', 'isDeveloperFlipped', function(){
    const flipped = this.get('isDeveloperFlipped');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.includes('developer');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isStudent: computed('roleTitles.[]', 'isStudentFlipped', function(){
    const flipped = this.get('isStudentFlipped');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.includes('student');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isFormerStudent: computed('roleTitles.[]', 'isFormerStudentFlipped', function(){
    const flipped = this.get('isFormerStudentFlipped');
    return new Promise(resolve => {
      this.get('roleTitles').then(roleTitles => {
        const originallyYes = roleTitles.includes('former student');

        resolve((originallyYes && !flipped) || (!originallyYes && flipped));
      });
    });
  }),

  isEnabled: computed('user.enabled', 'isEnabledFlipped', function(){
    const flipped = this.get('isEnabledFlipped');
    const user = this.get('user');
    return new Promise(resolve => {
      if (isEmpty(user)) {
        resolve(false);
        return;
      }
      const originallyYes = user.get('enabled');

      resolve((originallyYes && !flipped) || (!originallyYes && flipped));
    });
  }),

  isUserSyncIgnored: computed('user.userSyncIgnore', 'isUserSyncIgnoredFlipped', function(){
    const flipped = this.get('isUserSyncIgnoredFlipped');
    const user = this.get('user');
    return new Promise(resolve => {
      if (isEmpty(user)) {
        resolve(false);
        return;
      }
      const originallyYes = user.get('userSyncIgnore');

      resolve((originallyYes && !flipped) || (!originallyYes && flipped));
    });
  }),

  actions: {
    cancel(){
      this.set('isCourseDirectorFlipped', false);
      this.set('isFacultyFlipped', false);
      this.set('isDeveloperFlipped', false);
      this.set('isStudentFlipped', false);
      this.set('isFormerStudentFlipped', false);
      this.set('isEnabledFlipped', false);
      this.set('isUserSyncIgnoredFlipped', false);
      this.get('setIsManaging')(false);
    }
  }

});

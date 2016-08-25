import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Component, inject, isPresent } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  currentUser: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    const user = this.get('user');
    if (isPresent(user)) {
      this.get('setup').perform(user);
    }
  },

  classNameBindings: [':user-profile-roles', ':small-component', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManagable: false,
  isCourseDirector: false,
  isFaculty: false,
  isDeveloper: false,
  isPublic: false,
  isFormerStudent: false,
  isDisabled: false,
  isExcludedFromSync: false,
  hasSavedRecently: false,
  finishedSetup: false,

  setup: task(function * (user){
    this.set('finishedSetup', false);
    let roles = yield user.get('roles');
    let roleTitles = roles.map(role => role.get('title').toLowerCase());
    this.set('isCourseDirector', roleTitles.contains('course director'));
    this.set('isFaculty', roleTitles.contains('faculty'));
    this.set('isDeveloper', roleTitles.contains('developer'));
    this.set('isFormerStudent', roleTitles.contains('former student'));
    this.set('isDisabled', !user.get('enabled'));
    this.set('isExcludedFromSync', user.get('userSyncIgnore'));
    this.set('finishedSetup', true);
  }),

  save: task(function * (){
    const finishedSetup = this.get('finishedSetup');
    if (!finishedSetup) {
      return;
    }
    const store = this.get('store');
    const user = this.get('user');

    const isCourseDirector = this.get('isCourseDirector');
    const isFaculty = this.get('isFaculty');
    const isDeveloper = this.get('isDeveloper');
    const isFormerStudent = this.get('isFormerStudent');
    const isDisabled = this.get('isDisabled');
    const isExcludedFromSync = this.get('isExcludedFromSync');

    user.set('enabled', !isDisabled);
    user.set('userSyncIgnore', isExcludedFromSync);
    let roles = yield store.findAll('user-role');
    const courseDirectorRole = roles.findBy('title', 'Course Director');
    const facultyRole = roles.findBy('title', 'Faculty');
    const developerRole = roles.findBy('title', 'Developer');
    const formerStudentRole = roles.findBy('title', 'Former Student');

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
    if (isFormerStudent) {
      userRoles.pushObject(formerStudentRole);
    }

    yield user.save();
    this.get('setIsManaging')(false);
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);

  }).drop(),

});

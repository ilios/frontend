/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';


export default Component.extend({
  store: service(),

  classNameBindings: [':user-profile-roles', ':small-component', ':last', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManageable: false,
  hasSavedRecently: false,
  finishedSetup: false,
  isStudentFlipped: false,
  isFormerStudentFlipped: false,
  isEnabledFlipped: false,
  isUserSyncIgnoredFlipped: false,
  'data-test-user-profile-roles': true,

  save: task(function * (){
    const store = this.get('store');
    const user = this.get('user');

    const isStudent = yield this.get('isStudent');
    const isFormerStudent = yield this.get('isFormerStudent');
    const isEnabled = yield this.get('isEnabled');
    const isUserSyncIgnored = yield this.get('isUserSyncIgnored');

    let roles = yield store.findAll('user-role');
    const studentRole = roles.findBy('title', 'Student');
    const formerStudentRole = roles.findBy('title', 'Former Student');

    //reset flippedRoles here to prevent CP changes when we update the roles
    this.set('isStudentFlipped', false);
    this.set('isFormerStudentFlipped', false);
    this.set('isEnabledFlipped', false);
    this.set('isUserSyncIgnoredFlipped', false);
    user.set('enabled', isEnabled);
    user.set('userSyncIgnore', isUserSyncIgnored);
    let userRoles = yield user.get('roles');
    userRoles.clear();
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

  roleTitles: computed('user.roles.[]', async function(){
    const user = this.get('user');
    if (isEmpty(user)) {
      return [];
    }
    const roles = await user.get('roles');
    return roles.map(role => role.get('title').toLowerCase());
  }),

  isStudent: computed('roleTitles.[]', 'isStudentFlipped', async function(){
    const flipped = this.get('isStudentFlipped');
    const roleTitles = await this.get('roleTitles');

    const originallyYes = roleTitles.includes('student');
    return (originallyYes && !flipped) || (!originallyYes && flipped);
  }),

  isFormerStudent: computed('roleTitles.[]', 'isFormerStudentFlipped', async function(){
    const flipped = this.get('isFormerStudentFlipped');
    const roleTitles = await this.get('roleTitles');

    const originallyYes = roleTitles.includes('former student');
    return (originallyYes && !flipped) || (!originallyYes && flipped);
  }),

  isEnabled: computed('user.enabled', 'isEnabledFlipped', function(){
    const flipped = this.get('isEnabledFlipped');
    const user = this.get('user');
    if (isEmpty(user)) {
      return false;
    }
    const originallyYes = user.get('enabled');
    return (originallyYes && !flipped) || (!originallyYes && flipped);
  }),

  isUserSyncIgnored: computed('user.userSyncIgnore', 'isUserSyncIgnoredFlipped', function(){
    const flipped = this.get('isUserSyncIgnoredFlipped');
    const user = this.get('user');
    if (isEmpty(user)) {
      return false;
    }
    const originallyYes = user.get('userSyncIgnore');
    return (originallyYes && !flipped) || (!originallyYes && flipped);
  }),

  actions: {
    cancel(){
      this.set('isStudentFlipped', false);
      this.set('isFormerStudentFlipped', false);
      this.set('isEnabledFlipped', false);
      this.set('isUserSyncIgnoredFlipped', false);
      this.get('setIsManaging')(false);
    }
  }

});

/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

const { Promise } = RSVP;

export default Component.extend({
  store: service(),
  currentUser: service(),

  init(){
    this._super(...arguments);
    this.set('togglePermissions', []);
  },

  classNameBindings: [':user-profile-schools', ':small-component', ':last', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManageable: false,

  togglePermissions: null,
  hasSavedRecently: false,

  save: task(function * (){
    yield timeout(10);
    const store = this.get('store');
    const user = this.get('user');

    const readSchools = yield this.get('readSchools');
    const writeSchools = yield this.get('writeSchools');
    const readOnlySchools = readSchools.filter(school => !writeSchools.includes(school));

    const userPermissions = yield user.get('permissions');
    yield userPermissions.invoke('destroyRecord');
    userPermissions.clear();

    let newPermissions = [];
    const writePermissions = writeSchools.map(school => {
      return store.createRecord('permission', {
        canRead: true,
        canWrite: true,
        user,
        tableName: 'school',
        tableRowId: school.get('id')
      });

    });
    newPermissions.pushObjects(writePermissions);

    const readOnlyPermissions = readOnlySchools.map(school => {
      return store.createRecord('permission', {
        canRead: true,
        canWrite: false,
        user,
        tableName: 'school',
        tableRowId: school.get('id')
      });
    });
    newPermissions.pushObjects(readOnlyPermissions);

    yield newPermissions.invoke('save');
    this.get('cancel').perform();
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);

  }).drop(),

  cancel: task(function * (){
    yield timeout(1);
    this.set('hasSavedRecently', false);
    this.set('togglePermissions', []);
    this.get('setIsManaging')(false);

  }).drop(),

  displaySchools: computed('editableSchools.[]', 'secondarySchools.[]', 'isManaging', function(){
    const isManaging = this.get('isManaging');
    if (isManaging) {
      return this.get('editableSchools');
    } else {
      return this.get('secondarySchools');
    }
  }),

  editableSchools: computed('user.school', 'currentUser.model.schools', 'currentUser.model.school', function(){
    const currentUser = this.get('currentUser');
    const user = this.get('user');
    return new Promise(resolve => {
      currentUser.get('model').then(authUser => {
        authUser.get('schools').then(schools => {
          user.get('school').then(userPrimarySchool => {
            let editableSchools = schools.filter(school => school.get('id') !== userPrimarySchool.get('id'));
            resolve(editableSchools);
          });
        });
      });
    });
  }),

  secondarySchools: computed('user.school', 'currentUser.model.school', async function(){
    const store = this.get('store');
    const user = this.get('user');
    const schools = await store.findAll('school');
    const primarySchool = await user.get('school');
    const secondarySchools = schools.filter(school => school.get('id') !== primarySchool.get('id'));

    return secondarySchools;
  }),

  readSchools: computed('user.permissions.[]', 'secondarySchools.[]', 'togglePermissions.[]', async function(){
    const togglePermissions = this.get('togglePermissions');
    const user = this.get('user');

    const schools = await this.get('secondarySchools');
    const overriddenIds = schools.filter(school => {
      const permission = school.get('id') + 'read';
      return togglePermissions.includes(permission);
    }).mapBy('id');
    const permissions = await user.get('permissions');
    const existingIds = permissions.filter(permission => {
      return permission.get('tableName') === 'school' && permission.get('canRead');
    }).mapBy('tableRowId');
    const readSchools = schools.filter(school => {
      let id = school.get('id');
      return (existingIds.includes(id) && !overriddenIds.includes(id)) ||
             (!existingIds.includes(id) && overriddenIds.includes(id));
    });

    return readSchools;
  }),

  writeSchools: computed('user.permissions.[]', 'secondarySchools.[]', 'togglePermissions.[]', async function(){
    const togglePermissions = this.get('togglePermissions');
    const user = this.get('user');

    const schools = await this.get('secondarySchools');
    const overriddenIds = schools.filter(school => {
      const permission = school.get('id') + 'write';
      return togglePermissions.includes(permission);
    }).mapBy('id');
    const permissions = await user.get('permissions');
    const existingIds = permissions.filter(permission => {
      return permission.get('tableName') === 'school' && permission.get('canWrite');
    }).mapBy('tableRowId');
    const writeSchools = schools.filter(school => {
      let id = school.get('id');
      return (existingIds.includes(id) && !overriddenIds.includes(id)) ||
             (!existingIds.includes(id) && overriddenIds.includes(id));
    });

    return [].concat(writeSchools);
  }),

  readAndWriteSchoolIds: computed('readSchools.[]', 'writeSchools.[]', async function(){
    const readSchools = await this.get('readSchools');
    const writeSchools = await this.get('writeSchools');

    const all = [].concat(readSchools, writeSchools);

    return all.mapBy('id');
  }),

  writeSchoolIds: computed('writeSchools.[]', async function(){
    const writeSchools = await this.get('writeSchools');
    return writeSchools.mapBy('id');
  }),

  actions: {
    toggleReadSchool(school){
      const permission = school.get('id') + 'read';
      if (this.get('togglePermissions').includes(permission)) {
        this.get('togglePermissions').removeObject(permission);
      } else {
        this.get('togglePermissions').pushObject(permission);
      }
    },
    toggleWriteSchool(school){
      const permission = school.get('id') + 'write';
      if (this.get('togglePermissions').includes(permission)) {
        this.get('togglePermissions').removeObject(permission);
      } else {
        this.get('togglePermissions').pushObject(permission);
      }
    }
  }
});

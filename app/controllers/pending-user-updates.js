import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt, sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { all } from 'rsvp';

export default Controller.extend({
  flashMessages: service(),
  store: service(),

  queryParams: ['offset', 'limit', 'filter', 'school'],

  deletedUpdates: null,
  filter: '',
  limit: 25,
  offset: 0,
  school: null,
  sortSchoolsBy: null,
  updatesBeingSaved: null,

  hasMoreThanOneSchool: gt('model.schools.length', 1),
  sortedSchools: sort('model.schools', 'sortSchoolsBy'),

  selectedSchool: computed('model.schools.[]', 'model.primarySchool', 'school', function() {
    const schools = this.get('model.schools');
    const schoolId = this.school;
    if(isPresent(schoolId)){
      const school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }
    return this.get('model.primarySchool');
  }),

  allUpdates: computed('selectedSchool', async function() {
    const school = this.selectedSchool;
    const filters = { schools: [school.id] };
    const updates = await this.store.query('pending-user-update', { filters });
    // Preload user for each update
    await all(updates.mapBy('user'));
    return updates;
  }),

  displayedUpdates: computed('allUpdates.@each.user', 'filter', 'offset', 'limit', 'deletedUpdates.[]', async function() {
    const { limit, offset } = this.getProperties('limit', 'offset');
    const end = limit + offset;
    const allUpdates = await this.allUpdates;
    return allUpdates
      .sortBy('user.lastName', 'user.firstName')
      .slice(offset, end)
      .filter((update) => {
        const isNotDeleted = !this.deletedUpdates.includes(update);
        const noUpdateName = isEmpty(update.get('user.fullName'));
        const filterMatch = update
          .get('user.fullName')
          .toLowerCase()
          .includes(this.filter.toLowerCase());
        return isNotDeleted && (noUpdateName || filterMatch);
      });
  }),

  actions: {
    changeSelectedSchool(schoolId) {
      this.set('school', schoolId);
    },

    updateEmailAddress(update) {
      this.updatesBeingSaved.pushObject(update);
      update.get('user').then(user => {
        user.set('email', update.get('value'));
        user.save().then(() => {
          update.deleteRecord();
          update.save().then(() => {
            this.deletedUpdates.pushObject(update);
            this.updatesBeingSaved.removeObject(update);
            this.flashMessages.success('general.savedSuccessfully');
          });
        });
      });
    },

    disableUser(update) {
      this.updatesBeingSaved.pushObject(update);
      update.get('user').then(user => {
        user.set('enabled', false);
        user.save().then(() => {
          user.get('pendingUserUpdates').then(updates => {
            updates.invoke('deleteRecord');
            all(updates.invoke('save')).then(() => {
              this.deletedUpdates.pushObject(update);
              this.updatesBeingSaved.removeObject(update);
              this.flashMessages.success('general.savedSuccessfully');
            });
          });
        });
      });
    },

    excludeFromSync(update) {
      this.updatesBeingSaved.pushObject(update);
      update.get('user').then(user => {
        user.set('userSyncIgnore', true);
        user.save().then(() => {
          user.get('pendingUserUpdates').then(updates => {
            updates.invoke('deleteRecord');
            all(updates.invoke('save')).then(() => {
              this.deletedUpdates.pushObject(update);
              this.updatesBeingSaved.removeObject(update);
              this.flashMessages.success('general.savedSuccessfully');
            });
          });
        });
      });
    }
  }
});

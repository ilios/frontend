/* eslint ember/avoid-leaking-state-in-ember-objects: 0 */
import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt, sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { Promise, all } from 'rsvp';

export default Controller.extend({
  flashMessages: service(),
  store: service(),

  queryParams: ['offset', 'limit', 'filter', 'school'],

  deletedUpdates: [],
  filter: '',
  limit: 25,
  offset: 0,
  school: null,
  sortSchoolsBy: ['title'],
  updatesBeingSaved: [],

  hasMoreThanOneSchool: gt('model.schools.length', 1),
  sortedSchools: sort('model.schools', 'sortSchoolsBy'),

  selectedSchool: computed('model.schools.[]', 'model.primarySchool', 'school', function() {
    let schools = this.get('model.schools');
    const schoolId = this.school;
    if(isPresent(schoolId)){
      const school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }
    return this.get('model.primarySchool');
  }),

  allUpdates: computed('selectedSchool', function() {
    return new Promise(resolve => {
      let school = this.selectedSchool;
      this.store.query('pending-user-update', {
        filters: {
          schools: [school.get('id')]
        }
      }).then(updates => {
        //preload user for each update
        all(updates.mapBy('user')).then(() => {
          resolve(updates);
        });
      });
    });
  }),

  displayedUpdates: computed('allUpdates.@each.user', 'filter', 'offset', 'limit', 'deletedUpdates.[]', function() {
    const limit = this.limit;
    const offset = this.offset;
    const end = limit + offset;
    return new Promise(resolve => {
      this.allUpdates.then(allUpdates => {
        let sortedUpdates = allUpdates.sortBy('user.lastName', 'user.firstName').slice(offset, end).filter(update => {
          return !this.deletedUpdates.includes(update) &&
            (isEmpty(update.get('user.fullName'))
              || update.get('user.fullName').toLowerCase().includes(this.filter.toLowerCase()));
        });
        resolve(sortedUpdates);
      });
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

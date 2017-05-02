import Ember from 'ember';

const { Controller, computed, RSVP, inject, isPresent, isEmpty } = Ember;
const { sort, gt } = computed;
const { service } = inject;
const { all, Promise } = RSVP;

export default Controller.extend({
  store: service(),
  flashMessages: service(),
  queryParams: ['offset', 'limit', 'filter', 'school'],
  offset: 0,
  limit: 25,
  filter: '',
  school: null,
  hasMoreThanOneSchool: gt('model.schools.length', 1),
  sortSchoolsBy:['title'],
  sortedSchools: sort('model.schools', 'sortSchoolsBy'),
  selectedSchool: computed('model.schools.[]', 'model.primarySchool', 'school', function(){
    let schools = this.get('model.schools');
    const schoolId = this.get('school');
    if(isPresent(schoolId)){
      const school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }
    return this.get('model.primarySchool');
  }),

  deletedUpdates: [],
  updatesBeingSaved: [],

  allUpdates: computed('selectedSchool', function(){
    return new Promise(resolve => {
      let school = this.get('selectedSchool');
      this.get('store').query('pending-user-update', {
        limit: 1000,
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

  displayedUpdates: computed('allUpdates.@each.user', 'filter', 'offset', 'limit', 'deletedUpdates.[]', function(){
    const limit = this.get('limit');
    const offset = this.get('offset');
    const end = limit + offset;
    const filter = this.get('filter');
    const exp = new RegExp(filter, 'gi');

    return new Promise(resolve => {
      this.get('allUpdates').then(allUpdates => {
        let sortedUpdates = allUpdates.sortBy('user.lastName', 'user.firstName').slice(offset, end).filter(update => {
          return !this.get('deletedUpdates').includes(update) &&
            (isEmpty(update.get('user.fullName')) || update.get('user.fullName').match(exp));
        });
        resolve(sortedUpdates);
      });
    });
  }),

  actions: {
    changeSelectedSchool(schoolId){
      this.set('school', schoolId);
    },
    updateEmailAddress(update){
      this.get('updatesBeingSaved').pushObject(update);
      update.get('user').then(user => {
        user.set('email', update.get('value'));
        user.save().then(() => {
          update.deleteRecord();
          update.save().then(() => {
            this.get('deletedUpdates').pushObject(update);
            this.get('updatesBeingSaved').removeObject(update);
            this.get('flashMessages').success('general.savedSuccessfully');
          });
        });
      });
    },
    disableUser(update){
      this.get('updatesBeingSaved').pushObject(update);
      update.get('user').then(user => {
        user.set('enabled', false);
        user.save().then(() => {
          user.get('pendingUserUpdates').then(updates => {
            updates.invoke('deleteRecord');
            RSVP.all(updates.invoke('save')).then(() => {
              this.get('deletedUpdates').pushObject(update);
              this.get('updatesBeingSaved').removeObject(update);
              this.get('flashMessages').success('general.savedSuccessfully');
            });
          });
        });
      });

    },
    excludeFromSync(update){
      this.get('updatesBeingSaved').pushObject(update);
      update.get('user').then(user => {
        user.set('userSyncIgnore', true);
        user.save().then(() => {
          user.get('pendingUserUpdates').then(updates => {
            updates.invoke('deleteRecord');
            RSVP.all(updates.invoke('save')).then(() => {
              this.get('deletedUpdates').pushObject(update);
              this.get('updatesBeingSaved').removeObject(update);
              this.get('flashMessages').success('general.savedSuccessfully');
            });
          });
        });
      });

    }
  }
});

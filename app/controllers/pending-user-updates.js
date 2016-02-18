import Ember from 'ember';
import DS from 'ember-data';

const { Controller, computed, RSVP, inject, isPresent, isEmpty } = Ember;
const { sort, gt } = computed;
const { service } = inject;
const { PromiseArray } = DS;

export default Controller.extend({
  store: service(),
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
    if(isPresent(this.get('school'))){
      let school =  schools.find(school => {
        return school.get('id') === this.get('school');
      });
      if(school){
        return school;
      }
    }
    return this.get('model.primarySchool');
  }),

  deletedUpdates: [],

  allUpdates: computed('selectedSchool', function(){
    let defer = RSVP.defer();
    let school = this.get('selectedSchool');
    this.get('store').query('pending-user-update', {
      limit: 1000,
      filters: {
        schools: [school.get('id')]
      }
    }).then(updates => {
      //preload user for each update
      RSVP.all(updates.mapBy('user')).then(() => {
        defer.resolve(updates);
      });
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  displayedUpdates: computed('allUpdates.@each.user.fullName', 'filter', 'offset', 'limit', function(){
    const limit = this.get('limit');
    const offset = this.get('offset');
    const end = limit + offset;
    const filter = this.get('filter');
    const exp = new RegExp(filter, 'gi');

    return this.get('allUpdates')
      .sortBy('user.lastName', 'user.firstName')
      .slice(offset, end).filter(update => {
        return !this.get('deletedUpdates').contains(update) &&
        (isEmpty(update.get('user.fullName')) || update.get('user.fullName').match(exp));
      });
  }),
  actions: {
    changeSelectedSchool(schoolId){
      this.set('school', schoolId);
    },
    updateEmailAddress(update){
      update.get('user').then(user => {
        user.set('email', update.get('value'));
        user.save().then(() => {
          this.get('deletedUpdates').pushObject(update);
          update.deleteRecord();
          update.save();
        });
      });
    },
    disableUser(update){
      update.get('user').then(user => {
        user.set('enabled', false);
        user.save().then(() => {
          this.get('deletedUpdates').pushObject(update);
          update.deleteRecord();
          update.save();
        });
      });

    },
    excludeFromSync(update){
      update.get('user').then(user => {
        user.set('userSyncIgnore', true);
        user.save().then(() => {
          this.get('deletedUpdates').pushObject(update);
          update.deleteRecord();
          update.save();
        });
      });

    }
  }
});

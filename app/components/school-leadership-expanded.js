import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  school: null,
  classNames: ['school-leadership-expanded'],
  directorsToAdd: null,
  directorsToRemove: null,
  administratorsToAdd: null,
  administratorsToRemove: null,
  isManaging: false,
  isCollapsible: computed('isManaging', 'school.directors.length', 'school.administrators.length', function(){
    const school = this.school;
    const isManaging = this.isManaging;
    const administratorIds = school.hasMany('administrators').ids();
    const directorIds = school.hasMany('directors').ids();

    return (administratorIds.length > 0 || directorIds.length > 0) && !isManaging;

  }),
  directors: computed('school.directors.[]', 'directorsToAdd.[]', 'directorsToRemove.[]', async function () {
    if (!this.school) {
      return [];
    }
    const directors = await this.school.directors;
    let arr = directors.toArray();
    arr.pushObjects(this.directorsToAdd);
    return arr.filter(user => !this.directorsToRemove.includes(user)).uniq();
  }),
  administrators: computed('school.administrators.[]', 'administratorsToAdd.[]', 'administratorsToRemove.[]', async function () {
    if (!this.school) {
      return [];
    }
    const administrators = await this.school.administrators;
    let arr = administrators.toArray();
    arr.pushObjects(this.administratorsToAdd);
    return arr.filter(user => !this.administratorsToRemove.includes(user)).uniq();
  }),
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('directorsToAdd', []);
    this.set('directorsToRemove', []);
    this.set('administratorsToAdd', []);
    this.set('administratorsToRemove', []);
  },
  actions: {
    addDirector(user){
      this.directorsToRemove.removeObject(user);
      this.directorsToAdd.pushObject(user);
    },
    removeDirector(user){
      this.directorsToAdd.removeObject(user);
      this.directorsToRemove.pushObject(user);
    },
    addAdministrator(user){
      this.administratorsToRemove.removeObject(user);
      this.administratorsToAdd.pushObject(user);
    },
    removeAdministrator(user){
      this.administratorsToAdd.removeObject(user);
      this.administratorsToRemove.pushObject(user);
    },
  },
  save: task(function * (){
    yield timeout(10);
    const directors = yield this.directors;
    const administrators = yield this.administrators;

    let school = this.school;
    school.setProperties({directors, administrators});
    this.expand();
    yield school.save();
    this.setIsManaging(false);
  }),
});

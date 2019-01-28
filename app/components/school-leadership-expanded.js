/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  school: null,
  classNames: ['school-leadership-expanded'],
  didReceiveAttrs(){
    this._super(...arguments);
    const school = this.school;
    if (school) {
      school.get('directors').then(directors => {
        this.set('directors', directors.toArray());
      });
      school.get('administrators').then(administrators => {
        this.set('administrators', administrators.toArray());
      });
    }
  },
  directors: null,
  administrators: null,
  isManaging: false,
  isCollapsible: computed('isManaging', 'school.directors.length', 'school.administrators.length', function(){
    const school = this.school;
    const isManaging = this.isManaging;
    const administratorIds = school.hasMany('administrators').ids();
    const directorIds = school.hasMany('directors').ids();

    return (administratorIds.length > 0 || directorIds.length > 0) && !isManaging;

  }),
  save: task(function * (){
    yield timeout(10);
    const directors = this.directors;
    const administrators = this.administrators;
    let school = this.school;
    school.setProperties({directors, administrators});
    this.expand();
    yield school.save();
    this.setIsManaging(false);
  }),
  add(where, user){
    let arr = this.get(where).toArray();
    arr.pushObject(user);
    this.set(where, arr);
  },
  remove(where, user){
    let arr = this.get(where).toArray();
    arr.removeObject(user);
    this.set(where, arr);
  },
  actions: {
    addDirector(user){
      this.add('directors', user);
    },
    removeDirector(user){
      this.remove('directors', user);
    },
    addAdministrator(user){
      this.add('administrators', user);
    },
    removeAdministrator(user){
      this.remove('administrators', user);
    },
  }
});

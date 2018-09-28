import Component from '@ember/component';
import layout from '../templates/components/course-leadership-expanded';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  layout,
  course: null,
  editable: false,
  classNames: ['course-leadership-expanded'],
  directors: null,
  administrators: null,
  isManaging: false,
  'data-test-course-leadership-expanded': true,
  isCollapsible: computed('isManaging', 'course.directors.length', 'course.administrators.length', function(){
    const course = this.get('course');
    const isManaging = this.get('isManaging');
    const administratorIds = course.hasMany('administrators').ids();
    const directorIds = course.hasMany('directors').ids();

    return (administratorIds.length > 0 || directorIds.length > 0) && !isManaging;

  }),
  didReceiveAttrs(){
    this._super(...arguments);
    const course = this.get('course');
    if (course) {
      course.get('directors').then(directors => {
        this.set('directors', directors.toArray());
      });
      course.get('administrators').then(administrators => {
        this.set('administrators', administrators.toArray());
      });
    }
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
  },
  save: task(function * (){
    yield timeout(10);
    const directors = this.get('directors');
    const administrators = this.get('administrators');
    let course = this.get('course');
    course.setProperties({directors, administrators});
    this.get('expand')();
    yield course.save();
    this.get('setIsManaging')(false);
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
});

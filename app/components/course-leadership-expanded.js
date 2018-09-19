import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  course: null,
  editable: false,
  classNames: ['course-leadership-expanded'],
  directors: null,
  administrators: null,
  isManaging: false,
  'data-test-course-leadership-expanded': true,
  isCollapsible: computed('isManaging', 'course.directors.length', 'course.administrators.length', function(){
    const course = this.course;
    const isManaging = this.isManaging;
    const administratorIds = course.hasMany('administrators').ids();
    const directorIds = course.hasMany('directors').ids();

    return (administratorIds.length > 0 || directorIds.length > 0) && !isManaging;

  }),
  didReceiveAttrs(){
    this._super(...arguments);
    const course = this.course;
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
    const directors = this.directors;
    const administrators = this.administrators;
    let course = this.course;
    course.setProperties({directors, administrators});
    this.expand();
    yield course.save();
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
});

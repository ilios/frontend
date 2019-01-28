import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  program: null,
  classNames: ['program-leadership-expanded'],
  directors: null,
  isManaging: false,
  'data-test-program-leadership-expanded': true,
  didReceiveAttrs(){
    this._super(...arguments);
    const program = this.program;
    if (program) {
      program.get('directors').then(directors => {
        this.set('directors', directors.toArray());
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
  },
  save: task(function * (){
    yield timeout(10);
    const directors = this.directors;
    let program = this.program;
    program.setProperties({directors});
    this.expand();
    yield program.save();
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

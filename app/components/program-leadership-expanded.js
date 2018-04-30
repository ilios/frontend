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
    const program = this.get('program');
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
    const directors = this.get('directors');
    let program = this.get('program');
    program.setProperties({directors});
    this.get('expand')();
    yield program.save();
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

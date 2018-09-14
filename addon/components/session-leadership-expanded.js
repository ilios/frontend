import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import layout from '../templates/components/session-leadership-expanded';

export default Component.extend({
  layout,
  session: null,
  classNames: ['session-leadership-expanded'],
  administrators: null,
  isManaging: false,
  'data-test-session-leadership-expanded': true,
  didReceiveAttrs(){
    this._super(...arguments);
    const session = this.get('session');
    if (session) {
      session.get('administrators').then(administrators => {
        this.set('administrators', administrators.toArray());
      });
    }
  },
  actions: {
    addAdministrator(user){
      this.add('administrators', user);
    },
    removeAdministrator(user){
      this.remove('administrators', user);
    },
  },
  save: task(function * (){
    yield timeout(10);
    const administrators = this.get('administrators');
    let session = this.get('session');
    session.setProperties({administrators});
    this.get('expand')();
    yield session.save();
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

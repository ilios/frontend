import Component from '@ember/component';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
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

  @action
  addAdministrator(user){
    this.add('administrators', user);
  },

  @action
  removeAdministrator(user){
    this.remove('administrators', user);
  },
  save: task(function * (){
    yield timeout(10);
    const administrators = this.get('administrators');
    const session = this.get('session');
    session.setProperties({administrators});
    this.get('expand')();
    yield session.save();
    this.get('setIsManaging')(false);
  }),
  add(where, user){
    const arr = this.get(where).toArray();
    arr.pushObject(user);
    this.set(where, arr);
  },
  remove(where, user){
    const arr = this.get(where).toArray();
    arr.removeObject(user);
    this.set(where, arr);
  },
});

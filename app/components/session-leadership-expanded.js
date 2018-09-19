import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  session: null,
  classNames: ['session-leadership-expanded'],
  administrators: null,
  isManaging: false,
  'data-test-session-leadership-expanded': true,
  didReceiveAttrs(){
    this._super(...arguments);
    const session = this.session;
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
    const administrators = this.administrators;
    let session = this.session;
    session.setProperties({administrators});
    this.expand();
    yield session.save();
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

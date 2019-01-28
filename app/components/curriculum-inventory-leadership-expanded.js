import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  report: null,
  classNames: ['curriculum-inventory-leadership-expanded'],
  administrators: null,
  isManaging: false,
  'data-test-curriculum-inventory-leadership-expanded': true,
  didReceiveAttrs(){
    this._super(...arguments);
    const report = this.report;
    if (report) {
      report.get('administrators').then(administrators => {
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
    let report = this.report;
    report.setProperties({administrators});
    this.expand();
    yield report.save();
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

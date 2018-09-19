/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
const { gt } = computed;

export default Component.extend({
  store: service(),
  currentUser: service(),
  init(){
    this._super(...arguments);
    this.set('sortSchoolsBy', ['title']);
  },
  'data-test-pending-updates-summary': true,
  classNameBindings: [':pending-updates-summary', ':small-component', 'alert'],
  alert: gt('_updatesProxy.length', 0),
  schoolId: null,
  schools: null,
  selectedSchool: computed('currentUser', 'schoolId', async function () {
    const schools = this.schools;
    const currentUser = this.currentUser;
    const schoolId = this.schoolId;

    if (schoolId) {
      return schools.findBy('id', schoolId);
    }
    const user = await currentUser.get('model');
    const school = await user.get('school');
    const defaultSchool = schools.findBy('id', school.get('id'));
    if (defaultSchool) {
      return defaultSchool;
    }

    return schools.get('firstObject');
  }),


  /**
   * Create a proxy object to drive the alerts CP.  This is hopefully a temporary
   * way to address this problem of needed the value of a promise to drive a computed property
   *
   * @todo We might be able to use https://github.com/kellyselden/ember-awesome-macros/pull/260 to get the Promise
   * results and use those in the alert CP.  JJ 3/2017
   *
   * @property updates
   * @type {Ember.computed}
   * @private
   */
  _updatesProxy: computed('updates', function(){
    let ArrayPromiseProxy = ArrayProxy.extend(PromiseProxyMixin);
    return ArrayPromiseProxy.create({
      promise: this.updates
    });
  }),

  /**
   * A list of pending user updates.
   * @property updates
   * @type {Ember.computed}
   * @public
   */
  updates: computed('selectedSchool', async function(){
    const store = this.store;
    const school = await this.selectedSchool;
    const updates = await store.query('pending-user-update', {
      filters: {
        schools: [school.get('id')]
      }
    });

    return updates;
  }),

  actions: {
    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
  }
});

/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import ArrayProxy from '@ember/array/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
const { Promise } = RSVP;
const { gt } = computed;

export default Component.extend({
  store: service(),
  currentUser: service(),
  init(){
    this._super(...arguments);
    this.set('sortSchoolsBy', ['title']);
  },
  classNameBindings: [':pending-updates-summary', ':small-component', 'alert'],
  alert: gt('_updatesProxy.length', 0),
  schoolId: null,

  /**
   * The currently selected school, defaults to the current-user's primary school if none is selected.
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
  schools: computed('currentUser.model.schools.[]', function(){
    return new Promise(resolve => {
      this.get('currentUser.model').then(user => {
        user.get('schools').then(schools => {
          resolve(schools);
        });
      });
    });
  }),
  selectedSchool: computed('currentUser', 'schoolId', function(){
    return new Promise(resolve => {
      this.get('currentUser').get('model').then(user => {
        user.get('schools').then(schools => {
          const schoolId = this.get('schoolId');
          if(isPresent(schoolId)){
            const school = schools.findBy('id', schoolId);
            if(school){
              resolve(school);
              return;
            }
          }
          user.get('school').then(school => {
            resolve(school);
          });
        });
      });
    });
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
      promise: this.get('updates')
    });
  }),

  /**
   * A list of pending user updates.
   * @property updates
   * @type {Ember.computed}
   * @public
   */
  updates: computed('selectedSchool', async function(){
    const store = this.get('store');
    const school = await this.get('selectedSchool');
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

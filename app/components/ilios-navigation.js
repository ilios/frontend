import Ember from 'ember';
import config from 'ilios/config/environment';

const { Component, inject, computed, RSVP } = Ember;
const { service } = inject;
const { Promise } = RSVP;

export default Component.extend({
  i18n: service(),
  currentUser: service(),
  isMenuVisible: false,
  ciEnabled: config.IliosFeatures.curriculumInventory,
  //untranslated temporary string
  beta: 'beta',
  permissions: computed('currentUser.model.roles.[]', function(){
    return new Promise(resolve => {
      this.get('currentUser.model').then(user => {
        user.get('roles').then(roles => {
          let ids = roles.mapBy('id');
          let permissions = {
            isFaculty: ids.contains('1')||ids.contains('2')||ids.contains('3'),
            isAdmin: ids.contains('2'),
          };
          resolve(permissions);
        });
      });
    });
  }),
  actions: {
    toggleMenuVisibility: function(){
      this.toggleProperty('isMenuVisible');
    }
  }
});

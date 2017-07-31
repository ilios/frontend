import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import config from 'ilios/config/environment';

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
            isFaculty: ids.includes('1')||ids.includes('2')||ids.includes('3'),
            isAdmin: ids.includes('2'),
          };
          resolve(permissions);
        });
      });
    });
  }),
  actions: {
    toggleMenuVisibility() {
      this.toggleProperty('isMenuVisible');
    }
  }
});

/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
const { reads } = computed;

export default Component.extend({
  user: null,
  isSaving: false,
  updates: reads('user.pendingUserUpdates'),
  classNames: ['pending-single-user-updates'],

  actions: {
    updateEmailAddress(update){
      this.set('isSaving', true);
      let user = this.user;
      user.set('email', update.get('value'));
      user.save().then(() => {
        update.deleteRecord();
        update.save().then(() => {
          this.set('isSaving', false);
          this.flashMessages.success('general.savedSuccessfully');
        });
      });
    },
    disableUser(){
      this.set('isSaving', true);
      let user = this.user;
      user.set('enabled', false);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          RSVP.all(updates.invoke('save')).then(() => {
            this.set('isSaving', false);
            this.flashMessages.success('general.savedSuccessfully');
          });
        });
      });

    },
    excludeFromSync(){
      this.set('isSaving', true);
      let user = this.user;
      user.set('userSyncIgnore', true);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          RSVP.all(updates.invoke('save')).then(() => {
            this.set('isSaving', false);
            this.flashMessages.success('general.savedSuccessfully');
          });
        });
      });
    }
  }
});

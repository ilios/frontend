import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { all } from 'rsvp';

export default Component.extend({
  classNames: ['pending-single-user-updates'],

  isSaving: false,
  user: null,

  updates: reads('user.pendingUserUpdates'),

  actions: {
    updateEmailAddress(update) {
      this.set('isSaving', true);
      const user = this.user;
      user.set('email', update.get('value'));
      user.save().then(() => {
        update.deleteRecord();
        update.save().then(() => {
          this.set('isSaving', false);
          this.flashMessages.success('general.savedSuccessfully');
        });
      });
    },

    disableUser() {
      this.set('isSaving', true);
      const user = this.user;
      user.set('enabled', false);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          all(updates.invoke('save')).then(() => {
            this.set('isSaving', false);
            this.flashMessages.success('general.savedSuccessfully');
          });
        });
      });
    },

    excludeFromSync() {
      this.set('isSaving', true);
      const user = this.user;
      user.set('userSyncIgnore', true);
      user.save().then(() => {
        user.get('pendingUserUpdates').then(updates => {
          updates.invoke('deleteRecord');
          all(updates.invoke('save')).then(() => {
            this.set('isSaving', false);
            this.flashMessages.success('general.savedSuccessfully');
          });
        });
      });
    }
  }
});

/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  instructorGroup: null,
  classNames: ['instructorgroup-details'],
  actions: {
    addUser(user) {
      let instructorGroup = this.get('instructorGroup');
      instructorGroup.get('users').addObject(user);
      user.get('instructorGroups').addObject(instructorGroup);
      instructorGroup.save();
    },
    removeUser(user) {
      let instructorGroup = this.get('instructorGroup');
      instructorGroup.get('users').removeObject(user);
      user.get('instructorGroups').removeObject(instructorGroup);
      instructorGroup.save();
    },
  }
});

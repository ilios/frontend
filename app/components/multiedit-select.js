import Component from '@ember/component';
import { observer, computed } from '@ember/object';

export default Component.extend({
  displayValueOverride: null,

  displayValue: computed('displayValueOverride', {
    get() {
      if (this.get('displayValueOverride')){
        return this.get('displayValueOverride');
      }
    }
  }).readOnly(),

  checked: false,

  checkAll: observer('includeAll', function() {
    this.set('checked', this.get('includeAll'));

    this.send('sendActionUp');
  }),

  actions: {
    toggleCheckBox() {
      this.set('checked', !this.get('checked'));

      this.send('sendActionUp');
    },

    sendActionUp() {
      const studentId = this.get('condition');

      if (this.get('checked')) {
        this.sendAction('addStudent', studentId);
      } else {
        this.sendAction('removeStudent', studentId);
      }
    }
  }
});

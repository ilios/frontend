import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import moment from 'moment';

export default Component.extend({
  classNames: ['recently-updated-display'],
  tagName: 'span',

  lastModified: null,

  recentlyUpdated: computed('lastModified', {
    get() {
      const lastModified = this.lastModified;
      if (isEmpty(lastModified)) {
        return false;
      }

      const lastModifiedDate = moment(lastModified);
      const today = moment();
      const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');
      return daysSinceLastUpdate < 6 ? true : false;
    }
  }).readOnly()
});

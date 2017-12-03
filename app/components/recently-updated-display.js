/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import moment from 'moment';

export default Component.extend({
  tagName: 'span',
  lastModified: null,

  classNames: ['recently-updated-display'],

  recentlyUpdated: computed('lastModified', {
    get() {
      const lastModified = this.get('lastModified');
      if (isEmpty(lastModified)) {
        return false;
      }

      const lastModifiedDate = moment(lastModified);
      const today = moment();
      const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');
      return daysSinceLastUpdate < 6 ? true : false;
    }
  }).readOnly(),
});

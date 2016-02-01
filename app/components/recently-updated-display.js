import Ember from 'ember';
import moment from 'moment';

const { Component, computed } = Ember;

export default Component.extend({
  tagName: 'span',

  classNames: ['recently-updated-display'],

  recentlyUpdated: computed('attrs.lastModified', {
    get() {
      const lastModifiedDate = moment(this.attrs.lastModified);
      const today = moment();
      const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');

      return daysSinceLastUpdate < 6 ? true : false;
    }
  }).readOnly(),
});

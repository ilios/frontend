import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['curriculum-inventory-verification-preview-table-4'],

  totalNumEventsPrimaryMethod: computed('data', function(){
    return this.data.reduce((value, row) => {
      return value + row['num_events_primary_method'];
    }, 0);
  }),

  totalNumEventsNonPrimaryMethod: computed('data', function(){
    return this.data.reduce((value, row) => {
      return value + row['num_events_non_primary_method'];
    }, 0);
  })
});

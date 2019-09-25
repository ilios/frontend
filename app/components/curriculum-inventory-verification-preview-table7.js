import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  'data-test-curriculum-inventory-verification-preview-table7': true,
  classNames: ['curriculum-inventory-verification-preview-table-7'],

  totalNumSummativeAssessments: computed('data', function(){
    return this.data.reduce((value, row) => {
      return value + row['num_summative_assessments'];
    }, 0);
  }),

  totalNumFormativeAssessments: computed('data', function(){
    return this.data.reduce((value, row) => {
      return value + row['num_formative_assessments'];
    }, 0);
  })
});

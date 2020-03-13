import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: "",

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

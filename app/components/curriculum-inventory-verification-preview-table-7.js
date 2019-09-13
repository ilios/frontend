import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  totalNumSummativeAssessments: computed('data', async function(){
    const data = await this.get('data');
    return data.reduce((value, row) => {
      return value + row['num_summative_assessments'];
    }, 0);
  }),

  totalNumFormativeAssessments: computed('data', async function(){
    const data = await this.get('data');
    return data.reduce((value, row) => {
      return value + row['num_formative_assessments'];
    }, 0);
  })
});

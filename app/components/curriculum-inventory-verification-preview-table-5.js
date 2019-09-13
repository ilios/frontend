import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  nonClerkships: computed('data.rows', 'data.methods', async function ()  {
    const data = await this.get('data');
    const methods = data.methods;
    return data.rows.map(row => {
      return {
        hasFormativeAssessments: row.has_formative_assessments ? 'Y' : '',
        hasNarrativeAssessments: row.has_narrative_assessments ? 'Y' : '',
        level: row.level,
        methods: methods.map(method => {
          return row.methods[method] ? 'X' : '';
        }),
        numExams: row.num_exams,
        title: row.title,
      };
    });
  }),
});

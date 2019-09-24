import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['curriculum-inventory-verification-preview-table-6'],

  clerkships: computed('data.rows', 'data.methods', function ()  {
    const methods = this.data.methods;
    return this.data.rows.map(row => {
      return {
        hasFormativeAssessments: row.has_formative_assessments ? 'Y' : '',
        hasNarrativeAssessments: row.has_narrative_assessments ? 'Y' : '',
        level: row.level,
        methods: methods.map(method => {
          return row.methods[method] ? 'X' : '';
        }),
        title: row.title,
      };
    });
  }),
});

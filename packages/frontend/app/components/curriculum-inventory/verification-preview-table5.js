import Component from '@glimmer/component';

export default class CurriculumInventoryVerificationPreviewTable5Component extends Component {
  get nonClerkships() {
    const methods = this.args.data.methods;
    return this.args.data.rows.map((row) => {
      return {
        hasFormativeAssessments: row.has_formative_assessments ? 'Y' : '',
        hasNarrativeAssessments: row.has_narrative_assessments ? 'Y' : '',
        methods: methods.map((method) => {
          return row.methods[method] ? 'X' : '';
        }),
        numExams: row.num_exams,
        title: row.title,
        startingLevel: row.starting_level,
        endingLevel: row.ending_level,
      };
    });
  }
}

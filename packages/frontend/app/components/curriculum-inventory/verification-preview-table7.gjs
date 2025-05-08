import Component from '@glimmer/component';

export default class CurriculumInventoryVerificationPreviewTable7Component extends Component {
  get totalNumSummativeAssessments() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_summative_assessments'];
    }, 0);
  }

  get totalNumFormativeAssessments() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_formative_assessments'];
    }, 0);
  }
}

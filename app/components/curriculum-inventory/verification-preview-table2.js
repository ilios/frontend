import Component from '@glimmer/component';

export default class CurriculumInventoryVerificationPreviewTable2Component extends Component {
  get methodTotals() {
    return this.args.data.methods.map((method) => {
      return (method.total / 60).toFixed(2);
    });
  }

  get nonClerkships() {
    const methods = this.args.data.methods;
    return this.args.data.rows.map((row) => {
      return {
        title: row.title,
        methods: methods.map((method) => {
          const minutes = row.instructional_methods[method.title];
          if (minutes) {
            return (minutes / 60).toFixed(2);
          }
          return '';
        }),
        total: (row.total / 60).toFixed(2),
        startingLevel: row.starting_level,
        endingLevel: row.ending_level,
      };
    });
  }

  get sumTotal() {
    const sumTotal = this.args.data.methods.reduce((value, method) => {
      return value + method.total;
    }, 0);
    return (sumTotal / 60).toFixed(2);
  }
}

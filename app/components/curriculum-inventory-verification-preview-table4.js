import Component from '@glimmer/component';

export default class CurriculumInventoryVerificationPreviewTable4Component extends Component {
  get totalNumEventsPrimaryMethod() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_events_primary_method'];
    }, 0);
  }

  get totalNumEventsNonPrimaryMethod() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_events_non_primary_method'];
    }, 0);
  }
}

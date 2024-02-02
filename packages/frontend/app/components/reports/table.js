import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ReportsListComponent extends Component {
  @tracked reportsForRemovalConfirmation = [];

  get sortedAscending() {
    return !this.args.sortBy.includes(':desc');
  }

  @action
  confirmRemoval(report) {
    this.reportsForRemovalConfirmation = [...this.reportsForRemovalConfirmation, report.id];
  }

  @action
  cancelRemove(report) {
    this.reportsForRemovalConfirmation = this.reportsForRemovalConfirmation.filter(
      (id) => id !== report.id,
    );
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
}

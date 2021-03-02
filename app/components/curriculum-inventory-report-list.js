import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CurriculumInventoryReportListComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service iliosConfig;

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  get sortBy() {
    return this.args.sortBy || 'name';
  }

  @action
  setSortBy(what) {
    if (this.sortBy === what){
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
}

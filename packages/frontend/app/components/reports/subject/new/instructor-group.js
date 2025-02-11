import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewInstructorGroupComponent extends Component {
  @service store;

  @cached
  get allInstructorGroupsData() {
    return new TrackedAsyncData(this.store.findAll('instructor-group'));
  }

  get allInstructorGroups() {
    return this.allInstructorGroupsData.isResolved ? this.allInstructorGroupsData.value : [];
  }

  get filteredInstructorGroups() {
    if (this.args.school) {
      return this.allInstructorGroups.filter(
        (c) => c.belongsTo('school').id() === this.args.school.id,
      );
    }

    return this.allInstructorGroups;
  }

  get sortedInstructorGroups() {
    return sortBy(this.filteredInstructorGroups, 'title');
  }

  get bestSelectedInstructorGroup() {
    const ids = this.sortedInstructorGroups.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return this.sortedInstructorGroups[0].id;
  }
}

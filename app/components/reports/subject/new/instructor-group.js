import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewInstructorGroupComponent extends Component {
  @service store;

  @cached
  get allInstructorGroups() {
    return new TrackedAsyncData(this.store.findAll('instructor-group'));
  }

  get isLoaded() {
    return this.allInstructorGroups.isResolved;
  }

  get filteredInstructorGroups() {
    if (this.args.school) {
      return this.allInstructorGroups.value.filter(
        (c) => c.belongsTo('school').id() === this.args.school.id
      );
    }

    return this.allInstructorGroups.value;
  }

  get sortedInstructorGroups() {
    return sortBy(this.filteredInstructorGroups, 'title');
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedInstructorGroups.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedInstructorGroups.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedInstructorGroups[0].id);
    }
  }
}

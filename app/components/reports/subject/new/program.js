import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewProgramComponent extends Component {
  @service store;

  @cached
  get allPrograms() {
    return new TrackedAsyncData(this.store.findAll('program'));
  }

  get isLoaded() {
    return this.allPrograms.isResolved;
  }

  get filteredPrograms() {
    if (this.args.school) {
      return this.allPrograms.value.filter(
        (c) => c.belongsTo('school').id() === this.args.school.id
      );
    }

    return this.allPrograms.value;
  }

  get sortedPrograms() {
    return sortBy(this.filteredPrograms, 'title');
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedPrograms.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedPrograms.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedPrograms[0].id);
    }
  }
}

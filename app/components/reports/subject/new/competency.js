import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewCompetencyComponent extends Component {
  @service store;

  @cached
  get allCompetencies() {
    return new TrackedAsyncData(this.store.findAll('competency'));
  }

  get isLoaded() {
    return this.allCompetencies.isResolved;
  }

  get filteredCompetencies() {
    if (this.args.school) {
      return this.allCompetencies.value.filter(
        (c) => c.belongsTo('school').id() === this.args.school.id,
      );
    }

    return this.allCompetencies.value;
  }

  get sortedCompetencies() {
    return sortBy(this.filteredCompetencies, 'title');
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedCompetencies.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedCompetencies.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedCompetencies[0].id);
    }
  }
}

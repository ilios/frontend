import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewCompetencyComponent extends Component {
  @service store;

  @cached
  get allCompetenciesData() {
    return new TrackedAsyncData(this.store.findAll('competency'));
  }

  get allCompetencies() {
    return this.allCompetenciesData.isResolved ? this.allCompetenciesData.value : [];
  }

  get filteredCompetencies() {
    if (this.args.school) {
      return this.allCompetencies.filter((c) => c.belongsTo('school').id() === this.args.school.id);
    }

    return this.allCompetencies;
  }

  get sortedCompetencies() {
    return sortBy(this.filteredCompetencies, 'title');
  }

  get bestSelectedCompetency() {
    const ids = this.sortedCompetencies.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return this.sortedCompetencies[0].id;
  }

  setInitialValue = task(async () => {
    await timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedCompetencies.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedCompetencies.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedCompetencies[0].id);
    }
  });
}

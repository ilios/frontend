import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewLearningMaterialComponent extends Component {
  @service store;

  @cached
  get allLearningMaterials() {
    return new TrackedAsyncData(this.store.findAll('learning-material'));
  }

  get isLoaded() {
    return this.allLearningMaterials.isResolved;
  }

  get filteredLearningMaterials() {
    if (this.args.school) {
      return this.allLearningMaterials.value.filter(
        (c) => c.belongsTo('school').id() === this.args.school.id,
      );
    }

    return this.allLearningMaterials.value;
  }

  get sortedLearningMaterials() {
    return sortBy(this.filteredLearningMaterials, 'title');
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedLearningMaterials.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedLearningMaterials.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedLearningMaterials[0].id);
    }
  }
}

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { guidFor } from '@ember/object/internals';

export default class ReportsSubjectNewLearningMaterialComponent extends Component {
  @service store;
  @tracked materials;

  get uniqueId() {
    return guidFor(this);
  }

  get loadMaterial() {
    return this.store.findRecord('learning-material', this.args.currentId);
  }

  get sortedMaterials() {
    if (!this.materials) {
      return [];
    }
    return sortBy(this.materials, 'title');
  }

  search = restartableTask(async (q) => {
    if (!q.length) {
      this.materials = false;
      return;
    }

    this.materials = await this.store.query('learning-material', {
      q,
    });
  });

  @action
  clear() {
    this.materials = false;
    this.args.changeId(null);
  }
}

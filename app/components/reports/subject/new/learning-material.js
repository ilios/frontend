import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { guidFor } from '@ember/object/internals';
import { cleanQuery } from 'ilios-common/utils/query-utils';

export default class ReportsSubjectNewLearningMaterialComponent extends Component {
  @service store;
  @tracked materials;

  get uniqueId() {
    return guidFor(this);
  }

  get sortedMaterials() {
    return sortBy(this.materials, 'title');
  }

  get q() {
    return cleanQuery(this.query);
  }

  @restartableTask
  *search() {
    if (!this.q.length) {
      this.materials = false;
      return;
    }

    this.materials = yield this.store.query('learning-material', {
      q: this.q,
    });
  }

  @action
  keyboard({ keyCode }) {
    //enter key
    if (keyCode === 13) {
      this.search.perform();
    }
  }
}

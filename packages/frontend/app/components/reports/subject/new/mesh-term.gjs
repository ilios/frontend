import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ReportsSubjectNewProgramComponent extends Component {
  @service store;

  @cached
  get selectedMeshTerm() {
    return new TrackedAsyncData(this.store.findRecord('mesh-descriptor', this.args.currentId));
  }

  @action
  chooseMeshTerm(term) {
    this.args.changeId(term.id);
  }
}

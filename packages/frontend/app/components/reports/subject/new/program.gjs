import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewProgramComponent extends Component {
  @service store;

  @cached
  get allProgramsData() {
    return new TrackedAsyncData(this.store.findAll('program'));
  }

  get allPrograms() {
    return this.allProgramsData.isResolved ? this.allProgramsData.value : [];
  }

  get filteredPrograms() {
    if (this.args.school) {
      return this.allPrograms.filter((c) => c.belongsTo('school').id() === this.args.school.id);
    }

    return this.allPrograms;
  }

  get sortedPrograms() {
    return sortBy(this.filteredPrograms, 'title');
  }

  get bestSelectedProgram() {
    const ids = this.sortedPrograms.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return null;
  }

  @action
  updatePrepositionalObjectId(event) {
    const value = event.target.value;
    this.args.changeId(value);

    if (!isNaN(value)) {
      event.target.classList.remove('error');
    }
  }
}

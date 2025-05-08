import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { task } from 'ember-concurrency';

export default class ProgramYearManagedCompetencyListItemComponent extends Component {
  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.domain.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : [];
  }

  addCompetencyToBuffer = task(async (competency) => {
    const children = await competency.children;
    this.args.addCompetencyToBuffer(competency, children);
  });

  removeCompetencyFromBuffer = task(async (competency) => {
    const children = await competency.children;
    this.args.removeCompetencyFromBuffer(competency, children);
  });
}

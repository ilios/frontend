import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolCompetenciesListItemPcrsComponent extends Component {
  save = dropTask(async () => {
    await this.args.save();
  });

  @cached
  get aamcPcrsesData() {
    return new TrackedAsyncData(this.args.competency.aamcPcrses);
  }

  get aamcPcrses() {
    return this.aamcPcrsesData.isResolved ? this.aamcPcrsesData.value : [];
  }
}

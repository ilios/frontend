import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class SchoolCompetenciesListItemPcrsComponent extends Component {
  save = dropTask(async () => {
    await this.args.save();
  });
}

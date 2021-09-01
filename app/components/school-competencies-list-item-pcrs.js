import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class SchoolCompetenciesListItemPcrsComponent extends Component {
  @dropTask
  *save() {
    yield this.args.save();
  }
}

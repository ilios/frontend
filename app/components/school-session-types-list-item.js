import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class SchoolSessionTypesListItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @dropTask
  *deleteSessionType() {
    yield this.args.sessionType.destroyRecord();
  }
}

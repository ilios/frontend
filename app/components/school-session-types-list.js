import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class SchoolSessionTypesListComponent extends Component {
  @tracked deletedSessionTypes = [];

  @dropTask
  *deleteSessionType(sessionType) {
    if (sessionType.get('sessionCount') === 0) {
      this.deletedSessionTypes = [...this.deletedSessionTypes, sessionType.id];
      yield timeout(10);
      sessionType.deleteRecord();
      yield sessionType.save();
      this.deletedSessionTypes = this.deletedSessionTypes.filter((id) => id !== sessionType.id);
    }
  }
}

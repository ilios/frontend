import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class SessionObjectiveListComponent extends Component {
  @tracked isSorting = false;

  @use course = new ResolveAsyncValue(() => [this.args.session.course]);
  @use courseObjectives = new ResolveAsyncValue(() => [this.course?.courseObjectives]);
  @use sessionObjectives = new ResolveAsyncValue(() => [this.args.session.sortedSessionObjectives]);

  get sessionObjectiveCount() {
    return this.sessionObjectives?.length ?? 0;
  }
}

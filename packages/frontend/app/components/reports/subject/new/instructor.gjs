import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ReportsSubjectNewInstructorComponent extends Component {
  @service store;

  @cached
  get selectedInstructor() {
    return new TrackedAsyncData(this.store.findRecord('user', this.args.currentId));
  }

  @action
  chooseInstructor(user) {
    this.args.changeId(user.id);
  }
}

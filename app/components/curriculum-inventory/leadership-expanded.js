import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryLeadershipExpandedComponent extends Component {
  @tracked administratorBuffer = [];

  @dropTask
  *manage() {
    this.administratorBuffer = (yield this.args.report.administrators).slice();
    this.args.setIsManaging(true);
  }

  @action
  addAdministrator(user) {
    this.administratorBuffer = [...this.administratorBuffer, user];
  }
  @action
  removeAdministrator(user) {
    this.administratorBuffer = this.administratorBuffer.filter(({ id }) => id !== user.id);
  }

  @dropTask
  *save() {
    yield timeout(10);
    this.args.report.set('administrators', this.administratorBuffer);
    this.args.expand();
    yield this.args.report.save();
    this.args.setIsManaging(false);
    this.administratorBuffer = [];
  }
}

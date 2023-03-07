import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryLeadershipExpandedComponent extends Component {
  @tracked administrators = [];

  @action
  addAdministrator(user) {
    this.administrators = [...this.administrators, user];
  }
  @action
  removeAdministrator(user) {
    this.administrators = this.administrators.filter(({ id }) => id !== user.id);
  }

  async setBuffers() {
    this.administrators = (await this.args.report.administrators).slice();
  }

  @action
  manage() {
    this.args.setIsManaging(true);
  }

  @dropTask
  *load() {
    yield this.setBuffers();
  }

  @dropTask
  *save() {
    yield timeout(10);
    this.args.report.set('administrators', this.administrators);
    this.args.expand();
    yield this.args.report.save();
    this.args.setIsManaging(false);
  }

  @dropTask
  *cancel() {
    yield this.setBuffers();
    this.args.setIsManaging(false);
  }
}

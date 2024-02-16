import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryLeadershipExpandedComponent extends Component {
  @tracked administrators = [];

  get count() {
    return this.administrators.length;
  }

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

  load = dropTask(async () => {
    await this.setBuffers();
  });

  save = dropTask(async () => {
    await timeout(10);
    this.args.report.set('administrators', this.administrators);
    this.args.expand();
    await this.args.report.save();
    this.args.setIsManaging(false);
  });

  cancel = dropTask(async () => {
    await this.setBuffers();
    this.args.setIsManaging(false);
  });
}

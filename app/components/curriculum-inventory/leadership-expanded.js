import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryLeadershipExpandedComponent extends Component {
  @tracked administratorBuffer = [];

  manage = dropTask(async () => {
    this.administratorBuffer = (await this.args.report.administrators).slice();
    this.args.setIsManaging(true);
  });

  @action
  addAdministrator(user) {
    this.administratorBuffer = [...this.administratorBuffer, user];
  }
  @action
  removeAdministrator(user) {
    this.administratorBuffer = this.administratorBuffer.filter(({ id }) => id !== user.id);
  }

  save = dropTask(async () => {
    await timeout(10);
    this.args.report.set('administrators', this.administratorBuffer);
    this.args.expand();
    await this.args.report.save();
    this.args.setIsManaging(false);
    this.administratorBuffer = [];
  });
}

import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CurriculumInventoryLeadershipExpandedComponent extends Component {
  @tracked administratorsToAdd = [];
  @tracked administratorsToRemove = [];

  @cached
  get count() {
    return this.administrators.length;
  }

  @cached
  get reportAdministrators() {
    return new TrackedAsyncData(this.args.report.administrators);
  }

  @cached
  get administrators() {
    const administrators = this.reportAdministrators.isResolved
      ? this.reportAdministrators.value.slice()
      : [];
    return [...administrators, ...this.administratorsToAdd].filter(
      (user) => !this.administratorsToRemove.includes(user),
    );
  }

  resetBuffers() {
    this.administratorsToAdd = [];
    this.administratorsToRemove = [];
  }

  @action
  addAdministrator(user) {
    this.administratorsToAdd = [...this.administratorsToAdd, user];
    this.administratorsToRemove = this.administratorsToRemove.filter((d) => d !== user);
  }

  @action
  removeAdministrator(user) {
    this.administratorsToRemove = [...this.administratorsToRemove, user];
    this.administratorsToAdd = this.administratorsToAdd.filter((d) => d !== user);
  }

  @action
  close() {
    this.resetBuffers();
    this.args.setIsManaging(false);
  }

  save = dropTask(async () => {
    this.args.report.set('administrators', this.administrators);
    this.args.expand();
    this.resetBuffers();
    await this.args.report.save();
    this.args.setIsManaging(false);
  });
}

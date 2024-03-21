import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SchoolLeadershipExpandedComponent extends Component {
  @tracked directorsToAdd = [];
  @tracked directorsToRemove = [];
  @tracked administratorsToAdd = [];
  @tracked administratorsToRemove = [];

  get count() {
    return this.administrators.length + this.directors.length;
  }

  @cached
  get schoolDirectors() {
    return new TrackedAsyncData(this.args.school.directors);
  }

  @cached
  get schoolAdministrators() {
    return new TrackedAsyncData(this.args.school.administrators);
  }

  @cached
  get directors() {
    const directors = this.schoolDirectors.isResolved ? this.schoolDirectors.value.slice() : [];
    return [...directors, ...this.directorsToAdd].filter(
      (user) => !this.directorsToRemove.includes(user),
    );
  }

  @cached
  get administrators() {
    const administrators = this.schoolAdministrators.isResolved
      ? this.schoolAdministrators.value.slice()
      : [];
    return [...administrators, ...this.administratorsToAdd].filter(
      (user) => !this.administratorsToRemove.includes(user),
    );
  }

  resetBuffers() {
    this.directorsToAdd = [];
    this.directorsToRemove = [];
    this.administratorsToAdd = [];
    this.administratorsToRemove = [];
  }

  @action
  addDirector(user) {
    this.directorsToAdd = [...this.directorsToAdd, user];
    this.directorsToRemove = this.directorsToRemove.filter((u) => u !== user);
  }

  @action
  removeDirector(user) {
    this.directorsToRemove = [...this.directorsToRemove, user];
    this.directorsToAdd = this.directorsToAdd.filter((u) => u !== user);
  }

  @action
  addAdministrator(user) {
    this.administratorsToAdd = [...this.administratorsToAdd, user];
    this.administratorsToRemove = this.administratorsToRemove.filter((u) => u !== user);
  }

  @action
  removeAdministrator(user) {
    this.administratorsToRemove = [...this.administratorsToRemove, user];
    this.administratorsToAdd = this.administratorsToAdd.filter((u) => u !== user);
  }

  @action
  close() {
    this.resetBuffers();
    this.args.setIsManaging(false);
  }

  save = dropTask(async () => {
    await timeout(10);
    this.args.school.setProperties({
      directors: this.directors,
      administrators: this.administrators,
    });
    this.args.expand();
    this.resetBuffers();
    await this.args.school.save();
    this.args.setIsManaging(false);
  });
}

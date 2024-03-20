import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ProgramYearLeadershipExpandedComponent extends Component {
  @tracked directorsToAdd = [];
  @tracked directorsToRemove = [];

  @cached
  get count() {
    return this.directors.length;
  }

  @cached
  get programYearDirectors() {
    return new TrackedAsyncData(this.args.programYear.directors);
  }

  @cached
  get directors() {
    const directors = this.programYearDirectors.isResolved
      ? this.programYearDirectors.value.slice()
      : [];
    return [...directors, ...this.directorsToAdd].filter(
      (user) => !this.directorsToRemove.includes(user),
    );
  }

  resetBuffers() {
    this.directorsToAdd = [];
    this.directorsToRemove = [];
  }

  @action
  addDirector(user) {
    this.directorsToAdd = [...this.directorsToAdd, user];
    this.directorsToRemove = this.directorsToRemove.filter((d) => d !== user);
  }

  @action
  removeDirector(user) {
    this.directorsToRemove = [...this.directorsToRemove, user];
    this.directorsToAdd = this.directorsToAdd.filter((d) => d !== user);
  }

  @action
  close() {
    this.resetBuffers();
    this.args.setIsManaging(false);
  }

  save = dropTask(async () => {
    this.args.programYear.set('directors', this.directors);
    this.args.expand();
    this.resetBuffers();
    await this.args.programYear.save();
    this.args.setIsManaging(false);
  });
}

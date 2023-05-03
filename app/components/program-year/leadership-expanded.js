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
  get programYearDirectorsData() {
    return new TrackedAsyncData(this.args.programYear.directors);
  }

  get programYearDirectors() {
    return this.programYearDirectorsData.isResolved ? this.programYearDirectorsData.value : null;
  }

  get directors() {
    const directors = this.programYearDirectors?.slice() || [];
    return [...directors, ...this.directorsToAdd].filter(
      (user) => !this.directorsToRemove.includes(user)
    );
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
    this.directorsToAdd = [];
    this.directorsToRemove = [];
    this.args.setIsManaging(false);
  }
  @dropTask
  *save() {
    this.args.programYear.set('directors', this.directors);
    this.args.expand();
    yield this.args.programYear.save();
    this.close();
  }
}

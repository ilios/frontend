import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';

export default class ProgramYearLeadershipExpandedComponent extends Component {
  @tracked directorsToAdd = [];
  @tracked directorsToRemove = [];
  @use programYearDirectors = new ResolveAsyncValue(() => [this.args.programYear.directors]);

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

  save = dropTask(async () => {
    this.args.programYear.set('directors', this.directors);
    this.args.expand();
    await this.args.programYear.save();
    this.close();
  });
}

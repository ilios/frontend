import Component from '@glimmer/component';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

export default class SchoolLeadershipExpandedComponent extends Component {
  @tracked directorsToAdd = [];
  @tracked directorsToRemove = [];
  @tracked administratorsToAdd = [];
  @tracked administratorsToRemove = [];
  @tracked schoolDirectors = [];
  @tracked schoolAdministrators = [];
  get isCollapsible() {
    const administratorIds = this.args.school.hasMany('administrators').ids();
    const directorIds = this.args.school.hasMany('directors').ids();

    return (administratorIds.length > 0 || directorIds.length > 0) && !this.args.isManaging;
  }

  @restartableTask
  *load() {
    this.schoolDirectors = yield this.args.school.directors;
    this.schoolAdministrators = yield this.args.school.administrators;
  }

  get directors() {
    const arr = [...this.schoolDirectors.slice(), ...this.directorsToAdd];
    return uniqueValues(arr.filter((user) => !this.directorsToRemove.includes(user)));
  }

  get administrators() {
    const arr = [...this.schoolAdministrators.slice(), ...this.administratorsToAdd];
    return uniqueValues(arr.filter((user) => !this.administratorsToRemove.includes(user)));
  }
  @action
  addDirector(user) {
    this.directorsToRemove = this.directorsToRemove.filter((u) => u !== user);
    this.directorsToAdd = [...this.directorsToAdd, user];
  }
  @action
  removeDirector(user) {
    this.directorsToAdd = this.directorsToAdd.filter((u) => u !== user);
    this.directorsToRemove = [...this.directorsToRemove, user];
  }
  @action
  addAdministrator(user) {
    this.administratorsToRemove = this.administratorsToRemove.filter((u) => u !== user);
    this.administratorsToAdd = [...this.administratorsToAdd, user];
  }
  @action
  removeAdministrator(user) {
    this.administratorsToAdd = this.administratorsToAdd.filter((u) => u !== user);
    this.administratorsToRemove = [...this.administratorsToRemove, user];
  }

  @dropTask
  *save() {
    yield timeout(10);
    this.args.school.setProperties({
      directors: this.directors,
      administrators: this.administrators,
    });
    this.args.expand();
    yield this.args.school.save();
    this.args.setIsManaging(false);
  }
}

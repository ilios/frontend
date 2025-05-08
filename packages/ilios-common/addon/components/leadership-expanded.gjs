import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';

export default class LeadershipExpandedComponent extends Component {
  @tracked directorsToAdd = [];
  @tracked directorsToRemove = [];
  @tracked administratorsToAdd = [];
  @tracked administratorsToRemove = [];
  @tracked studentAdvisorsToAdd = [];
  @tracked studentAdvisorsToRemove = [];

  get count() {
    return this.directors.length + this.administrators.length + this.studentAdvisors.length;
  }

  @cached
  get modelHasDirectors() {
    return 'directors' in this.args.model;
  }

  @cached
  get modelHasAdministrators() {
    return 'administrators' in this.args.model;
  }

  @cached
  get modelHasStudentAdvisors() {
    return 'studentAdvisors' in this.args.model;
  }

  @cached
  get modelDirectors() {
    if (this.modelHasDirectors) {
      return new TrackedAsyncData(this.args.model.directors);
    }
    return null;
  }

  @cached
  get modelAdministrators() {
    if (this.modelHasAdministrators) {
      return new TrackedAsyncData(this.args.model.administrators);
    }
    return null;
  }

  @cached
  get modelStudentAdvisors() {
    if (this.modelHasStudentAdvisors) {
      return new TrackedAsyncData(this.args.model.studentAdvisors);
    }
    return null;
  }

  get directors() {
    if (!this.modelHasDirectors) {
      return [];
    }
    const directors = this.modelDirectors.isResolved ? this.modelDirectors.value : [];
    return [...directors, ...this.directorsToAdd].filter(
      (user) => !this.directorsToRemove.includes(user),
    );
  }

  @cached
  get administrators() {
    if (!this.modelHasAdministrators) {
      return [];
    }
    const administrators = this.modelAdministrators.isResolved
      ? this.modelAdministrators.value
      : [];
    return [...administrators, ...this.administratorsToAdd].filter(
      (user) => !this.administratorsToRemove.includes(user),
    );
  }

  @cached
  get studentAdvisors() {
    if (!this.modelHasStudentAdvisors) {
      return [];
    }
    const studentAdvisors = this.modelStudentAdvisors.isResolved
      ? this.modelStudentAdvisors.value
      : [];
    return [...studentAdvisors, ...this.studentAdvisorsToAdd].filter(
      (user) => !this.studentAdvisorsToRemove.includes(user),
    );
  }

  resetBuffers() {
    this.directorsToAdd = [];
    this.directorsToRemove = [];
    this.administratorsToAdd = [];
    this.administratorsToRemove = [];
    this.studentAdvisorsToAdd = [];
    this.studentAdvisorsToRemove = [];
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
  addStudentAdvisor(user) {
    this.studentAdvisorsToAdd = [...this.studentAdvisorsToAdd, user];
    this.studentAdvisorsToRemove = this.studentAdvisorsToRemove.filter((u) => u !== user);
  }

  @action
  removeStudentAdvisor(user) {
    this.studentAdvisorsToRemove = [...this.studentAdvisorsToRemove, user];
    this.studentAdvisorsToAdd = this.studentAdvisorsToAdd.filter((u) => u !== user);
  }

  @action
  close() {
    this.resetBuffers();
    this.args.setIsManaging(false);
  }

  save = dropTask(async () => {
    await timeout(10);
    const props = {};
    if (this.modelHasAdministrators) {
      props.administrators = this.administrators;
    }
    if (this.modelHasDirectors) {
      props.directors = this.directors;
    }
    if (this.modelHasStudentAdvisors) {
      props.studentAdvisors = this.studentAdvisors;
    }

    this.args.model.setProperties(props);
    this.args.expand();
    this.resetBuffers();
    await this.args.model.save();
    this.args.setIsManaging(false);
  });
}

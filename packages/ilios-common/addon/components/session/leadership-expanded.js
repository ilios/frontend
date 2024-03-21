import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CourseLeadershipExpandedComponent extends Component {
  @tracked administratorsToAdd = [];
  @tracked administratorsToRemove = [];
  @tracked studentAdvisorsToAdd = [];
  @tracked studentAdvisorsToRemove = [];

  get count() {
    return this.administrators.length + this.studentAdvisors.length;
  }

  @cached
  get courseAdministrators() {
    return new TrackedAsyncData(this.args.session.administrators);
  }

  @cached
  get courseStudentAdvisors() {
    return new TrackedAsyncData(this.args.session.studentAdvisors);
  }

  @cached
  get administrators() {
    const administrators = this.courseAdministrators.isResolved
      ? this.courseAdministrators.value.slice()
      : [];
    return [...administrators, ...this.administratorsToAdd].filter(
      (user) => !this.administratorsToRemove.includes(user),
    );
  }

  @cached
  get studentAdvisors() {
    const studentAdvisors = this.courseStudentAdvisors.isResolved
      ? this.courseStudentAdvisors.value.slice()
      : [];
    return [...studentAdvisors, ...this.studentAdvisorsToAdd].filter(
      (user) => !this.studentAdvisorsToRemove.includes(user),
    );
  }

  resetBuffers() {
    this.administratorsToAdd = [];
    this.administratorsToRemove = [];
    this.studentAdvisorsToAdd = [];
    this.studentAdvisorsToRemove = [];
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
    this.args.session.setProperties({
      administrators: this.administrators,
      studentAdvisors: this.studentAdvisors,
    });
    this.args.expand();
    this.resetBuffers();
    await this.args.session.save();
    this.args.setIsManaging(false);
  });
}

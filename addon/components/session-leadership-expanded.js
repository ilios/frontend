import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { hash } from 'rsvp';

export default class CourseLeadershipExpandedComponent extends Component {
  @tracked administrators = [];
  @tracked studentAdvisors = [];

  @action
  addAdministrator(user) {
    this.administrators = [...this.administrators, user];
  }

  @action
  removeAdministrator(user) {
    this.administrators = this.administrators.filter((obj) => obj !== user);
  }

  @action
  addStudentAdvisor(user) {
    this.studentAdvisors = [...this.studentAdvisors, user];
  }

  @action
  removeStudentAdvisor(user) {
    this.studentAdvisors = this.studentAdvisors.filter((obj) => obj !== user);
  }

  @action
  manage() {
    this.args.setIsManaging(true);
  }

  async setBuffers() {
    const obj = await hash({
      administrators: this.args.session.administrators,
      studentAdvisors: this.args.session.studentAdvisors,
    });
    this.administrators = obj.administrators.slice();
    this.studentAdvisors = obj.studentAdvisors.slice();
  }

  load = dropTask(async () => {
    await this.setBuffers();
  });

  save = dropTask(async () => {
    await timeout(10);
    this.args.session.setProperties({
      administrators: this.administrators,
      studentAdvisors: this.studentAdvisors,
    });
    this.args.expand();
    await this.args.session.save();
    this.args.setIsManaging(false);
  });

  cancel = dropTask(async () => {
    await this.setBuffers();
    this.args.setIsManaging(false);
  });
}

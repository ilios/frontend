import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import { dropTask } from 'ember-concurrency-decorators';
import { hash } from 'rsvp';

export default class CourseLeadershipExpandedComponent extends Component {
  @tracked administrators = [];
  @tracked studentAdvisors = [];
  get isCollapsible() {
    const administratorIds = this.args.session.hasMany('administrators').ids();
    const studentAdvisorIds = this.args.session
      .hasMany('studentAdvisors')
      .ids();

    return (
      (administratorIds.length > 0 || studentAdvisorIds.length > 0) &&
      !this.args.isManaging
    );
  }
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
  @dropTask
  *manage() {
    const obj = yield hash({
      administrators: this.args.session.administrators,
      studentAdvisors: this.args.session.studentAdvisors,
    });
    this.administrators = obj.administrators.toArray();
    this.studentAdvisors = obj.studentAdvisors.toArray();
    this.args.setIsManaging(true);
  }
  @dropTask
  *save() {
    yield timeout(10);
    this.args.session.setProperties({
      administrators: this.administrators,
      studentAdvisors: this.studentAdvisors,
    });
    this.args.expand();
    yield this.args.session.save();
    this.args.setIsManaging(false);
  }
}

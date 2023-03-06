import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { hash } from 'rsvp';

export default class CourseLeadershipExpandedComponent extends Component {
  @tracked directors = [];
  @tracked administrators = [];
  @tracked studentAdvisors = [];

  @action
  addDirector(user) {
    this.directors = [...this.directors, user];
  }
  @action
  removeDirector(user) {
    this.directors = this.directors.filter((obj) => obj !== user);
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

  async setBuffers() {
    const obj = await hash({
      administrators: this.args.course.administrators,
      directors: this.args.course.directors,
      studentAdvisors: this.args.course.studentAdvisors,
    });
    this.administrators = obj.administrators.slice();
    this.directors = obj.directors.slice();
    this.studentAdvisors = obj.studentAdvisors.slice();
  }

  load = dropTask(async () => {
    await this.setBuffers();
  });

  manage = dropTask(async () => {
    this.args.setIsManaging(true);
  });

  save = dropTask(async () => {
    await timeout(10);
    this.args.course.setProperties({
      directors: this.directors,
      administrators: this.administrators,
      studentAdvisors: this.studentAdvisors,
    });
    this.args.expand();
    await this.args.course.save();
    this.args.setIsManaging(false);
  });

  cancel = dropTask(async () => {
    await this.setBuffers();
    this.args.setIsManaging(false);
  });
}

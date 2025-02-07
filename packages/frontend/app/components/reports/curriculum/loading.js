import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class ReportsCurriculumLoading extends Component {
  @service router;
  @service intl;
  @service store;
  @service currentUser;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get allSchools() {
    return this.store.peekAll('school');
  }

  get primarySchool() {
    return this.allSchools.find(({ id }) => id === this.user?.belongsTo('school').id());
  }

  get queryParams() {
    return this.router.currentRoute.queryParams;
  }

  get guessCourses() {
    return this.queryParams?.courses?.split('-').length;
  }

  get selectedReportValue() {
    return this.queryParams?.report ?? 'sessionObjectives';
  }
}

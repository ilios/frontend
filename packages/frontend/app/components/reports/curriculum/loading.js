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

  reportList = [
    { value: 'sessionObjectives', label: this.intl.t('general.sessionObjectives') },
    { value: 'learnerGroups', label: this.intl.t('general.learnerGroups') },
  ];

  get queryParams() {
    return this.router.currentRoute.queryParams;
  }

  get guessCourses() {
    return this.queryParams?.courses?.split('-').length;
  }

  get reportLabel() {
    if (this.queryParams?.report) {
      return this.reportList.find(({ value }) => value === this.queryParams.report).label;
    }

    return this.reportList[0].label;
  }
}

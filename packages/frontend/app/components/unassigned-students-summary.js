import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class UnassignedStudentsSummaryComponent extends Component {
  @service currentUser;
  @service store;

  @tracked schoolId;

  @cached
  get userModelData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

  get currentUserModel() {
    return this.userModelData.isResolved ? this.userModelData.value : null;
  }

  @cached
  get userSchoolData() {
    return new TrackedAsyncData(this.currentUserModel?.school);
  }
  get userSchool() {
    return this.userSchoolData.isResolved ? this.userSchoolData.value : null;
  }

  get selectedSchool() {
    if (this.schoolId) {
      return findById(this.args.schools, this.schoolId);
    }
    return this.userSchool;
  }

  @cached
  get unassignedStudentsData() {
    return new TrackedAsyncData(
      this.store.query('user', {
        filters: {
          cohorts: null,
          enabled: true,
          roles: [4],
          school: this.selectedSchool.id,
        },
      }),
    );
  }

  get unassignedStudents() {
    return this.unassignedStudentsData.isResolved ? this.unassignedStudentsData.value : [];
  }

  get hasUnassignedStudents() {
    return this.isLoaded && this.unassignedStudents?.length > 0;
  }

  get isLoaded() {
    return (
      this.userModelData.isResolved &&
      this.userSchoolData.isResolved &&
      this.unassignedStudentsData.isResolved
    );
  }
}

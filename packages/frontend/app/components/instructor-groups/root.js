import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

export default class InstructorGroupsRootComponent extends Component {
  @service currentUser;
  @service store;
  @service dataLoader;
  @service permissionChecker;
  @tracked showNewInstructorGroupForm = false;
  @tracked newInstructorGroup;
  @tracked instructorGroupPromises = new Map();
  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.bestSelectedSchool
        ? this.permissionChecker.canCreateInstructorGroup(this.bestSelectedSchool)
        : false,
    );
  }

  @cached
  get loadedSchoolData() {
    return new TrackedAsyncData(this.getSchoolPromise(this.bestSelectedSchool.id));
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  get loadedSchool() {
    return this.loadedSchoolData.isResolved ? this.loadedSchoolData.value : null;
  }

  @cached
  get instructorGroupsData() {
    return new TrackedAsyncData(this.bestSelectedSchool.instructorGroups);
  }

  get instructorGroups() {
    return this.instructorGroupsData.isResolved ? this.instructorGroupsData.value : [];
  }

  get isLoaded() {
    return Boolean(this.loadedSchool);
  }

  get countForSelectedSchool() {
    return this.bestSelectedSchool.hasMany('instructorGroups').ids().length;
  }

  async getSchoolPromise(schoolId) {
    if (!this.instructorGroupPromises.has(schoolId)) {
      this.instructorGroupPromises.set(
        schoolId,
        Promise.all([
          this.dataLoader.loadInstructorGroupsForSchool(schoolId),
          this.store.query('instructor-group', {
            include: 'offerings.session.course,ilmSessions.session.course',
            filters: {
              school: schoolId,
            },
          }),
        ]),
      );
    }
    const arr = await this.instructorGroupPromises.get(schoolId);
    return arr[1];
  }

  get bestSelectedSchool() {
    if (this.args.schoolId) {
      return findById(this.args.schools, this.args.schoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? findById(this.args.schools, schoolId) : this.args.schools[0];
  }

  get filteredInstructorGroups() {
    if (!this.args.titleFilter) {
      return this.instructorGroups;
    }
    const filter = this.args.titleFilter.trim().toLowerCase();
    return this.instructorGroups.filter((instructorGroup) => {
      return instructorGroup.title && instructorGroup.title.trim().toLowerCase().includes(filter);
    });
  }

  saveNewInstructorGroup = dropTask(async (newInstructorGroup) => {
    newInstructorGroup.set('school', this.bestSelectedSchool);
    this.newInstructorGroup = await newInstructorGroup.save();
    this.showNewInstructorGroupForm = false;
  });
}

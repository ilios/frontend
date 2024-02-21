import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import PermissionChecker from 'ilios-common/classes/permission-checker';
import { dropTask } from 'ember-concurrency';

export default class InstructorGroupsRootComponent extends Component {
  @service currentUser;
  @service store;
  @service dataLoader;
  @tracked showNewInstructorGroupForm = false;
  @tracked newInstructorGroup;
  @tracked instructorGroupPromises = new Map();
  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @use canCreate = new PermissionChecker(() => [
    'canCreateInstructorGroup',
    this.bestSelectedSchool,
  ]);

  @cached
  get loadedSchoolData() {
    return new TrackedAsyncData(this.getSchoolPromise(this.bestSelectedSchool.id));
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
      return findById(this.args.schools.slice(), this.args.schoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? findById(this.args.schools.slice(), schoolId) : this.args.schools.slice()[0];
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

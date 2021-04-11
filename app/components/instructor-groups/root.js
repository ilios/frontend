import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';
import { dropTask } from 'ember-concurrency';

export default class InstructorGroupsRootComponent extends Component {
  @service currentUser;
  @service store;
  @tracked showNewInstructorGroupForm = false;
  @tracked newInstructorGroup;
  @tracked instructorGroupPromises = new Map();

  @use user = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use canCreate = new PermissionChecker(() => [
    'canCreateInstructorGroup',
    this.bestSelectedSchool,
  ]);
  @use loadedSchools = new ResolveAsyncValue(() => [
    this.getSchoolPromise(this.bestSelectedSchool.id),
  ]);
  @use instructorGroups = new ResolveAsyncValue(() => [
    this.bestSelectedSchool.instructorGroups,
    [],
  ]);

  get isLoaded() {
    return Boolean(this.loadedSchools);
  }

  get countForSelectedSchool() {
    return this.bestSelectedSchool.hasMany('instructorGroups').ids().length;
  }

  getSchoolPromise(schoolId) {
    if (!this.instructorGroupPromises.has(schoolId)) {
      this.instructorGroupPromises.set(
        schoolId,
        this.store.query('instructor-group', {
          include: 'offerings.session.course,ilmSessions.session.course,users',
          filters: {
            school: schoolId,
          },
        })
      );
    }

    return this.instructorGroupPromises.get(schoolId);
  }

  get bestSelectedSchool() {
    if (this.args.schoolId) {
      return this.args.schools.findBy('id', this.args.schoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? this.args.schools.findBy('id', schoolId) : this.args.schools.firstObject;
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

  @dropTask
  *saveNewInstructorGroup(newInstructorGroup) {
    newInstructorGroup.set('school', this.bestSelectedSchool);
    this.newInstructorGroup = yield newInstructorGroup.save();
    this.showNewInstructorGroupForm = false;
  }
}

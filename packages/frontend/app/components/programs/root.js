import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import PermissionChecker from 'ilios-common/classes/permission-checker';
import { findById } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

export default class ProgramRootComponent extends Component {
  @service currentUser;
  @tracked selectedSchoolId;
  @tracked showNewProgramForm = false;
  @tracked newProgram;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @use canCreate = new PermissionChecker(() => ['canCreateProgram', this.bestSelectedSchool]);

  @cached
  get programsData() {
    return new TrackedAsyncData(this.bestSelectedSchool.programs);
  }

  get programs() {
    return this.programsData.isResolved ? this.programsData.value : [];
  }

  get bestSelectedSchool() {
    if (this.selectedSchoolId) {
      return findById(this.args.schools.slice(), this.selectedSchoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? findById(this.args.schools.slice(), schoolId) : this.args.schools.slice()[0];
  }

  saveNewProgram = dropTask(async newProgram => {
    newProgram.set('school', this.bestSelectedSchool);
    newProgram.set('duration', 4);
    this.newProgram = await newProgram.save();
    this.showNewProgramForm = false;
  });
}

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

export default class ProgramRootComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @tracked showNewProgramForm = false;
  @tracked newProgram;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.bestSelectedSchool
        ? this.permissionChecker.canCreateProgram(this.bestSelectedSchool)
        : false,
    );
  }

  @cached
  get programsData() {
    return new TrackedAsyncData(this.bestSelectedSchool.programs);
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  get programs() {
    return this.programsData.isResolved ? this.programsData.value : [];
  }

  get bestSelectedSchool() {
    if (this.args.schoolId) {
      return findById(this.args.schools, this.args.schoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? findById(this.args.schools, schoolId) : this.args.schools[0];
  }

  saveNewProgram = dropTask(async (newProgram) => {
    newProgram.set('school', this.bestSelectedSchool);
    newProgram.set('duration', 4);
    this.newProgram = await newProgram.save();
    this.showNewProgramForm = false;
  });
}

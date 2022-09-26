import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';
import { findById } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

export default class ProgramRootComponent extends Component {
  @service currentUser;
  @tracked selectedSchoolId;
  @tracked showNewProgramForm = false;
  @tracked newProgram;

  @use user = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use canCreate = new PermissionChecker(() => ['canCreateProgram', this.bestSelectedSchool]);
  @use programs = new ResolveAsyncValue(() => [this.bestSelectedSchool.programs, []]);

  get bestSelectedSchool() {
    if (this.selectedSchoolId) {
      return findById(this.args.schools.slice(), this.selectedSchoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? findById(this.args.schools.slice(), schoolId) : this.args.schools.slice()[0];
  }

  saveNewProgram = dropTask(async (newProgram) => {
    newProgram.set('school', this.bestSelectedSchool);
    newProgram.set('duration', 4);
    this.newProgram = await newProgram.save();
    this.showNewProgramForm = false;
  });
}

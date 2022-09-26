import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { findById } from 'ilios-common/utils/array-helpers';

export default class UnassignedStudentsSummaryComponent extends Component {
  @service currentUser;
  @service store;

  @tracked schoolId;
  @tracked selectedSchool;
  @tracked unassignedStudents;

  get hasUnassignedStudents() {
    return this.unassignedStudents?.length > 0;
  }

  load = restartableTask(async (element, [schoolId]) => {
    if (schoolId) {
      this.selectedSchool = findById(this.args.schools.slice(), schoolId);
    } else {
      const user = await this.currentUser.getModel();
      this.selectedSchool = await user.school;
    }
    this.unassignedStudents = await this.store.query('user', {
      filters: {
        cohorts: null,
        enabled: true,
        roles: [4],
        school: this.selectedSchool.id,
      },
    });
  });
}

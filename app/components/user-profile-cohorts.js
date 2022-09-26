import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask, timeout, waitForProperty } from 'ember-concurrency';
import { action } from '@ember/object';
import { filter, map } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';

export default class UserProfileCohortsComponent extends Component {
  @service currentUser;
  @service permissionChecker;

  @service store;

  @tracked hasSavedRecently = false;
  @tracked primaryCohort;
  @tracked schools = [];
  @tracked allCohortsWithRelationships = [];
  @tracked selectedCohorts = [];
  @tracked selectedSchoolId;

  get selectedSchool() {
    return findById(this.schools, this.selectedSchoolId);
  }

  get assignableCohorts() {
    return this.allCohortsWithRelationships.filter(
      (obj) => !this.selectedCohorts.includes(obj.cohort)
    );
  }

  get assignableCohortsForSelectedSchool() {
    return this.assignableCohorts.filter((obj) => {
      return obj.school.id === this.selectedSchoolId;
    });
  }

  get secondaryCohorts() {
    if (!this.primaryCohort) {
      return this.selectedCohorts;
    }

    return this.selectedCohorts.filter((cohort) => {
      return cohort.id != this.primaryCohort.id;
    });
  }

  @action
  addSelectedCohort(cohort) {
    this.selectedCohorts = [...this.selectedCohorts, cohort];
  }
  @action
  removeSelectedCohort(cohort) {
    this.selectedCohorts = this.selectedCohorts.filter(({ id }) => id !== cohort.id);
  }

  load = restartableTask(async (element, [user]) => {
    await waitForProperty(user, 'isLoaded'); //wait for promise to resolve because save() task modifies this relationship
    this.selectedCohorts = (await user.cohorts).slice();
    this.primaryCohort = await user.primaryCohort;

    const sessionUser = await this.currentUser.getModel();
    this.selectedSchoolId = (await sessionUser.school).id;

    const allCohorts = (await this.store.findAll('cohort')).slice();
    this.allCohortsWithRelationships = await map(allCohorts, async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;

      return {
        cohort,
        programYear,
        program,
        school,
      };
    });
    const allSchools = (await this.store.findAll('school')).slice();
    this.schools = await filter(allSchools, async (school) => {
      return this.permissionChecker.canUpdateUserInSchool(school);
    });
  });

  save = dropTask(async () => {
    await waitForProperty(this, 'load.performCount');
    this.args.user.set('primaryCohort', this.primaryCohort);
    this.args.user.set('cohorts', this.selectedCohorts);

    await this.args.user.save();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
  });
}

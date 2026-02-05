import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import or from 'ember-truth-helpers/helpers/or';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { fn } from '@ember/helper';
import UserProfileCohortsManager from 'frontend/components/user-profile-cohorts-manager';
import set from 'ember-set-helper/helpers/set';
import UserProfileCohortsDetails from 'frontend/components/user-profile-cohorts-details';
import {
  faArrowRotateLeft,
  faPenToSquare,
  faCheck,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export default class UserProfileCohortsComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @service store;

  @tracked hasSavedRecently = false;
  @tracked newPrimaryCohort = false;
  @tracked cohortsToAdd = [];
  @tracked cohortsToRemove = [];
  @tracked selectedSchool = null;

  @cached
  get allSchoolsData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  @cached
  get schoolPermissionsData() {
    return new TrackedAsyncData(
      Promise.all(
        this.allSchoolsData.value.map(async (school) => {
          return {
            school,
            canUpdate: await this.permissionChecker.canUpdateUserInSchool(school),
          };
        }),
      ),
    );
  }

  get selectedableSchools() {
    if (!this.allSchoolsData.isResolved || !this.schoolPermissionsData.isResolved) {
      return [];
    }

    return this.schoolPermissionsData.value
      .filter((obj) => obj.canUpdate)
      .map(({ school }) => school);
  }

  @cached
  get userData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

  get user() {
    return this.userData.isResolved ? this.userData.value : null;
  }

  get currentSchool() {
    if (this.selectedSchool) {
      return this.selectedSchool;
    }

    const schoolId = this.user?.belongsTo('school').id();

    return this.selectedableSchools.find((school) => school.id === schoolId);
  }

  @cached
  get primaryCohortData() {
    return new TrackedAsyncData(this.args.user.primaryCohort);
  }

  get primaryCohort() {
    return this.primaryCohortData.isResolved ? this.primaryCohortData.value : null;
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.args.user.cohorts);
  }

  get secondaryCohorts() {
    if (!this.cohortsData.isResolved || !this.primaryCohortData.isResolved) {
      return [];
    }

    const cohorts = [...this.cohortsData.value, ...this.cohortsToAdd].filter(
      (c) => !this.cohortsToRemove.includes(c),
    );

    if (!this.currentPrimaryCohort) {
      return cohorts;
    }
    return cohorts.filter((cohort) => {
      return cohort.id !== this.currentPrimaryCohort.id;
    });
  }

  get isLoaded() {
    return (
      this.primaryCohortData.isResolved &&
      this.cohortsData.isResolved &&
      this.allSchoolsData.isResolved &&
      this.schoolPermissionsData.isResolved &&
      this.userData.isResolved
    );
  }

  get currentPrimaryCohort() {
    if (this.newPrimaryCohort === null) {
      return null;
    }
    if (this.newPrimaryCohort === false) {
      return this.primaryCohort;
    }

    return this.newPrimaryCohort;
  }

  @action
  addSecondaryCohort(cohort) {
    this.cohortsToAdd = [...this.cohortsToAdd, cohort];
    this.cohortsToRemove = this.cohortsToRemove.filter((c) => c !== cohort);
  }

  @action
  removeSecondaryCohort(cohort) {
    this.cohortsToRemove = [...this.cohortsToRemove, cohort];
    this.cohortsToAdd = this.cohortsToAdd.filter((c) => c !== cohort);
  }

  cancel = task({ restartable: true }, async () => {
    this.reset();
    this.args.setIsManaging(false);
  });

  reset() {
    this.cohortsToAdd = [];
    this.cohortsToRemove = [];
    this.newPrimaryCohort = false;
  }

  save = task({ drop: true }, async () => {
    const cohorts = [this.currentPrimaryCohort, ...this.secondaryCohorts];
    this.args.user.primaryCohort = this.currentPrimaryCohort;
    this.args.user.cohorts = cohorts.filter(Boolean);
    await this.args.user.save();
    this.reset();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
  });
  <template>
    <div
      class="user-profile-cohorts small-component{{if
          this.hasSavedRecently
          ' has-saved'
          ' has-not-saved'
        }}"
      data-test-user-profile-cohorts
      ...attributes
    >
      {{#if this.isLoaded}}
        <div class="user-profile-cohorts-header">
          <h2 class="title" data-test-title>
            {{t "general.cohorts"}}
          </h2>
          <div class="actions">
            {{#if @isManaging}}
              <button
                type="button"
                disabled={{or this.save.isRunning this.cancel.isRunning}}
                class="bigadd font-size-base"
                aria-label={{t "general.save"}}
                {{on "click" (perform this.save)}}
                data-test-save
              >
                <FaIcon
                  @icon={{if this.save.isRunning faSpinner faCheck}}
                  @spin={{this.save.isRunning}}
                />
              </button>
              <button
                type="button"
                disabled={{or this.save.isRunning this.cancel.isRunning}}
                class="bigcancel font-size-base"
                aria-label={{t "general.cancel"}}
                {{on "click" (perform this.cancel)}}
                data-test-cancel
              >
                <FaIcon @icon={{faArrowRotateLeft}} />
              </button>
            {{else if @isManageable}}
              <button
                aria-label={{t "general.manage"}}
                type="button"
                class="manage font-size-base"
                {{on "click" (fn @setIsManaging true)}}
                data-test-manage
              >
                <FaIcon @icon={{faPenToSquare}} />
              </button>
            {{/if}}
          </div>
        </div>
        {{#if @isManaging}}
          <UserProfileCohortsManager
            @primaryCohort={{this.currentPrimaryCohort}}
            @secondaryCohorts={{this.secondaryCohorts}}
            @addSecondaryCohort={{this.addSecondaryCohort}}
            @removeSecondaryCohort={{this.removeSecondaryCohort}}
            @setPrimaryCohort={{set this "newPrimaryCohort"}}
            @schools={{this.selectedableSchools}}
            @selectedSchool={{this.currentSchool}}
            @setSchool={{set this "selectedSchool"}}
          />
        {{else}}
          <UserProfileCohortsDetails
            @primaryCohort={{this.primaryCohort}}
            @secondaryCohorts={{this.secondaryCohorts}}
          />
        {{/if}}
      {{/if}}
    </div>
  </template>
}

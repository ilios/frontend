import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class ProgramYearListItemComponent extends Component {
  @service permissionChecker;
  @service currentUser;

  @tracked showRemoveConfirmation = false;

  @cached
  get canLockData() {
    return new TrackedAsyncData(this.permissionChecker.canLockProgramYear(this.args.programYear));
  }

  @cached
  get canUnlockData() {
    return new TrackedAsyncData(this.permissionChecker.canUnlockProgramYear(this.args.programYear));
  }

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteProgramYear(this.args.programYear));
  }

  @cached
  get programData() {
    return new TrackedAsyncData(this.args.programYear.program);
  }

  get program() {
    return this.programData.isResolved ? this.programData.value : null;
  }

  @cached
  get cohortData() {
    return new TrackedAsyncData(this.args.programYear.cohort);
  }

  get cohort() {
    return this.cohortData.isResolved ? this.cohortData.value : null;
  }

  get canLock() {
    return this.canLockData.isResolved ? this.canLockData.value : false;
  }

  get canUnlock() {
    return this.canUnlockData.isResolved ? this.canUnlockData.value : false;
  }

  get canDelete() {
    if (!this.cohort) {
      return false;
    }

    const cohortUsers = this.cohort.hasMany('users').ids();
    if (cohortUsers.length) {
      return false;
    }

    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }

  get classOfYear() {
    if (!this.program) {
      return '';
    }

    return Number(this.args.programYear.startYear) + Number(this.program.duration);
  }

  get academicYear() {
    if (this.args.academicYearCrossesCalendarYearBoundaries) {
      const endYear = Number(this.args.programYear.startYear) + 1;
      return `${this.args.programYear.startYear} - ${endYear}`;
    }

    return this.args.programYear.startYear;
  }

  async checkerPermissions(programYear, program, cohort) {
    let canDelete = false;
    const canLock = await this.permissionChecker.canLockProgramYear(programYear);
    const canUnlock = await this.permissionChecker.canUnlockProgramYear(programYear);

    const cohortUsers = cohort.hasMany('users').ids();
    if (cohortUsers.length === 0) {
      canDelete = await this.permissionChecker.canDeleteProgramYear(programYear);
    }

    return { canDelete, canLock, canUnlock };
  }

  lock = dropTask(async () => {
    this.args.programYear.set('locked', true);
    await this.args.programYear.save();
  });

  unlock = dropTask(async () => {
    this.args.programYear.set('locked', false);
    await this.args.programYear.save();
  });

  remove = dropTask(async () => {
    await this.args.programYear.destroyRecord();
  });
}

{{#if (and this.cohort (not @programYear.archived))}}
  <tr class={{if this.showRemoveConfirmation "confirm-removal"}} data-test-program-year-list-item>
    <td class="text-left">
      <LinkTo @route="program-year" @models={{array this.program @programYear}} data-test-link>
        <FaIcon @icon="square-up-right" />
        {{this.academicYear}}
      </LinkTo>
    </td>
    <td class="text-left hide-from-small-screen" data-test-title>
      {{#if this.cohort.title}}
        {{this.cohort.title}}
      {{else}}
        {{t "general.classOf" year=this.classOfYear}}
      {{/if}}
    </td>
    <td class="text-left hide-from-small-screen" data-test-competencies>
      {{#if @programYear.competencies.length}}
        {{@programYear.competencies.length}}
      {{else}}
        <FaIcon @icon="triangle-exclamation" class="warning" data-test-warning />
      {{/if}}
    </td>
    <td class="text-left hide-from-small-screen" data-test-objectives>
      {{#if @programYear.programYearObjectives.length}}
        {{@programYear.programYearObjectives.length}}
      {{else}}
        <FaIcon @icon="triangle-exclamation" class="warning" data-test-warning />
      {{/if}}
    </td>
    <td class="text-left hide-from-small-screen" data-test-directors>
      {{#if @programYear.directors.length}}
        {{@programYear.directors.length}}
      {{else}}
        <FaIcon @icon="triangle-exclamation" class="warning" data-test-warning />
      {{/if}}
    </td>
    <td class="text-left hide-from-small-screen" data-test-terms>
      {{#if @programYear.terms.length}}
        {{@programYear.terms.length}}
      {{else}}
        <FaIcon @icon="triangle-exclamation" class="warning" data-test-warning />
      {{/if}}
    </td>
    <td class="text-right" colspan="2" data-test-actions>
      {{#if (or this.lock.isRunning this.unlock.isRunning)}}
        <LoadingSpinner />
      {{else}}
        {{#if @programYear.locked}}
          {{#if this.canUnlock}}
            <button
              type="button"
              class="link-button"
              {{on "click" (perform this.unlock)}}
              data-test-unlock
            >
              <FaIcon @icon="lock" />
            </button>
          {{else}}
            <FaIcon @icon="lock" />
          {{/if}}
        {{else if this.canLock}}
          <button
            type="button"
            class="link-button"
            {{on "click" (perform this.lock)}}
            data-test-lock
          >
            <FaIcon @icon="unlock" />
          </button>
        {{else}}
          <FaIcon @icon="unlock" />
        {{/if}}
        {{#if this.canDelete}}
          <button
            type="button"
            class="link-button"
            {{on "click" (set this "showRemoveConfirmation" true)}}
            data-test-remove
          >
            <FaIcon @icon="trash" class="remove" />
          </button>
        {{else}}
          <FaIcon @icon="trash" class="disabled" />
        {{/if}}
      {{/if}}
    </td>
  </tr>
  {{#if this.showRemoveConfirmation}}
    <tr class="confirm-removal">
      <td colspan="8" class="hide-from-small-screen">
        <div class="confirm-message" data-test-message>
          {{t "general.confirmRemoveProgramYear" courseCount=this.cohort.courses.length}}
          <br />
          <div class="confirm-buttons">
            <button
              type="button"
              class="remove text"
              {{on "click" (perform this.remove)}}
              data-test-confirm
            >
              {{t "general.yes"}}
            </button>
            <button
              type="button"
              class="done text"
              {{on "click" (set this "showRemoveConfirmation" false)}}
              data-test-cancel
            >
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      </td>
      <td colspan="3" class="hide-from-large-screen" data-test-confirm-removal>
        <div class="confirm-message" data-test-message>
          {{t "general.confirmRemoveProgramYear" courseCount=this.cohort.courses.length}}
          <br />
          <div class="confirm-buttons">
            <button
              type="button"
              class="remove text"
              {{on "click" (perform this.remove)}}
              data-test-confirm
            >
              {{t "general.yes"}}
            </button>
            <button
              type="button"
              class="done text"
              {{on "click" (set this "showRemoveConfirmation" false)}}
              data-test-cancel
            >
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      </td>
    </tr>
  {{/if}}
{{/if}}
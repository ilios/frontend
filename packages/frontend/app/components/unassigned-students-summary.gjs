import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class UnassignedStudentsSummaryComponent extends Component {
  @service currentUser;
  @service store;

  @tracked schoolId;

  @cached
  get userModelData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

  get currentUserModel() {
    return this.userModelData.isResolved ? this.userModelData.value : null;
  }

  @cached
  get userSchoolData() {
    return new TrackedAsyncData(this.currentUserModel?.school);
  }
  get userSchool() {
    return this.userSchoolData.isResolved ? this.userSchoolData.value : null;
  }

  get selectedSchool() {
    if (this.schoolId) {
      return findById(this.args.schools, this.schoolId);
    }
    return this.userSchool;
  }

  @cached
  get unassignedStudentsData() {
    return new TrackedAsyncData(
      this.store.query('user', {
        filters: {
          cohorts: null,
          enabled: true,
          roles: [4],
          school: this.selectedSchool.id,
        },
      }),
    );
  }

  get unassignedStudents() {
    return this.unassignedStudentsData.isResolved ? this.unassignedStudentsData.value : [];
  }

  get hasUnassignedStudents() {
    return this.isLoaded && this.unassignedStudents?.length > 0;
  }

  get isLoaded() {
    return (
      this.userModelData.isResolved &&
      this.userSchoolData.isResolved &&
      this.unassignedStudentsData.isResolved
    );
  }
}

{{#let (unique-id) as |templateId|}}
  <div
    class="unassigned-students-summary small-component {{if this.hasUnassignedStudents 'alert'}}"
    data-test-unassigned-students-summary
  >
    <h3 data-test-title>
      {{#if this.hasUnassignedStudents}}
        <FaIcon @icon="triangle-exclamation" class="no" />
      {{/if}}
      {{t "general.unassignedStudentsSummaryTitle"}}
    </h3>
    <div id="schoolsfilter" class="filter">
      <label for="school-filter-{{templateId}}" class="inline-label">
        <FaIcon @icon="building-columns" @title={{t "general.filterBySchool"}} />
      </label>
      <div id="school-selection" class="inline-data" data-test-schools>
        {{#if (gt @schools.length 1)}}
          <select
            id="school-filter-{{templateId}}"
            {{on "change" (pick "target.value" (set this "schoolId"))}}
          >
            {{#each (sort-by "title" @schools) as |school|}}
              <option value={{school.id}} selected={{eq school.id this.selectedSchool.id}}>
                {{school.title}}
              </option>
            {{/each}}
          </select>
        {{else}}
          {{get this.selectedSchool "title"}}
        {{/if}}
      </div>
    </div>
    {{#if this.isLoaded}}
      <p data-test-summary-text>
        {{t "general.unassignedStudentsSummary" count=this.unassignedStudents.length}}
      </p>
      {{#if (gt this.unassignedStudents.length 0)}}
        <div class="actions">
          <LinkTo
            @route="assign-students"
            @query={{hash schoolId=this.selectedSchool.id}}
            class="manage-link"
            data-test-manage-link
          >
            {{t "general.manage"}}
          </LinkTo>
        </div>
      {{/if}}
    {{else}}
      <LoadingSpinner />
    {{/if}}
  </div>
{{/let}}
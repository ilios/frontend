import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { findById, mapBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class CourseManageObjectiveParentsComponent extends Component {
  @tracked userSelectedCohort;

  get selectedCohort() {
    if (this.userSelectedCohort && this.args.cohortObjectives.includes(this.userSelectedCohort)) {
      return this.userSelectedCohort;
    }

    if (this.args.cohortObjectives.length) {
      return this.args.cohortObjectives[0];
    }

    return null;
  }

  @action
  chooseCohort(event) {
    const cohortId = event.target.value;
    this.userSelectedCohort = findById(this.args.cohortObjectives, cohortId);
  }

  get selectedCompetencyIdsInSelectedCohort() {
    const selectedInCohort = this.args.selected.filter(
      (obj) => obj.cohortId === this.selectedCohort.id,
    );
    return mapBy(selectedInCohort, 'competencyId');
  }

  get competenciesFromSelectedCohort() {
    return sortBy(this.selectedCohort.competencies, 'title');
  }
}

<section class="course-manage-objective-parents" data-test-course-manage-objective-parents>
  {{#if @cohortObjectives.length}}
    <label>
      {{t "general.chooseCohortTitle"}}:
      {{#if (gt @cohortObjectives.length 1)}}
        <select
          {{on "change" this.chooseCohort}}
          data-test-cohort-selector
          data-test-selected-cohort-title
        >
          {{#each (sort-by "title" @cohortObjectives) as |cohort|}}
            <option value={{cohort.id}} selected={{eq cohort.id this.selectedCohort.id}}>
              {{cohort.title}}
            </option>
          {{/each}}
        </select>
      {{else}}
        <span data-test-selected-cohort-title>{{this.selectedCohort.title}}</span>
      {{/if}}
    </label>

    {{#if this.selectedCohort}}
      <ul class="parent-picker" data-test-parent-picker>
        {{#each this.competenciesFromSelectedCohort as |competency|}}
          <li
            class="competency
              {{if (includes competency.id this.selectedCompetencyIdsInSelectedCohort) 'selected'}}"
            data-test-competency
          >
            <h4 class="competency-title" data-test-competency-title>
              {{competency.title}}
              {{#if competency.parent}}
                <span class="domain-title">
                  ({{competency.parent.title}})
                </span>
              {{/if}}
            </h4>
            <ul>
              {{#each (sort-by "title" competency.objectives) as |objective|}}
                {{#if (or (includes objective @selected) objective.active)}}
                  <li>
                    <Course::ManageObjectiveParentsItem
                      @title={{objective.title}}
                      @allowMultipleParents={{this.selectedCohort.allowMultipleParents}}
                      @isSelected={{includes objective @selected}}
                      @add={{pipe
                        (if
                          this.selectedCohort.allowMultipleParents
                          (noop)
                          (fn @removeFromCohort this.selectedCohort)
                        )
                        (fn @add objective)
                      }}
                      @remove={{fn @remove objective}}
                    />
                  </li>
                {{/if}}
              {{/each}}
            </ul>
          </li>
        {{/each}}
      </ul>
    {{/if}}
  {{else}}
    <p class="no-cohorts" data-test-no-cohorts-message>{{t "general.missingCohortMessage"}}</p>
  {{/if}}
</section>
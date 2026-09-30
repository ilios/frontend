import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import sortableByPosition from '../../utils/sortable-by-position';
import { findById } from '../../utils/array-helpers';
import ObjectiveSortManager from '../objective-sort-manager';
import set from 'ember-set-helper/helpers/set';
import { and, gt, not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import isArray from 'ember-truth-helpers/helpers/is-array';
import ObjectiveListItem from './objective-list-item';
import ObjectiveListLoading from './objective-list-loading';

export default class CourseObjectiveListComponent extends Component {
  @service store;
  @service intl;

  @tracked isSorting = false;

  @cached
  get courseObjectivesAsyncData() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  get courseObjectivesAsync() {
    return this.courseObjectivesAsyncData.isResolved ? this.courseObjectivesAsyncData.value : null;
  }

  get courseObjectives() {
    const objectives =
      this.courseObjectivesAsync ?? this.args.course.hasMany('courseObjectives').value();
    if (objectives) {
      return objectives.toSorted(sortableByPosition);
    }

    return undefined;
  }

  get courseObjectivesCount() {
    return this.courseObjectives
      ? this.courseObjectives.length
      : this.args.course.hasMany('courseObjectives').ids().length;
  }

  @cached
  get courseCohortsAsyncData() {
    return new TrackedAsyncData(this.args.course.cohorts);
  }

  get courseCohortsAsync() {
    return this.courseCohortsAsyncData.isResolved ? this.courseCohortsAsyncData.value : null;
  }

  get courseCohorts() {
    return this.courseCohortsAsync ?? [];
  }

  @cached
  get cohortObjectivesData() {
    return new TrackedAsyncData(this.getCohortObjectives(this.courseCohorts, this.intl));
  }

  get cohortObjectives() {
    return this.cohortObjectivesData.isResolved ? this.cohortObjectivesData.value : [];
  }

  async getCohortObjectives(cohorts, intl) {
    return await Promise.all(
      cohorts.map(async (cohort) => {
        const programYear = await cohort.programYear;
        const program = await programYear.program;
        const allowMultipleCourseObjectiveParents = this.args.allowMultipleCourseObjectiveParents;
        const objectives = await programYear.programYearObjectives;
        const objectiveObjects = await Promise.all(
          objectives.map(async (objective) => {
            let competencyId = 0;
            let competencyTitle = intl.t('general.noAssociatedCompetency');
            let competencyParent = null;
            const competency = await objective.competency;
            if (competency) {
              competencyId = competency.id;
              competencyTitle = competency.title;
              competencyParent = await competency.parent;
            }
            return {
              id: objective.id,
              title: objective.title,
              active: objective.active,
              competencyId,
              competencyTitle,
              competencyParent,
              cohortId: cohort.id,
            };
          }),
        );
        const competencies = objectiveObjects.reduce((set, obj) => {
          let existing = findById(set, obj.competencyId);
          if (!existing) {
            existing = {
              id: obj.competencyId,
              title: obj.competencyTitle,
              objectives: [],
              parent: obj.competencyParent,
            };
            set.push(existing);
          }
          existing.objectives.push(obj);
          return set;
        }, []);

        return {
          title: `${program.title} ${cohort.title}`,
          id: cohort.id,
          allowMultipleParents: allowMultipleCourseObjectiveParents,
          competencies,
        };
      }),
    );
  }
  <template>
    <div class="course-objective-list" data-test-course-objective-list>
      {{#if this.isSorting}}
        <ObjectiveSortManager @subject={{@course}} @close={{set this "isSorting" false}} />
      {{/if}}

      {{#if (and this.courseObjectivesCount (not this.isSorting))}}
        {{#if (and @editable (gt this.courseObjectivesCount 1))}}
          <button
            class="sort-button"
            type="button"
            {{on "click" (set this "isSorting" true)}}
            data-test-sort
          >
            {{t "general.sortObjectives"}}
          </button>
        {{/if}}
        <div
          class="grid-row headers{{unless @editable ' no-actions'}}{{unless @showMeSH ' no-mesh'}}"
          data-test-headers
        >
          <span class="grid-item" data-test-header>{{t "general.description"}}</span>
          <span class="grid-item" data-test-header>{{t "general.parentObjectives"}}</span>
          <span class="grid-item" data-test-header>{{t "general.vocabularyTerms"}}</span>
          {{#if @showMeSH}}
            <span class="grid-item" data-test-header>{{t "general.meshTerms"}}</span>
          {{/if}}
          {{#if @editable}}
            <span class="actions grid-item" data-test-header>{{t "general.actions"}}</span>
          {{/if}}
        </div>
        {{#if (and (isArray this.courseObjectives) this.cohortObjectivesData.isResolved)}}
          {{#each this.courseObjectives as |courseObjective|}}
            <ObjectiveListItem
              @courseObjective={{courseObjective}}
              @editable={{@editable}}
              @cohortObjectives={{this.cohortObjectives}}
              @course={{@course}}
              @printable={{@printable}}
              @showMeSH={{@showMeSH}}
            />
          {{/each}}
        {{else}}
          <ObjectiveListLoading @count={{this.courseObjectivesCount}} @showMeSH={{@showMeSH}} />
        {{/if}}
      {{/if}}
    </div>
  </template>
}

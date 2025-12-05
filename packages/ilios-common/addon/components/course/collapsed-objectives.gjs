import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import gte from 'ember-truth-helpers/helpers/gte';
import { get } from '@ember/helper';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { faBan, faCaretRight, faCircle } from '@fortawesome/free-solid-svg-icons';

export default class CourseCollapsedObjectivesComponent extends Component {
  @cached
  get objectivesData() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  get objectives() {
    return this.objectivesData.isResolved ? this.objectivesData.value : [];
  }

  get objectivesWithParents() {
    return this.objectives.filter((objective) => {
      return objective.programYearObjectives.length > 0;
    });
  }

  get objectivesWithMesh() {
    return this.objectives.filter((objective) => {
      return objective.meshDescriptors.length > 0;
    });
  }

  get objectivesWithTerms() {
    return this.objectives.filter((objective) => {
      return objective.terms.length > 0;
    });
  }
  <template>
    <section class="course-collapsed-objectives" data-test-course-collapsed-objectives>
      <div>
        <button
          class="title link-button"
          type="button"
          aria-expanded="false"
          data-test-title
          {{on "click" @expand}}
        >
          {{t "general.objectives"}}
          ({{this.objectives.length}})
          <FaIcon @icon={{faCaretRight}} />
        </button>
      </div>
      {{#if this.objectives.length}}
        <div class="content">
          <table class="ilios-table ilios-table-colors condensed font-size-small">
            <thead>
              <tr>
                <th class="text-left">
                  {{t "general.summary"}}
                </th>
                <th class="text-center">
                  {{t "general.parentObjectives"}}
                </th>
                <th class="text-center">
                  {{t "general.vocabularyTerms"}}
                </th>
                <th class="text-center">
                  {{t "general.meshTerms"}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-test-objective-count>
                  {{t "general.objectiveCount" count=this.objectives.length}}
                </td>
                <td class="text-middle text-center" rowspan="3" data-test-parent-status>
                  {{#if (eq this.objectivesWithParents.length this.objectives.length)}}
                    <FaIcon @icon={{faCircle}} class="yes" />
                  {{else if (gte (get this.objectivesWithParents "length") 1)}}
                    <FaIcon @icon={{faCircle}} class="maybe" />
                  {{else}}
                    <FaIcon @icon={{faBan}} class="no" />
                  {{/if}}
                </td>
                <td class="text-middle text-center" rowspan="3" data-test-term-status>
                  {{#if (eq this.objectivesWithTerms.length this.objectives.length)}}
                    <FaIcon @icon={{faCircle}} class="yes" />
                  {{else if (gte (get this.objectivesWithTerms "length") 1)}}
                    <FaIcon @icon={{faCircle}} class="maybe" />
                  {{else}}
                    <FaIcon @icon={{faBan}} class="no" />
                  {{/if}}
                </td>
                <td class="text-middle text-center" rowspan="3" data-test-mesh-status>
                  {{#if (eq this.objectivesWithMesh.length this.objectives.length)}}
                    <FaIcon @icon={{faCircle}} class="yes" />
                  {{else if (gte (get this.objectivesWithMesh "length") 1)}}
                    <FaIcon @icon={{faCircle}} class="maybe" />
                  {{else}}
                    <FaIcon @icon={{faBan}} class="no" />
                  {{/if}}
                </td>
              </tr>
              <tr>
                <td data-test-parent-count class="count">
                  {{t "general.parentCount" count=this.objectivesWithParents.length}}
                </td>
              </tr>
              <tr>
                <td data-test-term-count class="count">
                  {{t "general.termCount" count=this.objectivesWithTerms.length}}
                </td>
              </tr>
              <tr>
                <td data-test-mesh-count class="count">
                  {{t "general.meshCount" count=this.objectivesWithMesh.length}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      {{else}}
        <LoadingSpinner @tagName="h3" />
      {{/if}}
    </section>
  </template>
}

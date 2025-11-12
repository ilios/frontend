import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import { hash } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';

export default class CoursePublicationCheckComponent extends Component {
  @service router;

  @cached
  get courseObjectives() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  @cached
  get showUnlinkIcon() {
    if (!this.courseObjectives.isResolved) {
      return false;
    }
    const objectivesWithoutParents = this.courseObjectives.value.filter((objective) => {
      return objective.programYearObjectives.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }
  <template>
    <div
      class="course-publicationcheck main-section"
      data-test-course-publicationcheck
      {{scrollIntoView}}
    >
      <LinkTo @route="course" @model={{@course}} data-test-back-to-course>
        {{t "general.backToTitle" title=@course.title}}
      </LinkTo>

      <section class="course-publicationcheck-details">
        <div class="title">
          {{t "general.missingItems"}}
          ({{@course.allPublicationIssuesLength}})
        </div>
        <div class="course-publicationcheck-content">
          <table>
            <thead>
              <tr>
                <th>
                  {{t "general.courseTitle"}}
                </th>
                <th>
                  {{t "general.cohorts"}}
                </th>
                <th>
                  {{t "general.terms"}}
                </th>
                <th>
                  {{t "general.objectives"}}
                </th>
                <th>
                  {{t "general.meshTerms"}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-test-course-title>
                  {{@course.title}}
                </td>
                {{#if @course.cohorts.length}}
                  <td class="yes" data-test-cohorts>
                    {{t "general.yes"}}
                    ({{@course.cohorts.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-cohorts>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if @course.terms.length}}
                  <td class="yes" data-test-terms>
                    {{t "general.yes"}}
                    ({{@course.terms.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-terms>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if (hasManyLength @course "courseObjectives")}}
                  <td class="yes" data-test-objectives>
                    {{t "general.yes"}}
                    ({{hasManyLength @course "courseObjectives"}})
                    {{#if this.showUnlinkIcon}}
                      <LinkTo
                        @route="course"
                        @model={{@course}}
                        @query={{hash details=true courseObjectiveDetails=true}}
                        aria-label={{t "general.backToCourse"}}
                        data-test-unlink
                      >
                        <FaIcon @icon="link-slash" />
                      </LinkTo>
                    {{/if}}
                  </td>
                {{else}}
                  <td class="no" data-test-objectives>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if @course.meshDescriptors.length}}
                  <td class="yes" data-test-mesh>
                    {{t "general.yes"}}
                    ({{@course.meshDescriptors.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-mesh>
                    {{t "general.no"}}
                  </td>
                {{/if}}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </template>
}

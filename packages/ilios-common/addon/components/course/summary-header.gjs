import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import PublicationStatus from 'ilios-common/components/publication-status';
import { faPrint, faShuffle } from '@fortawesome/free-solid-svg-icons';

export default class CourseSummaryHeaderComponent extends Component {
  @service permissionChecker;

  @cached
  get canRolloverData() {
    return new TrackedAsyncData(this.getCanRollover(this.args.course));
  }

  get canRollover() {
    return this.canRolloverData.isResolved ? this.canRolloverData.value : false;
  }

  async getCanRollover(course) {
    if (course.locked) {
      return false;
    }
    const school = await course.school;
    return this.permissionChecker.canCreateCourse(school);
  }
  <template>
    <div class="ilios-overview course-summary-header" data-test-course-summary-header ...attributes>
      <div class="overview-header">
        <h2 class="overview-title">
          {{@course.title}}
        </h2>
        <div class="overview-actions" data-test-actions>
          <LinkTo
            @route="print-course"
            @model={{@course}}
            @query={{hash unpublished=true}}
            class="print"
            data-test-print
          >
            <FaIcon @icon={{faPrint}} @title={{t "general.printSummary"}} @fixedWidth={{true}} />
          </LinkTo>
          {{#if this.canRollover}}
            <LinkTo @route="course.rollover" @model={{@course}} class="rollover" data-test-rollover>
              <FaIcon
                @icon={{faShuffle}}
                @title={{t "general.courseRollover"}}
                @fixedWidth={{true}}
              />
            </LinkTo>
          {{/if}}
        </div>
      </div>
      <div class="overview-content">
        <div class="overview-block" data-test-start>
          <label>
            {{t "general.startDate"}}:
          </label>
          <span>
            {{formatDate @course.startDate day="2-digit" month="2-digit" year="numeric"}}
          </span>
        </div>
        <div class="overview-block" data-test-external-id>
          <label>
            {{t "general.externalId"}}:
          </label>
          <span>
            {{@course.externalId}}
          </span>
        </div>
        <div class="overview-block" data-test-end>
          <label>
            {{t "general.endDate"}}:
          </label>
          <span>
            {{formatDate @course.endDate day="2-digit" month="2-digit" year="numeric"}}
          </span>
        </div>
        <div class="overview-block" data-test-level>
          <label>
            {{t "general.level"}}:
          </label>
          <span>
            {{@course.level}}
          </span>
        </div>
        <div class="overview-block" data-test-status>
          <label>
            {{t "general.publicationStatus"}}:
          </label>
          <span>
            <PublicationStatus @item={{@course}} @showText={{true}} />
          </span>
        </div>
      </div>
    </div>
  </template>
}

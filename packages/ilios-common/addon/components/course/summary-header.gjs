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
    <div class="course-summary-header" ...attributes>
      <div class="course-summary-header-top">
        <h2>
          {{@course.title}}
        </h2>
        <div class="course-summary-actions">
          <LinkTo
            @route="print-course"
            @model={{@course}}
            @query={{hash unpublished=true}}
            class="print font-size-medium"
          >
            <FaIcon @icon={{faPrint}} @title={{t "general.printSummary"}} @fixedWidth={{true}} />
          </LinkTo>
          {{#if this.canRollover}}
            <LinkTo @route="course.rollover" @model={{@course}} class="rollover font-size-medium">
              <FaIcon
                @icon={{faShuffle}}
                @title={{t "general.courseRollover"}}
                @fixedWidth={{true}}
              />
            </LinkTo>
          {{/if}}
        </div>
      </div>
      <div class="course-summary-content">
        <div class="block">
          <label>
            {{t "general.startDate"}}:
          </label>
          <span>
            {{formatDate @course.startDate day="2-digit" month="2-digit" year="numeric"}}
          </span>
        </div>
        <div class="block">
          <label>
            {{t "general.externalId"}}:
          </label>
          <span>
            {{@course.externalId}}
          </span>
        </div>
        <div class="block">
          <label>
            {{t "general.endDate"}}:
          </label>
          <span>
            {{formatDate @course.endDate day="2-digit" month="2-digit" year="numeric"}}
          </span>
        </div>
        <div class="block">
          <label>
            {{t "general.level"}}:
          </label>
          <span>
            {{@course.level}}
          </span>
        </div>
        <div class="block">
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

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import includes from 'ilios-common/helpers/includes';
import { LinkTo } from '@ember/routing';
import formatDate from 'ember-intl/helpers/format-date';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import PublicationStatus from 'ilios-common/components/publication-status';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faLock, faLockOpen, faTrash } from '@fortawesome/free-solid-svg-icons';

export default class CoursesListItemComponent extends Component {
  @service permissionChecker;

  @cached
  get canLockData() {
    return new TrackedAsyncData(this.permissionChecker.canUpdateCourse(this.args.course));
  }

  @cached
  get canUnlockData() {
    return new TrackedAsyncData(this.permissionChecker.canUnlockCourse(this.args.course));
  }

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteCourse(this.args.course));
  }

  get canLock() {
    return this.canLockData.isResolved ? this.canLockData.value : false;
  }

  get canUnlock() {
    return this.canUnlockData.isResolved ? this.canUnlockData.value : false;
  }

  get canDelete() {
    if (this.args.course.isPublishedOrScheduled) {
      return false;
    } else if (this.args.course.hasMany('descendants').ids().length > 0) {
      return false;
    }
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }
  <template>
    <tr
      class="courses-list-item{{if
          (includes @course.id @coursesForRemovalConfirmation)
          ' confirm-removal'
        }}"
      data-test-courses-list-item
    >
      <td class="text-left" colspan="8" data-test-course-title>
        <LinkTo @route="course" @model={{@course}}>
          {{@course.title}}
          {{#if @course.externalId}}
            ({{@course.externalId}})
          {{/if}}
        </LinkTo>
      </td>
      <td class="text-center hide-from-small-screen" colspan="1" data-test-level>
        {{@course.level}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-start-date>
        {{formatDate @course.startDate day="2-digit" month="2-digit" year="numeric"}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-end-date>
        {{formatDate @course.endDate day="2-digit" month="2-digit" year="numeric"}}
      </td>
      <td class="text-right" colspan="3" data-test-status>
        {{#if (includes @course.id @savingCourseIds)}}
          <LoadingSpinner />
        {{else}}
          <PublicationStatus @item={{@course}} @showText={{false}} />
          {{#if @course.locked}}
            {{#if this.canUnlock}}
              <button
                type="button"
                class="link-button"
                title={{t "general.unlockCourse"}}
                {{on "click" (fn @unlockCourse @course)}}
                data-test-unlock
              >
                <FaIcon @icon={{faLock}} />
              </button>
            {{else}}
              <FaIcon @icon={{faLock}} class="disabled" />
            {{/if}}
          {{else if this.canLock}}
            <button
              type="button"
              class="link-button"
              title={{t "general.lockCourse"}}
              {{on "click" (fn @lockCourse @course)}}
              data-test-lock
            >
              <FaIcon @icon={{faLockOpen}} />
            </button>
          {{else}}
            <FaIcon @icon={{faLockOpen}} class="disabled" />
          {{/if}}
          {{#if this.canDelete}}
            <button
              type="button"
              class="link-button"
              title={{t "general.deleteCourse"}}
              {{on "click" (fn @confirmRemoval @course)}}
              data-test-remove
            >
              <FaIcon @icon={{faTrash}} class="enabled" />
            </button>
          {{else}}
            <FaIcon @icon={{faTrash}} class="disabled" />
          {{/if}}
        {{/if}}
      </td>
    </tr>
  </template>
}

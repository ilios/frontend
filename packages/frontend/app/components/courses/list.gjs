import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import ListItem from 'frontend/components/courses/list-item';
import perform from 'ember-concurrency/helpers/perform';
import includes from 'ilios-common/helpers/includes';
import ResponsiveTd from 'frontend/components/responsive-td';
import { on } from '@ember/modifier';

export default class CoursesListComponent extends Component {
  @service intl;
  @service permissionChecker;
  @service iliosConfig;

  @tracked coursesForRemovalConfirmation = [];
  @tracked savingCourseIds = [];

  get sortedAscending() {
    return !this.args.sortBy.includes(':desc');
  }

  startSavingCourse(id) {
    this.savingCourseIds = [...this.savingCourseIds, id];
  }
  stopSavingCourse(courseId) {
    this.savingCourseIds = this.savingCourseIds.filter((id) => id !== courseId);
  }

  get sortingByStatus() {
    return this.args.sortBy.includes('status');
  }

  getStatus(course) {
    let translation = 'general.';
    if (course.get('isScheduled')) {
      translation += 'scheduled';
    } else if (course.get('isPublished')) {
      translation += 'published';
    } else {
      translation += 'notPublished';
    }
    return this.intl.t(translation);
  }

  unlockCourse = task(async (course) => {
    const permission = await this.permissionChecker.canUnlockCourse(course);
    this.startSavingCourse(course.id);
    if (permission) {
      await this.args.unlock(course);
      this.stopSavingCourse(course.id);
    }
  });

  lockCourse = task(async (course) => {
    const permission = await this.permissionChecker.canUpdateCourse(course);
    this.startSavingCourse(course.id);
    if (permission) {
      await this.args.lock(course);
      this.stopSavingCourse(course.id);
    }
  });

  @action
  confirmRemoval(course) {
    this.coursesForRemovalConfirmation = [...this.coursesForRemovalConfirmation, course.id];
  }

  @action
  cancelRemove(course) {
    this.coursesForRemovalConfirmation = this.coursesForRemovalConfirmation.filter(
      (id) => id !== course.id,
    );
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  async canUnlock(course) {
    return this.permissionChecker.canUnlockCourse(course);
  }

  @action
  async canLock(course) {
    return this.permissionChecker.canUpdateCourse(course);
  }

  @action
  async canDelete(course) {
    if (course.get('isPublishedOrScheduled')) {
      return false;
    } else if (course.hasMany('descendants').ids().length > 0) {
      return false;
    }
    return this.permissionChecker.canDeleteCourse(course);
  }

  @action
  sortCoursesByStatus(a, b) {
    const aStatus = this.getStatus(a);
    const bStatus = this.getStatus(b);

    if (this.sortedAscending) {
      return aStatus.localeCompare(bStatus);
    }

    return bStatus.localeCompare(aStatus);
  }
  <template>
    <div data-test-courses-list ...attributes>
      {{#if @courses.length}}
        <table class="ilios-table ilios-zebra-table">
          <thead>
            <tr data-test-course-headings>
              <SortableTh
                data-test-course-title-heading
                @colspan="8"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
                @onClick={{fn this.setSortBy "title"}}
              >
                {{t "general.courseTitle"}}
              </SortableTh>
              <SortableTh
                class="hide-from-small-screen"
                @align="center"
                @colspan="1"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq @sortBy "level") (eq @sortBy "level:desc")}}
                @sortType="numeric"
                @onClick={{fn this.setSortBy "level"}}
              >
                {{t "general.level"}}
              </SortableTh>
              <SortableTh
                class="hide-from-small-screen"
                @align="center"
                @colspan="2"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq @sortBy "startDate") (eq @sortBy "startDate:desc")}}
                @sortType="numeric"
                @onClick={{fn this.setSortBy "startDate"}}
              >
                {{t "general.startDate"}}
              </SortableTh>
              <SortableTh
                class="hide-from-small-screen"
                @align="center"
                @colspan="2"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq @sortBy "endDate") (eq @sortBy "endDate:desc")}}
                @sortType="numeric"
                @onClick={{fn this.setSortBy "endDate"}}
              >
                {{t "general.endDate"}}
              </SortableTh>
              <SortableTh
                @align="right"
                @colspan="3"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq @sortBy "status") (eq @sortBy "status:desc")}}
                @onClick={{fn this.setSortBy "status"}}
              >
                {{t "general.status"}}
              </SortableTh>
            </tr>
          </thead>
          <tbody data-test-courses>
            {{#each
              (sortBy (if this.sortingByStatus this.sortCoursesByStatus @sortBy) @courses)
              as |course|
            }}
              <ListItem
                @course={{course}}
                @coursesForRemovalConfirmation={{this.coursesForRemovalConfirmation}}
                @savingCourseIds={{this.savingCourseIds}}
                @lockCourse={{fn (perform this.lockCourse)}}
                @unlockCourse={{fn (perform this.unlockCourse)}}
                @confirmRemoval={{this.confirmRemoval}}
              />
              {{#if (includes course.id this.coursesForRemovalConfirmation)}}
                <tr class="confirm-removal">
                  <ResponsiveTd @smallScreenSpan="11" @largeScreenSpan="16">
                    <div class="confirm-message">
                      {{t
                        "general.confirmRemoveCourse"
                        publishedOfferingCount=course.publishedOfferingCount
                      }}
                      <br />
                      <div class="confirm-buttons">
                        <button
                          {{on "click" (fn @remove course)}}
                          type="button"
                          class="remove text"
                        >
                          {{t "general.yes"}}
                        </button>
                        <button
                          type="button"
                          class="done text"
                          {{on "click" (fn this.cancelRemove course)}}
                        >
                          {{t "general.cancel"}}
                        </button>
                      </div>
                    </div>
                  </ResponsiveTd>
                </tr>
              {{/if}}
            {{/each}}
          </tbody>
        </table>
      {{/if}}
    </div>
  </template>
}

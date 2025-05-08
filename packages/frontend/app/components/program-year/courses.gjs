import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { LinkTo } from '@ember/routing';
import FaIcon from 'ilios-common/components/fa-icon';

export default class ProgramYearCoursesComponent extends Component {
  @cached
  get cohortData() {
    return new TrackedAsyncData(this.args.programYear.cohort);
  }

  @cached
  get coursesData() {
    if (!this.cohortData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(this.cohortData.value.courses);
  }

  get courses() {
    return this.coursesData?.isResolved ? this.coursesData.value : [];
  }
  <template>
    <section class="program-year-courses" data-test-program-year-courses ...attributes>
      <div class="program-year-courses-header">
        <h3 class="title" data-test-title>
          {{t "general.associatedCourses"}}
          ({{this.courses.length}})
        </h3>
      </div>
      {{#if this.courses.length}}
        <div class="program-year-courses-content">
          <ul class="program-year-courses-list" data-test-courses-list>
            {{#each (sortBy "title" this.courses) as |course|}}
              <li data-test-course>
                <LinkTo @route="course" @model={{course}}>
                  <FaIcon @icon="square-up-right" />
                  {{course.title}}
                </LinkTo>
              </li>
            {{/each}}
          </ul>
        </div>
      {{/if}}
    </section>
  </template>
}

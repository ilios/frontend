import Component from '@glimmer/component';
import { service } from '@ember/service';
import { map, filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import VisualizeInstructorTermGraph from 'ilios-common/components/course/visualize-instructor-term-graph';
import VisualizeInstructorSessionTypeGraph from 'ilios-common/components/course/visualize-instructor-session-type-graph';

export default class CourseVisualizeInstructorComponent extends Component {
  @service iliosConfig;
  @service intl;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  paths = [
    {
      route: 'course',
      title: this.args.course.title,
    },
    {
      route: 'course-visualizations',
      title: this.intl.t('general.visualizations'),
    },
    {
      route: 'course-visualize-instructors',
      title: this.intl.t('general.instructors'),
    },
  ];

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : null;
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  @cached
  get minutesData() {
    return new TrackedAsyncData(this.getMinutes(this.sessions));
  }

  get minutes() {
    return this.minutesData.isResolved ? this.minutesData.value : [];
  }

  get totalInstructionalTime() {
    return mapBy(this.minutes, 'offeringMinutes').reduce((total, mins) => total + mins, 0);
  }

  get totalIlmTime() {
    return mapBy(this.minutes, 'ilmMinutes').reduce((total, mins) => total + mins, 0);
  }

  async getMinutes(sessions) {
    const sessionsWithUser = await filter(sessions, async (session) => {
      const instructors = await session.getAllInstructors();
      return mapBy(instructors, 'id').includes(this.args.user.id);
    });

    return map(sessionsWithUser, async (session) => {
      const offeringMinutes = await session.getTotalSumOfferingsDurationByInstructor(
        this.args.user,
      );
      const ilmMinutes = await session.getTotalSumIlmDurationByInstructor(this.args.user);
      return {
        offeringMinutes,
        ilmMinutes,
      };
    });
  }
  <template>
    <section
      class="course-visualize-instructor data-visualization"
      data-test-course-visualize-instructor
    >
      <Breadcrumbs @paths={{this.paths}} @model={{@course}} @rootTitle={{@user.fullName}} />
      <h2 data-test-instructor-name>
        {{@user.fullName}}
      </h2>
      <h3 data-test-total-offerings-time>
        {{t "general.totalInstructionalTime" minutes=this.totalInstructionalTime}}
      </h3>
      <h3 data-test-total-ilm-time>
        {{t "general.totalIlmTime" minutes=this.totalIlmTime}}
      </h3>
      <h3 class="clickable" data-test-title>
        <LinkTo @route="course" @model={{@course}}>
          {{@course.title}}
          {{#if this.academicYearCrossesCalendarYearBoundaries}}
            {{@course.year}}
            -
            {{add @course.year 1}}
          {{else}}
            {{@course.year}}
          {{/if}}
        </LinkTo>
      </h3>
      <div class="visualizations">
        <div>
          <h4>
            {{t "general.terms"}}
          </h4>
          <VisualizeInstructorTermGraph
            @course={{@course}}
            @user={{@user}}
            @showDataTable={{true}}
          />
        </div>
        <div>
          <h4>
            {{t "general.sessionTypes"}}
          </h4>
          <VisualizeInstructorSessionTypeGraph
            @course={{@course}}
            @user={{@user}}
            @showDataTable={{true}}
          />
        </div>
      </div>
    </section>
  </template>
}

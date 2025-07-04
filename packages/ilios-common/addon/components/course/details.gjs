import Component from '@glimmer/component';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import scrollIntoView from 'scroll-into-view';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import BackToCourses from 'ilios-common/components/course/back-to-courses';
import animateLoading from 'ilios-common/modifiers/animate-loading';
import Header from 'ilios-common/components/course/header';
import and from 'ember-truth-helpers/helpers/and';
import Overview from 'ilios-common/components/course/overview';
import Editing from 'ilios-common/components/course/editing';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import { fn } from '@ember/helper';
import { pageTitle } from 'ember-page-title';

export default class CourseDetailsComponent extends Component {
  @service router;
  @service iliosConfig;

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  get academicYearDisplay() {
    return this.academicYearCrossesCalendarYearBoundaries
      ? `${this.args.course.year} - ${this.args.course.year + 1}`
      : this.args.course.year;
  }

  @action
  collapse() {
    //when the button is clicked to collapse, animate the focus to the top of the page
    scrollIntoView(document.getElementById('course-top-section'), {
      behavior: 'smooth',
    });
    this.args.setShowDetails(false);
  }

  get notRolloverRoute() {
    return this.router.currentRouteName !== 'course.rollover';
  }
  <template>
    {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
      {{pageTitle "Courses | " @course.title " " this.academicYearDisplay}}
      <BackToCourses />

      <section
        class="course-details"
        id="course-top-section"
        data-test-ilios-course-details
        {{animateLoading "course" loadingTime=500}}
        ...attributes
      >
        <Header
          @course={{@course}}
          @editable={{and @editable this.notRolloverRoute}}
          @academicYear={{this.academicYearDisplay}}
        />
        <Overview @course={{@course}} @editable={{and @editable this.notRolloverRoute}} />
        {{#if @showDetails}}
          <Editing
            @course={{@course}}
            @editable={{and @editable this.notRolloverRoute}}
            @courseLeadershipDetails={{@courseLeadershipDetails}}
            @courseObjectiveDetails={{@courseObjectiveDetails}}
            @courseTaxonomyDetails={{@courseTaxonomyDetails}}
            @courseCompetencyDetails={{@courseCompetencyDetails}}
            @courseManageLeadership={{@courseManageLeadership}}
            @setCourseObjectiveDetails={{@setCourseObjectiveDetails}}
            @setCourseLeadershipDetails={{@setCourseLeadershipDetails}}
            @setCourseTaxonomyDetails={{@setCourseTaxonomyDetails}}
            @setCourseCompetencyDetails={{@setCourseCompetencyDetails}}
            @setCourseManageLeadership={{@setCourseManageLeadership}}
          />
          <div class="detail-collapsed-control">
            <button type="button" data-test-expand-course-details {{on "click" this.collapse}}>
              {{t "general.collapseDetail"}}
              <FaIcon @icon="square-minus" class="expand-collapse-icon" />
            </button>
          </div>
        {{else}}
          <div class="detail-collapsed-control">
            <button
              type="button"
              data-test-expand-course-details
              {{on "click" (fn @setShowDetails true)}}
            >
              {{t "general.expandDetail"}}
              <FaIcon @icon="square-plus" class="expand-collapse-icon" />
            </button>
          </div>
        {{/if}}
      </section>
    {{/if}}
  </template>
}

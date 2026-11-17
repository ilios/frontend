import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSquareMinus, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { pageTitle } from 'ember-page-title';
import { and } from 'ember-truth-helpers';

import animateLoading from '../../modifiers/animate-loading';
import scrollIntoView from '../../utils/scroll-into-view';
import BackToCourses from './back-to-courses';
import Editing from './editing';
import Header from './header';
import Overview from './overview';

export default class CourseDetailsComponent extends Component {
  @service router;
  @service iliosConfig;
  @service schoolConfig;

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
    scrollIntoView(document.getElementById('course-top-section'));
    this.args.setShowDetails(false);
  }

  get showMeSH() {
    return this.schoolConfig.getShowMeSH(this.args.course.belongsTo('school').id());
  }

  get allowMultipleCourseObjectiveParents() {
    return this.schoolConfig.getAllowMultipleCourseObjectiveParents(
      this.args.course.belongsTo('school').id(),
    );
  }

  get accessibilityRequired() {
    return this.schoolConfig.getLearningMaterialAccessibilityRequired(
      this.args.course.belongsTo('school').id(),
    );
  }

  get accessibilityRequirementsLink() {
    return this.schoolConfig.getLearningMaterialAccessibilityRequirementsLink(
      this.args.course.belongsTo('school').id(),
    );
  }

  get notRolloverRoute() {
    return this.router.currentRouteName !== 'course.rollover';
  }
  <template>
    {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
      {{pageTitle "Courses | " @course.title " " this.academicYearDisplay}}
      <BackToCourses @course={{@course}} />

      <section
        class="course-details main-section"
        id="course-top-section"
        data-test-ilios-course-details
        {{animateLoading "course" loadingTime=500}}
        ...attributes
      >
        <Header
          @course={{@course}}
          @editable={{and @editable this.notRolloverRoute}}
          @academicYear={{this.academicYearDisplay}}
          @showDetails={{@showDetails}}
          @setShowDetails={{@setShowDetails}}
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
            @accessibilityRequired={{this.accessibilityRequired}}
            @accessibilityRequirementsLink={{this.accessibilityRequirementsLink}}
            @showMeSH={{this.showMeSH}}
            @allowMultipleCourseObjectiveParents={{this.allowMultipleCourseObjectiveParents}}
          />
          {{#if @showDetailsCollapseControl}}
            <div class="details-collapse-control">
              <button type="button" data-test-expand-course-details {{on "click" this.collapse}}>
                {{t "general.collapseDetails"}}
                <FaIcon @icon={{faSquareMinus}} class="expand-collapse-icon" />
              </button>
            </div>
          {{/if}}
        {{else}}
          {{#if @showDetailsCollapseControl}}
            <div class="details-collapse-control">
              <button
                type="button"
                data-test-expand-course-details
                {{on "click" (fn @setShowDetails true)}}
              >
                {{t "general.expandDetails"}}
                <FaIcon @icon={{faSquarePlus}} class="expand-collapse-icon" />
              </button>
            </div>
          {{/if}}
        {{/if}}
      </section>
    {{/if}}
  </template>
}

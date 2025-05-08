import Component from '@glimmer/component';
import { action } from '@ember/object';
import scrollIntoView from 'scroll-into-view';
import { service } from '@ember/service';

export default class CourseDetailsComponent extends Component {
  @service router;

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
}

<Course::BackToCourses />

<section
  class="course-details"
  id="course-top-section"
  data-test-ilios-course-details
  {{animate-loading "course" loadingTime=500}}
  ...attributes
>
  <Course::Header @course={{@course}} @editable={{and @editable this.notRolloverRoute}} />
  <Course::Overview @course={{@course}} @editable={{and @editable this.notRolloverRoute}} />
  {{#if @showDetails}}
    <Course::Editing
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
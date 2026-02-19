import Component from '@glimmer/component';
import { service } from '@ember/service';
import load from 'ember-async-data/helpers/load';
import Details from 'ilios-common/components/course/details';
import BackToCourses from 'ilios-common/components/course/back-to-courses';
import animateLoading from 'ilios-common/modifiers/animate-loading';
import Header from 'ilios-common/components/course/header';
import Overview from 'ilios-common/components/course/overview';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';

export default class CourseLoaderComponent extends Component {
  @service dataLoader;

  courseLoadingPromise = this.dataLoader.loadCourse(this.args.course.id);
  <template>
    {{#let (load this.courseLoadingPromise) as |p|}}
      {{#if p.isResolved}}
        {{this.academicYearCrossesCalendarYearBoundariesData.value}}
        <Details
          @course={{@course}}
          @editable={{@editable}}
          @showDetails={{@showDetails}}
          @setShowDetails={{@setShowDetails}}
          @courseLeadershipDetails={{@courseLeadershipDetails}}
          @courseObjectiveDetails={{@courseObjectiveDetails}}
          @courseTaxonomyDetails={{@courseTaxonomyDetails}}
          @courseCompetencyDetails={{@courseCompetencyDetails}}
          @courseManageLeadership={{@courseManageLeadership}}
          @setCourseLeadershipDetails={{@setCourseLeadershipDetails}}
          @setCourseObjectiveDetails={{@setCourseObjectiveDetails}}
          @setCourseTaxonomyDetails={{@setCourseTaxonomyDetails}}
          @setCourseCompetencyDetails={{@setCourseCompetencyDetails}}
          @setCourseManageLeadership={{@setCourseManageLeadership}}
        />
      {{else}}
        <BackToCourses @course={{@course}} />

        <section
          aria-hidden="true"
          class="course-loader main-section"
          {{animateLoading "course" finalOpacity=".75"}}
        >
          <Header @course={{@course}} @editable={{false}} />
          <Overview @course={{@course}} @editable={{false}} />

          <div class="mock-detail-box">
            <span>
              {{t "general.expandDetail"}}
              <FaIcon @icon={{faSquarePlus}} class="expand-collapse-icon" />
            </span>
          </div>
        </section>
      {{/if}}
    {{/let}}
  </template>
}

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { ensureSafeComponent } from '@embroider/util';
import SessionObjectives from './curriculum/session-objectives';
import SessionOfferings from './curriculum/session-offerings';
import LearnerGroups from './curriculum/learner-groups';
import InstructionalTime from './curriculum/instructional-time';
import TaggedTerms from './curriculum/tagged-terms';
import Header from 'frontend/components/reports/curriculum/header';
import ChooseCourse from 'frontend/components/reports/curriculum/choose-course';

export default class ReportsCurriculumComponent extends Component {
  @service store;
  @service graphql;
  @service router;
  @service intl;

  @tracked searchResults = null;
  @tracked reportResults = null;

  get passedCourseIds() {
    return this.args.selectedCourseIds?.map(Number) ?? [];
  }

  get selectedReportValue() {
    return this.args.report ?? 'sessionObjectives';
  }

  @cached
  get allCourses() {
    return this.args.schools.reduce((all, school) => {
      const courses = school.years.reduce((arr, year) => {
        return [...arr, ...year.courses];
      }, []);
      return [...all, ...courses];
    }, []);
  }

  get selectedCourses() {
    return this.allCourses.filter((course) => this.passedCourseIds.includes(Number(course.id)));
  }

  get showCourseYears() {
    const years = this.selectedCourses.map(({ year }) => year);
    return years.some((year) => year !== years[0]);
  }

  get selectedSchoolIds() {
    if (!this.selectedCourses) {
      return [];
    }
    const schools = this.store.peekAll('school');
    let schoolIds = [];
    this.selectedCourses.forEach((course) => {
      const schoolForCourse = schools.find((school) =>
        school.hasMany('courses').ids().includes(course.id),
      );

      if (schoolForCourse) {
        schoolIds = [...schoolIds, schoolForCourse.id];
      }
    });
    //use a Set to remove duplicates
    return [...new Set(schoolIds)];
  }

  get reportResultsComponent() {
    switch (this.selectedReportValue) {
      case 'sessionObjectives':
        return ensureSafeComponent(SessionObjectives, this);
      case 'sessionOfferings':
        return ensureSafeComponent(SessionOfferings, this);
      case 'learnerGroups':
        return ensureSafeComponent(LearnerGroups, this);
      case 'instructionalTime':
        return ensureSafeComponent(InstructionalTime, this);
      case 'taggedTerms':
        return ensureSafeComponent(TaggedTerms, this);
    }

    return false;
  }

  pickCourse = (id) => {
    this.args.setSelectedCourseIds([...this.passedCourseIds, Number(id)].sort());
  };

  removeCourse = (id) => {
    this.args.stop();
    this.args.setSelectedCourseIds(this.passedCourseIds.filter((i) => i !== Number(id)).sort());
  };

  removeAll = () => {
    this.args.stop();
    this.args.setSelectedCourseIds();
  };

  changeSelectedReport = (value) => {
    this.args.stop();
    this.args.setReport(value);
  };
  <template>
    <div class="reports-curriculum main-section" data-test-reports-curriculum ...attributes>
      {{#if @showReportResults}}
        <this.reportResultsComponent @courses={{this.selectedCourses}} @close={{@stop}} />
      {{else}}
        <Header
          @selectedSchoolIds={{this.selectedSchoolIds}}
          @countSelectedCourses={{@selectedCourseIds.length}}
          @showReportResults={{@showReportResults}}
          @selectedReportValue={{this.selectedReportValue}}
          @changeSelectedReport={{this.changeSelectedReport}}
          @runReport={{@run}}
          @close={{@stop}}
        />
        <ChooseCourse
          @selectedCourseIds={{@selectedCourseIds}}
          @schools={{@schools}}
          @add={{this.pickCourse}}
          @remove={{this.removeCourse}}
          @removeAll={{this.removeAll}}
        />
      {{/if}}
    </div>
  </template>
}

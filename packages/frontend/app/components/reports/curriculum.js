import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { ensureSafeComponent } from '@embroider/util';
import SessionObjectives from './curriculum/session-objectives';
import LearnerGroups from './curriculum/learner-groups';

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

  get reportResultsComponent() {
    switch (this.selectedReportValue) {
      case 'sessionObjectives':
        return ensureSafeComponent(SessionObjectives, this);
      case 'learnerGroups':
        return ensureSafeComponent(LearnerGroups, this);
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
}

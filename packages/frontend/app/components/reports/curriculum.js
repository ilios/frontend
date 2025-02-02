import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';

export default class ReportsCurriculumComponent extends Component {
  @service store;
  @service graphql;
  @service router;

  @tracked searchResults = null;
  @tracked reportResults = null;

  get passedCourseIds() {
    return this.args.selectedCourseIds?.map(Number) ?? [];
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

  run = restartableTask(async () => {
    if (!this.passedCourseIds.length) {
      this.reportResults = null;
      return;
    }
    const filters = [`ids: [${this.passedCourseIds.join(', ')}]`];
    const userData = ['id', 'firstName', 'lastName', 'middleName', 'displayName'].join(', ');
    const sessionData = [
      'id',
      'title',
      'sessionType { title }',
      'sessionObjectives { id, title }',
      `offerings { id, startDate, endDate, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
      `ilmSession { id, dueDate, hours, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
    ].join(', ');

    const data = ['id', 'title', 'year', `sessions { ${sessionData} }`];
    const result = await this.graphql.find('courses', filters, data.join(', '));

    this.reportResults = result.data.courses;
  });

  pickCourse = (id) => {
    this.args.setSelectedCourseIds([...this.passedCourseIds, id].sort());
  };

  removeCourse = (id) => {
    this.args.setSelectedCourseIds(this.passedCourseIds.filter((i) => i !== Number(id)).sort());
  };
}
